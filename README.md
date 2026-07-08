# BigProjects BOS

BigProjects BOS is the internal Business Operating System for BigProjects.

This repository is for BOS only.

## Scope

In scope:

- internal dashboard;
- internal CRM / deals;
- tasks and processes;
- staff / team KPI;
- participant onboarding;
- analytics / reports;
- ToonExpo account provisioning integration.

Out of scope:

- ToonExpo public website;
- buyer/visitor mobile app;
- builder public portal;
- constructor CRM sales module;
- builder readiness scoring;
- QR/event check-in implementation.

## Documentation

Start here:

- [Brief](./docs/BRIEF.md)
- [Tech Card](./docs/TECH_CARD.md)
- [Architecture](./docs/01-ARCHITECTURE.md)
- [Development Start Pack](./docs/00-Development-Start/01-MVP-Scope-Freeze.md)
- [Documentation Hub](./docs/00-Documentation-Hub.md)
- [BOS Overview](./docs/01-BigProjects-BOS/00-BOS-Overview.md)
- [BOS / ToonExpo Boundary](./docs/03-Integration-With-ToonExpo/01-BOS-ToonExpo-Boundary.md)

## Project Size

Size C — large monorepo (`apps/*`, `packages/*`).

Production code should start only after `docs/TECH_CARD.md` stack choices are confirmed.

## Rule

Do not implement ToonExpo Ecosystem modules in this repository.
