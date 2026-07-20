# BigProjects BOS Decisions

## Canonical Decisions

- BOS is separate from ToonExpo Ecosystem.
- BOS is internal only.
- Project size is C — large monorepo.
- Use monorepo layout with `apps/*` and `packages/*`.
- BigProjects BOS is a full production product; no MVP/prototype delivery model.
- `apps/web` is a Next.js 16.2.x frontend only.
- `apps/api` is the complete NestJS 11.1.x backend and runs on Google Cloud Run.
- Only NestJS may access Prisma/PostgreSQL or implement product APIs and mutations.
- PostgreSQL 18.x on Neon and Prisma ORM 7.x are the data baseline.
- Organization is long-lived; CycleEngagement is cycle-specific.
- BuilderDeal and PartnerParticipation are separate entities, tables and pipelines.
- BuilderDeal `won` requires an active SpaceAllocation; partner space is optional.
- BOS owns the calibrated 1 m x 1 m Venue Sales Map and map authoring.
- Admin and Staff can author sellable areas; only Admin can publish.
- ToonExpo stores and renders an immutable public `VenueMapSnapshotV1` from its own database.
- No separate Files/Documents module in Release 1.
- Tasks, onboarding checklist, KPI, full dashboard and analytics are later phases.
- Release 1 integrations are account provisioning and public venue-map publication.

## Pending Decisions

- final auth approach;
- database provider/account;
- file storage provider/account;
- email provider/account;
- exact CI quality gates for first sprint.

## Source Docs

- [Decisions And Scope](./00-Decisions-And-Scope.md)
- [Consistency Audit](./00-Consistency-Audit.md)
- [Tech Card](./TECH_CARD.md)
