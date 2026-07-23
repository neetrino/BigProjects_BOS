import { test, expect } from '@playwright/test';
import {
  closeSheet,
  createCycle,
  createDealForOrganization,
  createOrganization,
  kanbanColumn,
  selectCycleInToolbar,
} from './helpers/records';
import { uniqueSuffix } from './helpers/unique';

test.describe('builder CRM', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/builder-sales');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  });

  test('creates deal, moves stage from New to Contacted on kanban', async ({ page }) => {
    const suffix = uniqueSuffix();
    const cycleName = `CRM Cycle ${suffix}`;
    const cycleCode = `CRM-${suffix}`;
    const orgName = `CRM Builder ${suffix}`;

    await createCycle(page, cycleName, cycleCode);
    await createOrganization(page, orgName, 'BUILDER');

    await page.goto('/builder-sales');
    await selectCycleInToolbar(page, cycleName);
    await createDealForOrganization(page, orgName);

    await closeSheet(page, 'Deal');

    const newColumn = kanbanColumn(page, 'New');
    await expect(newColumn.getByText(orgName)).toBeVisible();

    await newColumn.getByText(orgName).click();
    await expect(page.getByRole('dialog', { name: 'Deal' })).toBeVisible();
    await page.getByRole('button', { name: 'Mark contacted' }).click();

    await closeSheet(page, 'Deal');
    await expect(kanbanColumn(page, 'Contacted').getByText(orgName)).toBeVisible();
    await expect(kanbanColumn(page, 'New').getByText(orgName)).toBeHidden();
  });
});
