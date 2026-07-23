import { test, expect } from '@playwright/test';
import { createCycle } from './helpers/records';
import { uniqueSuffix } from './helpers/unique';

test.describe('venue map', () => {
  test('shows create-plan form then upload zone after plan creation', async ({ page }) => {
    await page.goto('/cycles');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();

    const suffix = uniqueSuffix();
    const cycleName = `Map Cycle ${suffix}`;
    const cycleCode = `MAP-${suffix}`;
    const planTitle = `Smoke Plan ${suffix}`;

    const cycle = await createCycle(page, cycleName, cycleCode);

    await page.goto(`/venue-map?cycle=${cycle.id}`);
    await expect(page.getByRole('heading', { name: 'Create venue plan' })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByLabel('Title', { exact: true }).fill(planTitle);
    await page.getByRole('button', { name: 'Create plan' }).click();

    await expect(page.getByText('Upload plan image')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Choose image' })).toBeVisible();
  });
});
