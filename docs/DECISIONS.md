# BigProjects BOS Decisions

## Canonical Decisions

- BOS is separate from ToonExpo Ecosystem.
- BOS is internal only.
- Release 1 is a single-tenant BigProjects system; participant Organizations are business records, not security tenants.
- Project size is C — large monorepo.
- Use monorepo layout with `apps/*` and `packages/*`.
- BigProjects BOS is a full production product; no MVP/prototype delivery model.
- `apps/web` is a Next.js 16.2.x frontend only.
- `apps/api` is the complete NestJS 11.1.x backend and runs on Google Cloud Run.
- Only NestJS may access Prisma/PostgreSQL or implement product APIs and mutations.
- TypeScript 5.9.x strict is the single monorepo compiler baseline; TypeScript 6 requires a separate full compatibility PR.
- NestJS class-validator DTOs are the only manually authored HTTP contract; OpenAPI is generated from them.
- NestJS Swagger writes committed `packages/api-client/openapi.json`; `@hey-api/openapi-ts` generates committed web-facing fetch functions, TypeScript models and Zod schemas under `src/generated`. CI regenerates both and rejects drift/manual generated edits. Browser Zod remains UX-only; browser cookie/CSRF mutations and server-only reads use separate adapters under `apps/web/src/lib/api-client/`.
- `packages/contracts` contains only framework-neutral enums/constants, not DTO validators or business rules.
- PostgreSQL 18.x on Neon and Prisma ORM 7.x are the data baseline.
- Prisma runtime uses one container-scoped client with `@prisma/adapter-pg` and pooled `DATABASE_URL`; only the protected migration job receives direct `DIRECT_URL` through `prisma.config.ts`.
- Organization is long-lived; CycleEngagement is cycle-specific.
- BuilderDeal and PartnerParticipation are separate entities, tables and pipelines.
- BuilderDeal `won` requires an active SpaceAllocation; partner space is optional.
- BOS owns the calibrated 1 m x 1 m Venue Sales Map and map authoring.
- Admin and Staff can author sellable areas; only Admin can publish.
- Venue cell classification uses partial active-revision row-run PATCH commands; omitted cells remain unchanged and explicit `unknown` clears a range.
- ToonExpo stores and renders an immutable public `VenueMapSnapshotV1` from its own database.
- No separate Files/Documents module in Release 1.
- Tasks, onboarding checklist, KPI, full dashboard and analytics are later phases.
- Release 1 integrations are account provisioning and public venue-map publication.
- Authentication is invite-only email/password with mandatory Admin TOTP and opaque PostgreSQL-backed sessions in secure cookies.
- Cloudflare R2, Resend, Sentry and GitHub Actions are confirmed Release 1 providers/tooling; Resend is for BOS auth email only.
- Provisioning is an explicit user action after a successful business stage; ToonExpo owns participant access delivery.
- Contract and payment status fields are included as lightweight Release 1 metadata, without accounting/payment processing.
- Referenced business records are archived rather than hard-deleted; audit events and publication identity/payload/checksum are immutable while attempt/result metadata can advance.
- Incoming JSON is globally limited to 1 MiB; file bytes use direct signed R2 transport.
- Cloud Run `europe-west3` and Neon AWS `eu-central-1` are the Frankfurt deployment pair, subject to staging latency verification rather than an asserted RTT.

## External Delivery Prerequisites

- provider accounts, credentials and DNS values;
- ToonExpo staging endpoint/service credential;
- named human owners for deployment approvals.

These are environment/coordination inputs and do not change the accepted product or architecture baseline.

## Source Docs

- [Decisions And Scope](./00-Decisions-And-Scope.md)
- [Consistency Audit](./00-Consistency-Audit.md)
- [Tech Card](./TECH_CARD.md)
- [Implementation Readiness](./00-Development-Start/09-Implementation-Readiness.md)
