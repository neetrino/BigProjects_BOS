import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const REQUIRED_SEED_ENV_VARS = [
  'SEED_ADMIN_EMAIL',
  'SEED_ADMIN_PASSWORD',
  'SEED_ADMIN_NAME',
] as const;

function requireSeedEnv(): {
  email: string;
  password: string;
  name: string;
} {
  const missing = REQUIRED_SEED_ENV_VARS.filter((key) => {
    const value = process.env[key];
    return value === undefined || value.trim() === '';
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required seed env vars: ${missing.join(', ')}. Set them in the root .env before running db:seed.`,
    );
  }

  return {
    email: process.env.SEED_ADMIN_EMAIL!.trim(),
    password: process.env.SEED_ADMIN_PASSWORD!.trim(),
    name: process.env.SEED_ADMIN_NAME!.trim(),
  };
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to run the seed script.');
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export async function seedAdmin(prisma: PrismaClient): Promise<void> {
  const { email, password, name } = requireSeedEnv();
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
    // Idempotent: never overwrite an existing user's password.
    update: {},
  });
}

async function main(): Promise<void> {
  const prisma = createPrismaClient();

  try {
    await seedAdmin(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Seed failed: ${message}`);
  process.exit(1);
});
