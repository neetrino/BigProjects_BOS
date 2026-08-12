import { expect, type Page } from '@playwright/test';

export type CreatedCycle = {
  name: string;
  code: string;
};

export type CreatedOrganization = {
  name: string;
};

export async function createCycle(
  page: Page,
  name: string,
  code: string,
): Promise<CreatedCycle & { id: string }> {
  await page.goto('/cycles');
  await page.getByRole('button', { name: 'New cycle' }).click();
  const sheet = page.getByRole('dialog', { name: 'Create cycle' });
  await sheet.getByLabel('Name', { exact: true }).fill(name);
  await sheet.getByLabel('Code', { exact: true }).fill(code);
  await sheet.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(code, { exact: true }).first()).toBeVisible();

  const cyclesResponse = await page.request.get('/api/v1/cycles');
  expect(cyclesResponse.ok()).toBeTruthy();
  const cycles = (await cyclesResponse.json()) as Array<{ id: string; code: string }>;
  const created = cycles.find((cycle) => cycle.code === code);
  if (!created) {
    throw new Error(`Created cycle ${code} was not returned by the API.`);
  }

  return { name, code, id: created.id };
}

export async function createOrganization(
  page: Page,
  name: string,
  type: 'BUILDER' | 'PARTNER' = 'BUILDER',
): Promise<CreatedOrganization> {
  await page.goto('/organizations');
  await page.getByRole('button', { name: /New organization/i }).click();
  const sheet = page.getByRole('dialog', { name: 'Create organization' });
  await sheet.getByLabel('Name', { exact: true }).fill(name);
  if (type !== 'BUILDER') {
    await sheet.getByRole('button', { name: 'Type', exact: true }).click();
    await page.getByRole('option', { name: type === 'PARTNER' ? 'Partner' : type }).click();
  }
  await sheet.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  return { name };
}

export async function addContactToOrganization(
  page: Page,
  organizationName: string,
  contactName: string,
): Promise<void> {
  await page.goto('/organizations');
  await page.getByText(organizationName, { exact: true }).first().click();
  const sheet = page.getByRole('dialog', { name: 'Organization' });
  await sheet.getByRole('button', { name: 'Add contact' }).click();
  await sheet.locator('#contact-name').fill(contactName);
  await sheet.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(sheet.getByText(contactName)).toBeVisible();
}

export async function selectCycleInToolbar(page: Page, cycleName: string): Promise<void> {
  const switcher = page.getByRole('button', { name: 'Event cycle' });
  await expect(switcher).toBeEnabled({ timeout: 15_000 });
  await switcher.click();
  await page.getByRole('option', { name: new RegExp(`^${escapeRegExp(cycleName)}(?: \\(|$)`) }).click();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function closeSheet(page: Page, title: string): Promise<void> {
  const dialog = page.getByRole('dialog', { name: title });
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(dialog).toBeHidden();
}

export async function createDealForOrganization(
  page: Page,
  organizationName: string,
): Promise<void> {
  await page.getByRole('button', { name: 'New deal' }).first().click();
  const sheet = page.getByRole('dialog', { name: 'Create deal' });
  await sheet.getByPlaceholder('Search organizations').fill(organizationName);
  await sheet.getByRole('option', { name: organizationName, exact: true }).click();
  await sheet.getByRole('button', { name: 'Save' }).click();
  await expect(sheet).toBeHidden({ timeout: 15_000 });
  await expect(page.getByRole('dialog', { name: 'Deal' })).toBeVisible({ timeout: 15_000 });
}

export async function createPartnerForOrganization(
  page: Page,
  organizationName: string,
): Promise<void> {
  await page.getByRole('button', { name: 'New partner' }).first().click();
  const sheet = page.getByRole('dialog', { name: 'Create partner' });
  await sheet.getByPlaceholder('Search organizations').fill(organizationName);
  await sheet.getByRole('option', { name: organizationName, exact: true }).click();
  await sheet.getByRole('button', { name: 'Save' }).click();
  await expect(sheet).toBeHidden({ timeout: 15_000 });
  await expect(page.getByRole('dialog', { name: 'Partner' })).toBeVisible({ timeout: 15_000 });
}

export function kanbanColumn(page: Page, stageTitle: string) {
  return page.locator('section').filter({
    has: page.getByRole('heading', { name: stageTitle, exact: true }),
  });
}
