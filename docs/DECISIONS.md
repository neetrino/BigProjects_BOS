# BigProjects BOS Decisions

## Canonical Decisions

- BOS is separate from ToonExpo Ecosystem.
- BOS is internal only.
- Project size is C — large monorepo.
- Use monorepo layout with `apps/*` and `packages/*`.
- Backend API runs on Google Cloud Run.
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
