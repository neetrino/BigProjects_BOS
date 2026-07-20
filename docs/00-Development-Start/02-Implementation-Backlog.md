# BOS Implementation Backlog

## Sprint 0 - Foundation

- scaffold monorepo;
- configure pnpm/turbo and one TypeScript 5.9.x baseline across all workspaces;
- configure lint/format/test baseline;
- create app shell;
- create `hy`/`ru`/`en` locale catalogs and locale-safe UI baseline;
- configure env schema;
- add Docker Compose for PostgreSQL 18, MinIO, ClamAV, Mailpit and ToonExpo contract stub;
- scaffold the full NestJS `apps/api` with `/api/v1`, class-validator DTOs, errors, logging, 1 MiB JSON limit and OpenAPI;
- create Prisma 7 baseline owned by NestJS using `@prisma/adapter-pg`, pooled runtime URL and direct migration config;
- generate committed OpenAPI + `packages/api-client/src/generated` fetch SDK/types/Zod with Hey API and add separate browser-mutation/server-read Next.js adapters;
- add CI boundary check preventing Prisma/backend imports from `apps/web`.
- add required format, lint, typecheck, unit, OpenAPI drift, Prisma migration, build, dependency and secret-scan gates;
- implement standard problem responses, request ids, cursor pagination and optimistic concurrency conventions.

## Sprint 1 - Auth And Shell

- internal login/session;
- Admin TOTP, invitation and password-reset flows;
- BOS roles;
- protected routes;
- navigation shell;
- side sheet shell;
- audit-log foundation.

## Sprint 2 - Event Cycles And Builder Sales Core

- event cycle CRUD;
- company/contact CRUD;
- deal CRUD;
- deal board/list by cycle;
- deal sheet.

## Sprint 3 - Partner Relations

- `CycleEngagement` shared context;
- separate `PartnerParticipation` model;
- partner board/list;
- partner card/sheet and short stages;
- notes, attachments and activity.
- private R2 signed upload/download and attachment validation/scan lifecycle.

## Sprint 4 - Venue Map Foundation

- plan upload and normalization;
- 1 m x 1 m grid calibration;
- partial cell classification through sorted non-overlapping row runs;
- Konva editor foundation;
- area create/edit/archive/repartition;
- overlap and connectivity validation.

## Sprint 5 - Space Sales Integration

- assign several areas to BuilderDeal or PartnerParticipation;
- map picker in sheets;
- linked business sheet from map;
- BuilderDeal `won` invariant;
- allocation release/history rules;
- public display modes.

## Sprint 6 - Provisioning

- provisioning request model;
- provisioning worklist and persisted delivery state;
- BOS -> ToonExpo contract client;
- retry/idempotency;
- PostgreSQL-backed due-attempt claiming and scheduled Cloud Run integration-dispatch Job;
- result/status display.

## Sprint 7 - Public Map Publication

- `VenueMapSnapshotV1` contract;
- draft/published version state;
- manual idempotent publish action;
- ToonExpo snapshot response/status;
- retry and audit;
- reuse the scheduled integration dispatcher for publication attempts;
- end-to-end acceptance tests.

## Deferred Product Work

- onboarding checklist;
- tasks and workspaces;
- KPI;
- full dashboard;
- analytics/reports;
- professional visitor routing.
