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
- Deal is cycle-specific; company is long-lived.
- Deal onboarding checklist lives inside deal sheet.
- Tasks & Processes owns event preparation work in v1.
- No separate Files/Documents module in v1.
- No broad ToonExpo data sync in v1.
- Main integration is BOS -> ToonExpo account provisioning.

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
