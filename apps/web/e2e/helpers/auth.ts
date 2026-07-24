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

/** Switch UI to English so role/label selectors stay stable across locales. */
export async function switchToEnglish(page: Page): Promise<void> {
  const english = page.getByRole('button', { name: 'English' });
  if (await english.isVisible()) {
    await english.click();
    await expect(page.getByRole('navigation', { name: 'Main navigation' }))
      .toBeVisible({
        timeout: 15_000,
      })
      .catch(async () => {
        await expect(page.getByLabel('Email')).toBeVisible({ timeout: 15_000 });
      });
  }
}

export async function loginAsAdmin(page: Page): Promise<void> {
  const { email, password } = adminCredentials();
  await page.goto('/login');
  await switchToEnglish(page);
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
