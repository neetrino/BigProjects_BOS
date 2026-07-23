import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { test as setup } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

const authFile = path.join(__dirname, '.auth/admin.json');

setup('authenticate as admin', async ({ page }) => {
  mkdirSync(path.dirname(authFile), { recursive: true });
  await loginAsAdmin(page);
  await page.context().storageState({ path: authFile });
});
