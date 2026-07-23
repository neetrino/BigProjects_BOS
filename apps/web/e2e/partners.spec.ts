import { test, expect } from '@playwright/test';
import {
  closeSheet,
  createCycle,
  createOrganization,
  createPartnerForOrganization,
  kanbanColumn,
  selectCycleInToolbar,
} from './helpers/records';
import { uniqueSuffix } from './helpers/unique';

test.describe('partners', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/partners');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  });

  test('creates partner participation on kanban', async ({ page }) => {
    const suffix = uniqueSuffix();
    const cycleName = `Partner Cycle ${suffix}`;
    const cycleCode = `PTR-${suffix}`;
    const orgName = `Partner Org ${suffix}`;

    await createCycle(page, cycleName, cycleCode);
    await createOrganization(page, orgName, 'PARTNER');

    await page.goto('/partners');
    await selectCycleInToolbar(page, cycleName);
    await createPartnerForOrganization(page, orgName);

    await closeSheet(page, 'Partner');
    await expect(kanbanColumn(page, 'New').getByText(orgName)).toBeVisible();
  });
});
