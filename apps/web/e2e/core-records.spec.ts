import { test, expect } from '@playwright/test';
import {
  addContactToOrganization,
  createCycle,
  createOrganization,
} from './helpers/records';
import { uniqueSuffix } from './helpers/unique';

test.describe('core records', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cycles');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  });

  test('creates event cycle, organization, and contact', async ({ page }) => {
    const suffix = uniqueSuffix();
    const cycleName = `Smoke Cycle ${suffix}`;
    const cycleCode = `SMK-${suffix}`;
    const orgName = `Smoke Org ${suffix}`;
    const contactName = `Smoke Contact ${suffix}`;

    await createCycle(page, cycleName, cycleCode);
    await createOrganization(page, orgName, 'PARTNER');
    await addContactToOrganization(page, orgName, contactName);

    await page.goto('/organizations');
    await page.getByPlaceholder('Search by name').fill(orgName);
    await expect(page.getByRole('row').filter({ hasText: orgName })).toBeVisible();
  });
});
