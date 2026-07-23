# BigProjects BOS Progress

## Current State

- branch: `bos-simple-v1`;
- Phases 0-5 (Foundation, Auth And Core Records, Builder Sales CRM, Partner Relations,
  Venue Sales Map, ToonExpo Integration) are complete and verified;
- ToonExpo Integration: `toonexpo` NestJS module — manual account provisioning against the
  real ToonExpo wire contract (`x-bos-api-key`, snake_case, idempotent `request_id`, retry
  for failed only, eligibility = won deal or confirmed partner in the cycle), manual venue
  map publication as `VenueMapSnapshotV1` (monotonic versions, canonical-JSON checksum,
  privacy per display mode), `ToonExpoProvisioningRequest`/`VenueMapPublication` tables,
  local stub (`pnpm toonexpo:stub`, port 4100) satisfying the acceptance criteria; web UI:
  ToonExpo account section in deal/partner sheets and an admin publication block with
  history on `/venue-map`;
- increment 4.1: map areas are colored by the linked deal/partner stage via the shared
  palette in `apps/web/src/lib/stage-colors.ts` (also used by both kanbans); the map area
  panel shows the stage badge plus deal amount, expected m² and primary contact;
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

1. Phase 6 (Release Check) from
   [Implementation Roadmap](./06-IMPLEMENTATION-ROADMAP.md): owner walkthrough, critical
   bug fixes, small Playwright smoke suite, staging deployment, production configuration
   checklist. Staging/production credentials (Neon, R2, Cloud Run, real ToonExpo API key)
   are owner-provided inputs.
2. Local `.env` note: `NODE_ENV` must NOT be set in `.env` — it breaks `next build` when
   exported; framework commands manage it themselves.

Do not copy the old architecture wholesale from `sipan`. Reuse individual UI or map components
only after reviewing them against the new documents.
