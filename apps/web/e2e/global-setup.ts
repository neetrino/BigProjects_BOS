import { execSync } from 'node:child_process';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';

const repoRoot = path.resolve(__dirname, '../../..');

loadEnv({ path: path.join(repoRoot, '.env') });

export default async function globalSetup(): Promise<void> {
  execSync('pnpm db:seed', { cwd: repoRoot, stdio: 'inherit', env: process.env });
}
