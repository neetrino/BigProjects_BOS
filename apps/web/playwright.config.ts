/**
 * BigProjects BOS smoke suite (Playwright).
 *
 * Prerequisite: build both apps once — `pnpm -r build` from the repo root.
 *
 * Run from repo root: `pnpm test:e2e`
 * Run from apps/web:  `pnpm test:e2e`
 *
 * Starts NestJS (port 4000) and Next.js production server (port 3000) when they
 * are not already listening. Reuses existing local servers during development.
 * Requires root `.env` (DATABASE_URL, SEED_ADMIN_* etc.) and docker postgres/minio.
 */
import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

const repoRoot = path.resolve(__dirname, '../..');
loadEnv({ path: path.join(repoRoot, '.env') });

const apiDir = path.join(repoRoot, 'apps/api');

const WEB_PORT = 3000;
const API_PORT = 4000;
const WEB_BASE_URL = `http://localhost:${WEB_PORT}`;
const API_HEALTH_URL = `http://localhost:${API_PORT}/api/v1/health`;

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 1,
  workers: 1,
  reporter: [['list']],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: WEB_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      testIgnore: [/auth\.setup\.ts/, /auth\.spec\.ts/],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(__dirname, 'e2e/.auth/admin.json'),
      },
    },
    {
      name: 'auth',
      testMatch: /auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'node dist/main.js',
      cwd: apiDir,
      url: API_HEALTH_URL,
      reuseExistingServer: true,
      timeout: 120_000,
      env: {
        ...process.env,
        API_PORT: String(API_PORT),
        WEB_URL: WEB_BASE_URL,
      },
    },
    {
      command: 'pnpm start',
      cwd: __dirname,
      url: `${WEB_BASE_URL}/login`,
      reuseExistingServer: true,
      timeout: 120_000,
      env: {
        ...process.env,
        API_URL: `http://localhost:${API_PORT}`,
      },
    },
  ],
});
