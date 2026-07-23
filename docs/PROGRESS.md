# BigProjects BOS Progress

## Current State

- branch: `bos-simple-v1`;
- Phases 0-3 (Foundation, Auth And Core Records, Builder Sales CRM, Partner Relations) are
  complete and verified;
- Partner Relations: separate lightweight Kanban (`new -> contacted -> confirmed/declined`,
  no area required for confirmed), shared kanban/card-shell components reused from Builder
  Sales, partner notes and attachments;
- Builder Sales: Kanban (dnd-kit) + list, deal sheet (details draft editing, stage actions,
  notes, attachments), stage machine with the `won` allocation block (real check in Phase 4);
- attachments use MinIO locally (S3-compatible; R2-ready env), presigned upload/download;
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

1. Continue with Phase 4 (Venue Sales Map) from
   [Implementation Roadmap](./06-IMPLEMENTATION-ROADMAP.md) (owner approved phase-by-phase
   continuation).
2. Phase 4 stop condition: create a 25 m2 area, assign it to a deal and move the deal to
   `won`.

Do not copy the old architecture wholesale from `sipan`. Reuse individual UI or map components
only after reviewing them against the new documents.
