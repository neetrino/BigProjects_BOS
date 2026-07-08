# BigProjects BOS Architecture

## Project Size

Size C — large, monorepo layout.

## Purpose

BigProjects BOS is an internal modular business operating system. It is not the ToonExpo public platform.

## Architectural Style

Recommended style: modular monolith split by apps/packages.

```text
apps/web  -> user interface
apps/api  -> API and application services deployed to Google Cloud Run
packages/domain -> business rules
packages/contracts -> DTOs/events/API contracts
packages/db -> Prisma schema/client
packages/ui -> shared UI primitives
packages/shared -> shared utilities
packages/config -> eslint/tsconfig/tailwind/build config
```

## Dependency Rule

```text
apps/* -> packages/*
packages/contracts -> packages/domain types where needed
packages/db -> packages/domain mapping where needed
packages/domain -> no framework imports
packages/ui -> no business persistence
```

Domain must stay framework-independent.

## Main Modules

- Dashboard;
- Event Cycles;
- Internal CRM / Deals;
- Deal Onboarding Checklist;
- Tasks & Processes;
- Staff / Team KPI;
- Analytics / Reports;
- ToonExpo Account Provisioning.

## Data Ownership

BOS owns internal companies, contacts, event cycles, deals, onboarding checklist items, tasks, workspaces, KPI records, reports and provisioning requests.

ToonExpo owns public/builder/product/buyer data.

## Integration Boundary

The only required v1 integration is account/company provisioning:

```text
BOS approved participant deal
-> ToonExpo provisioning request
-> ToonExpo company/user access
-> provisioning result/status back to BOS
```

No broad ToonExpo data sync in v1.

## UI Pattern

BOS follows compact operational UI:

```text
board/list/workspace page -> card/row -> side sheet
linked entity -> stacked sheet
```

Full pages are reserved for real workspaces such as dashboard, CRM board, task workspace and reports.

## Related Docs

- [Tech Card](./TECH_CARD.md)
- [Development Start Pack](./00-Development-Start/01-MVP-Scope-Freeze.md)
- [Dependency Graph](./architecture/DEPENDENCY_GRAPH.md)
- [BOS / ToonExpo Boundary](./03-Integration-With-ToonExpo/01-BOS-ToonExpo-Boundary.md)
