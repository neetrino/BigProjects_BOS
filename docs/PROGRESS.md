# BigProjects BOS Progress

## Current State

- branch: `bos-simple-v1`;
- Phases 0-4 (Foundation, Auth And Core Records, Builder Sales CRM, Partner Relations,
  Venue Sales Map) are complete and verified;
- Venue Sales Map: `VenuePlan`/`SpaceArea`/`SpaceAreaCell`/`SpaceAllocation` schema with DB
  constraints (exactly one owner, one active allocation per area, no overlapping cells);
  NestJS `venue-map` module (plan per cycle, presigned image upload, calibration, rectangular
  area creation with overlap validation, allocations, release, `releaseAreas` on lost); the
  `won` rule is now a real allocation check; Konva editor on `/venue-map` (grid math adapted
  from `sipan` without rotation, pan/zoom, two-point calibration, drag-to-create areas,
  assign/release from the map panel and from deal/partner sheets); verified end to end in the
  browser (drag-create area -> assign -> deal to `won`);
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

1. Increment 4.1 (owner requested): area colors on the map derived from the linked deal's
   CRM stage plus short deal info in the area panel; the stage color palette is a pending
   owner decision and will be shared between the CRM kanban and the map.
2. Then Phase 5 (ToonExpo Integration) from
   [Implementation Roadmap](./06-IMPLEMENTATION-ROADMAP.md): manual company/account request,
   manual map publish, duplicate-safe results, simple status/error/retry.

Do not copy the old architecture wholesale from `sipan`. Reuse individual UI or map components
only after reviewing them against the new documents.
