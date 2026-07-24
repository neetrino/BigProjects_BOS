import { test, expect } from '@playwright/test';
import { adminCredentials, logout, switchToEnglish } from './helpers/auth';

test.describe('auth', () => {
  test('login shows app shell, logout redirects, wrong password shows error', async ({ page }) => {
    const { email, password } = adminCredentials();

    await page.goto('/login');
    await switchToEnglish(page);

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/builder-sales/);
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Builder Sales' })).toBeVisible();

    await logout(page);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('definitely-wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.locator('p[role=alert]')).toHaveText('Invalid email or password.');
  });
});
