import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/bos';

/**
 * Prisma 7 keeps the connection URL here (not in schema.prisma).
 * Copy `.env.example` to `.env` at the repo root for local development.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
  },
});
