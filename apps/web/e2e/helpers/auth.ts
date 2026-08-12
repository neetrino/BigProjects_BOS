import { expect, type Page } from '@playwright/test';

export function adminCredentials(): { email: string; password: string } {
  const email = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in the repo root .env for e2e tests.',
    );
  }

  return { email, password };
}

/** Force English so role/label selectors stay stable across DEFAULT_LOCALE. */
export async function switchToEnglish(page: Page): Promise<void> {
  await page.context().addCookies([
    {
      name: 'locale',
      value: 'en',
      url: 'http://localhost:3000',
    },
  ]);

  const english = page.getByRole('button', { name: 'ENG' });
  if (await english.isVisible().catch(() => false)) {
    await english.click();
    await expect(page.getByRole('navigation', { name: 'Main navigation' }))
      .toBeVisible({
        timeout: 15_000,
      })
      .catch(async () => {
        await expect(page.getByLabel('Email')).toBeVisible({ timeout: 15_000 });
      });
    return;
  }

  // Login has no language switcher — cookie + reload is enough.
  if (page.url().includes('/login')) {
    await page.reload();
  }
}

export async function loginAsAdmin(page: Page): Promise<void> {
  const { email, password } = adminCredentials();
  await page.context().addCookies([
    {
      name: 'locale',
      value: 'en',
      url: 'http://localhost:3000',
    },
  ]);
  await page.goto('/login');
  await expect(page.getByLabel('Email')).toBeVisible({ timeout: 15_000 });
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/builder-sales/);
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
}

export async function logout(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login/);
}
