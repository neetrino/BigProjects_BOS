# BOS Implementation Backlog

## Sprint 0 - Foundation

- scaffold monorepo;
- configure pnpm/turbo/TypeScript;
- configure lint/format/test baseline;
- create app shell;
- configure env schema;
- scaffold the full NestJS `apps/api` with `/api/v1`, validation, errors, logging and OpenAPI;
- create Prisma 7 baseline owned by NestJS;
- add typed NestJS API client for Next.js;
- add CI boundary check preventing Prisma/backend imports from `apps/web`.

## Sprint 1 - Auth And Shell

- internal login/session;
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

## Sprint 4 - Venue Map Foundation

- plan upload and normalization;
- 1 m x 1 m grid calibration;
- cell classification;
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
- provisioning queue;
- BOS -> ToonExpo contract client;
- retry/idempotency;
- result/status display.

## Sprint 7 - Public Map Publication

- `VenueMapSnapshotV1` contract;
- draft/published version state;
- manual idempotent publish action;
- ToonExpo snapshot response/status;
- retry and audit;
- end-to-end acceptance tests.

## Deferred Product Work

- onboarding checklist;
- tasks and workspaces;
- KPI;
- full dashboard;
- analytics/reports;
- professional visitor routing.
