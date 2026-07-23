# BigProjects BOS Development Handoff

## Handoff Status

| Item | Current decision |
| --- | --- |
| Active branch | `bos-simple-v1` |
| Documentation baseline | `52108fa docs: reset BOS to simple Size B scope` |
| Project state | Documentation is ready; implementation has not started on this branch |
| Product size | Size B, simple feature-based application |
| Expected users | Approximately 20 internal employees |
| Next action | Implement Phase 0 only |
| Old implementation | Preserved in `sipan`; reference only |

This is the first document a developer or AI agent must read before starting BigProjects BOS.

## Immediate Instruction

Build BOS as a new, focused internal product from the active `bos-simple-v1` branch.

Do not restore the old application from `sipan`. Do not use deleted documents or Git history as
requirements. Do not redesign the architecture before completing the documented phases.

The first development task is **Phase 0 - Foundation** from
[Implementation Roadmap](./06-IMPLEMENTATION-ROADMAP.md). Stop when its stated condition passes.

## What Happened

### Early planning described a larger future product

The original documentation included possible future modules such as:

- Task Management and workspaces;
- onboarding checklists;
- KPI;
- dashboards, analytics and reports;
- broader operational workflows;
- advanced integration processing.

Those ideas were planning material, not the required first release.

### Release 1 was narrowed

The owner confirmed that the immediate BOS product is:

1. Builder Sales CRM;
2. Partner Relations;
3. Venue Sales Map connected to CRM and partner records;
4. two small manual integrations with ToonExpo.

BOS is used by approximately 20 employees. It does not need enterprise-scale infrastructure.

### The previous implementation became overengineered

The former documentation and code introduced architecture intended for a much larger system,
including excessive layers, generated contracts, advanced authentication, background processing
and audit/event concepts.

That direction made development slower and obscured the real product.

### The repository was reset

The active documentation was rebuilt on `bos-simple-v1` in commit `52108fa`.

The reset:

- reduced active documentation from 161 documents to 15 focused specifications;
- removed approximately 91% of the old documentation text;
- removed the previous application code from this branch;
- preserved the old implementation in `sipan` only for selective reference;
- fixed the project at Size B;
- established a strict Next.js frontend / NestJS backend boundary;
- defined exactly two Kanban boards and one map editor.

## Documentation Authority

Use the active documents in this order:

1. [Release 1 Scope](./00-SCOPE.md)
2. [Architecture](./01-ARCHITECTURE.md)
3. [Tech Card](./TECH_CARD.md)
4. [Data Model](./02-DATA-MODEL.md)
5. [Roles](./03-ROLES.md)
6. [Module Specifications](./modules/)
7. [Screens And UX](./04-SCREENS-AND-UX.md)
8. [ToonExpo Integration](./05-TOONEXPO-INTEGRATION.md)
9. [Implementation Roadmap](./06-IMPLEMENTATION-ROADMAP.md)
10. [Acceptance Criteria](./07-ACCEPTANCE.md)

This handoff explains context and development procedure. It does not replace the linked
specifications.

If an ambiguity remains:

- prefer the smallest implementation satisfying the visible workflow;
- preserve every explicit Release 1 exclusion;
- do not infer requirements from `sipan`;
- ask the owner only when a choice changes product behavior.

## Final Release 1 Boundary

### Shared records

Release 1 needs:

- internal Users and Sessions;
- Event Cycles;
- Organizations;
- Contacts;
- Notes and Attachments inside business sheets.

Organizations and contacts may be reused across cycles. Builder deals, partner participation and
the venue plan are cycle-specific.

### Working areas

BOS has exactly:

1. Builder Sales;
2. Partner Relations;
3. Venue Map.

There are exactly two Kanban boards:

1. Builder Sales;
2. Partner Relations.

The Venue Map is an editor, not a third Kanban. There is no dashboard in Release 1.

### Builder Sales

Builder Sales manages companies purchasing venue space.

```text
new -> contacted -> negotiation -> won
                             \-> lost
```

