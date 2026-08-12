import { test, expect } from '@playwright/test';
import { createCycle, selectCycleInToolbar } from './helpers/records';
import { uniqueSuffix } from './helpers/unique';

test.describe('global event cycle switcher', () => {
  test('sidebar cycle drives URL across CRM routes', async ({ page }) => {
    const suffix = uniqueSuffix();
    const cycleName = `Global Cycle ${suffix}`;
    const cycleCode = `GLB-${suffix}`;

    const created = await createCycle(page, cycleName, cycleCode);
    const cycleSwitcher = page.getByRole('button', { name: 'Event cycle' });

    await page.goto('/builder-sales');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await expect(cycleSwitcher).toBeEnabled({ timeout: 15_000 });

    // Cycle selector lives in the sidebar, not in page toolbars.
    await expect(page.locator('.toolbar-shell').getByRole('button', { name: 'Event cycle' })).toHaveCount(
      0,
    );

    await selectCycleInToolbar(page, cycleName);
    await expect(page).toHaveURL(new RegExp(`[?&]cycle=${created.id}`));
    await expect(cycleSwitcher).toContainText(cycleName);

    await page.getByRole('link', { name: 'Partners' }).click();
    await expect(page).toHaveURL(new RegExp(`/partners\\?cycle=${created.id}`));
    await expect(cycleSwitcher).toContainText(cycleName);

    await page.getByRole('link', { name: 'Venue Map' }).click();
    await expect(page).toHaveURL(new RegExp(`/venue-map\\?cycle=${created.id}`));
    await expect(cycleSwitcher).toContainText(cycleName);
    await expect(page.locator('main header').getByRole('button', { name: 'Event cycle' })).toHaveCount(
      0,
    );

    await page.getByRole('link', { name: 'Organizations' }).click();
    await expect(page).toHaveURL(new RegExp(`/organizations\\?cycle=${created.id}`));

    await page.getByRole('link', { name: 'Builder Sales' }).click();
    await expect(page).toHaveURL(new RegExp(`/builder-sales\\?cycle=${created.id}`));
    await expect(cycleSwitcher).toContainText(cycleName);
  });
});
