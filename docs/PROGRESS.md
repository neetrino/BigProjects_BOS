# BigProjects BOS Progress

## Current State

- branch: `bos-simple-v1`;
- Phase 0 (Foundation) is complete and verified;
- pnpm workspace with `apps/web` (Next.js 16) and `apps/api` (NestJS 11);
- Prisma 7 connected to local Docker PostgreSQL 18 (no models yet);
- `GET /api/v1/health` returns database status; the web home page renders it;
- Armenian, Russian and English localization foundation (next-intl, cookie-based);
- format, lint, typecheck, test and production build all pass;
- previous enterprise implementation remains in `sipan` (reference only).

## Next Gate

1. Wait for owner approval to start Phase 1 (Auth And Core Records) from
   [Implementation Roadmap](./06-IMPLEMENTATION-ROADMAP.md).
2. Phase 1 stop condition: Admin can create a Staff user, cycle, company and contact.

Do not copy the old architecture wholesale from `sipan`. Reuse individual UI or map components
only after reviewing them against the new documents.
