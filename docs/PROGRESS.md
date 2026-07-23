# BigProjects BOS Progress

## Current State

- branch: `bos-simple-v1`;
- Phase 0 (Foundation) and Phase 1 (Auth And Core Records) are complete and verified;
- session auth (Argon2id, 7-day sliding server-side sessions, HTTP-only cookie, login rate
  limit, Origin-based CSRF guard) with Admin/Staff roles;
- admin user management, Event Cycles, Organizations and Contacts modules in NestJS;
- web app: login, guarded app shell with sidebar, cycles / organizations / settings pages,
  same-origin `/api` proxy via Next.js rewrites, hy/ru/en UI (default hy);
- GitHub Actions CI (format, lint, typecheck, test, build);
- local Docker PostgreSQL runs on port 5433; first admin comes from `pnpm db:seed`;
- format, lint, typecheck, tests and production builds all pass;
- previous enterprise implementation remains in `sipan` (reference only).

## Next Gate

1. Wait for owner approval to start Phase 2 (Builder Sales CRM) from
   [Implementation Roadmap](./06-IMPLEMENTATION-ROADMAP.md).
2. Phase 2 stop condition: a deal can move from `new` to `negotiation`; `won` remains blocked
   until a map allocation exists.

Do not copy the old architecture wholesale from `sipan`. Reuse individual UI or map components
only after reviewing them against the new documents.