Critical backend invariant:

```text
A Builder Deal cannot become won without an active venue-space allocation.
```

The full record, card, sheet and status requirements are in
[Builder Sales CRM](./modules/02-BUILDER-CRM.md).

### Partner Relations

Partners and banks use a separate, smaller workflow:

```text
new -> contacted -> confirmed
                 \-> declined
```

Partner Relations may reuse visual components from Builder Sales, but it uses the separate
`PartnerParticipation` entity. Do not create fake Builder Deals for partners.

A venue area is optional for a partner and does not block `confirmed`.

See [Partner Relations](./modules/03-PARTNERS.md).

### Venue Map

The map requirements are intentionally bounded:

- one plan image per event cycle;
- PNG, JPG or WebP input;
- manual calibration to a `1 m x 1 m` grid;
- rectangular cell selection;
- calculated square meters;
- free, builder-allocated or partner-allocated areas;
- one or several areas per Builder Deal;
- optional partner allocation;
- release and recreate instead of a generic split/merge engine;
- public display mode: organization, custom label or hidden.

Area state is derived from allocation data. Do not add another editable sold/status field.

No polygon editor, routing, check-in, QR or live positioning belongs to BOS Release 1.

See [Venue Sales Map](./modules/04-VENUE-MAP.md).

### ToonExpo integration

BOS and ToonExpo are separate products with separate databases.

BOS performs only two manual integration actions:

1. request ToonExpo company/account creation;
2. publish the current public venue map.

Both actions use simple status, readable errors and a manual Retry button. Duplicate prevention
uses stable company/user identifiers and map versions.

Do not build a queue, scheduler, generic idempotency platform or automatic retry engine.

See [ToonExpo Integration](./05-TOONEXPO-INTEGRATION.md).

## Fixed Architecture

```text
Browser -> apps/web (Next.js) -> apps/api (NestJS) -> Prisma -> PostgreSQL
```

### `apps/web`

Next.js owns:

- pages and navigation;
- localization;
- forms, sheets, tables and Kanban interaction;
- venue-map interaction;
- a small handwritten typed API client.

Next.js must not:

- import Prisma;
- access PostgreSQL;
- own authoritative business rules;
- implement BOS product mutations in Next.js route handlers.

### `apps/api`

NestJS owns:

- login, sessions and authorization;
- input validation;
- all business rules;
- all Prisma and database access;
- attachment metadata and signed upload operations;
- ToonExpo HTTP calls;
- Swagger/OpenAPI documentation.

Use this backend shape by default:

```text
feature/
  feature.controller.ts
  feature.service.ts
  dto/
```

The service may call Prisma directly. Add a repository only after a real query or testing problem
requires it.

Do not create domain/application/infrastructure layers, mappers, commands, policies or
orchestrators for ordinary CRUD.

### Repository shape

Begin with:

```text
bigprojects-bos/
  apps/
    web/
    api/
  prisma/
    schema.prisma
    migrations/
  docs/
```

Do not create shared packages during scaffolding. Add one only after real duplication appears.

### Providers

Use the confirmed versions and providers in [Tech Card](./TECH_CARD.md):

- frontend: Vercel;
- backend: Google Cloud Run;
- database: Neon PostgreSQL;
- ORM: Prisma;
- attachments: Cloudflare R2.

Release 1 does not need Redis, a message broker, scheduler, worker or microservices.

## Authentication Boundary

Release 1 has two roles:

- Admin;
- Staff.

Accounts are created by an Admin. Authentication uses email/password, Argon2id hashes and a
server-side PostgreSQL session in a secure HTTP-only cookie.

Basic rate limiting and CSRF protection are normal production safeguards. They do not justify a
larger identity subsystem.

Do not add TOTP, MFA, recovery codes, configurable roles or department-level permissions.

## Development Sequence

Implement one phase, prove its stop condition, then continue.

### Phase 0 - Foundation

Create only:

