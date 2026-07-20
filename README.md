# BigProjects BOS

BigProjects BOS is the internal Business Operating System for BigProjects.

This repository is for BOS only.

## Scope

In scope:

- Event Cycles and Organizations/Contacts;
- Builder Sales CRM;
- separate Partner Relations pipeline;
- interactive 1 m x 1 m Venue Sales Map;
- deal/partner space allocations;
- ToonExpo account provisioning;
- public venue-map snapshot publication.

Out of scope:

- ToonExpo public website;
- buyer/visitor mobile app;
- builder public portal;
- constructor CRM sales module;
- builder readiness scoring;
- QR/event check-in implementation.
- professional visitor routing in the current release.

## Documentation

Start here:

- [Brief](./docs/BRIEF.md)
- [Tech Card](./docs/TECH_CARD.md)
- [Architecture](./docs/01-ARCHITECTURE.md)
- [Frontend / Backend Boundary](./docs/architecture/FRONTEND_BACKEND_BOUNDARY.md)
- [Development Start Pack](./docs/00-Development-Start/01-Production-Scope.md)
- [Documentation Hub](./docs/00-Documentation-Hub.md)
- [BOS Overview](./docs/01-BigProjects-BOS/00-BOS-Overview.md)
- [BOS / ToonExpo Boundary](./docs/03-Integration-With-ToonExpo/01-BOS-ToonExpo-Boundary.md)

## Project Size

Size C — large monorepo (`apps/*`, `packages/*`).

Production code should start only after `docs/TECH_CARD.md` stack choices are confirmed.

Runtime boundary: `apps/web` is a Next.js frontend; `apps/api` is the complete NestJS backend and the only runtime allowed to access Prisma/PostgreSQL.

## Rule

Do not implement ToonExpo Ecosystem modules in this repository.