- pnpm workspace;
- `apps/web` Next.js application;
- `apps/api` NestJS application;
- Prisma and local PostgreSQL connection;
- NestJS `/health` endpoint;
- one frontend call to the NestJS health endpoint;
- environment templates;
- format, lint, typecheck, test and build commands;
- Armenian, Russian and English localization foundation.

Stop when both applications start and the frontend can call NestJS health.

Do not scaffold business modules, shared packages or future placeholders in Phase 0.

### Later phases

After Phase 0:

1. authentication and core records;
2. Builder Sales;
3. Partner Relations;
4. Venue Map;
5. ToonExpo integration;
6. release verification.

The exact work and stop conditions are in
[Implementation Roadmap](./06-IMPLEMENTATION-ROADMAP.md).

## Explicitly Forbidden In Release 1

Do not implement or scaffold:

- Task Management or workspaces;
- onboarding checklist;
- KPI;
- dashboard widgets;
- analytics or reports;
- configurable pipelines;
- complex role builders;
- TOTP/MFA or recovery codes;
- generated frontend OpenAPI SDK;
- DDD layer stacks for CRUD;
- Redis;
- queues, schedulers or workers;
- automatic integration retries;
- event sourcing or audit projections;
- public check-in;
- QR functionality;
- indoor routing or live positioning;
- ToonExpo buyer, Constructor CRM or Readiness features;
- building, floor or apartment maps;
- polygon map editing.

These exclusions are not components to prepare for future use.

## Rules For Using `sipan`

`sipan` is not an implementation base.

An individual UI or map component may be inspected only when:

1. the active phase needs it;
2. it matches current behavior;
3. it can be separated from the old architecture;
4. its dependencies are proportionate;
5. copying it is simpler than implementing the small required behavior.

Never copy the old architecture, authentication, database schema, infrastructure, generated
contracts or background-processing setup wholesale.

## AI Working Procedure

Before coding:

1. confirm the branch is `bos-simple-v1`;
2. read `AGENTS.md`;
3. read this handoff;
4. read only the canonical documents relevant to the current phase;
5. inspect the repository;
6. state the small implementation slice being started.

During development:

- keep only one phase in progress;
- keep business rules in NestJS;
- do not add a dependency without immediate use;
- do not create placeholder future modules;
- prefer framework conventions over custom abstractions;
- stop when the phase condition passes;
- update [Progress](./PROGRESS.md).

Before reporting a phase complete:

- run format and lint checks;
- run typecheck;
- run relevant tests;
- run production builds;
- verify the stop condition;
- report anything not verified.

There is no arbitrary global coverage target. Test depth follows business risk.

## First Cursor Task

Give Cursor this instruction:

```text
Read AGENTS.md and docs/00-DEVELOPMENT-HANDOFF.md, then read the canonical documents linked from
docs/README.md. Confirm that the active branch is bos-simple-v1.

Implement only Phase 0 from docs/06-IMPLEMENTATION-ROADMAP.md:
- pnpm workspace;
- apps/web as Next.js frontend only;
- apps/api as the complete NestJS backend;
- Prisma with local PostgreSQL;
- NestJS health endpoint and one frontend health call;
- environment templates;
- format/lint/typecheck/test/build commands;
- Armenian, Russian and English localization foundation.

Do not copy the sipan architecture. Do not add business modules, shared packages, generated API
clients, Redis, queues, MFA, DDD layers or future-scope placeholders.

Run all Phase 0 checks and stop when its stop condition passes. Report created files, commands,
results and any blocker.
```

## Correct Start Checklist

Development has started correctly when:

- [ ] active branch is `bos-simple-v1`;
- [ ] only Phase 0 has been implemented;
- [ ] Next.js contains frontend responsibilities only;
- [ ] NestJS owns the API and future backend boundary;
- [ ] only NestJS can reach Prisma;
- [ ] no architecture was copied wholesale from `sipan`;
- [ ] no future module was scaffolded;
- [ ] workspace checks pass;
- [ ] the developer stops before Phase 1.

