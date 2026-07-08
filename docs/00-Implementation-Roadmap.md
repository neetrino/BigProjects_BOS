# BigProjects BOS Implementation Roadmap

## Phase 0 - Project Setup

- initialize repo and tooling;
- configure environment structure;
- add base layout;
- add auth/account foundation for internal users;
- confirm database and deployment setup.

## Phase 1 - Core Internal Data

- event cycles;
- internal companies;
- contacts;
- deals;
- staff users;
- tasks;
- process templates;
- notes and attachments on entity cards.

## Phase 2 - Internal CRM / Deals

- cycle-specific deal board;
- company cards;
- deal pipeline;
- deal detail sheet;
- onboarding checklist inside deal;
- contact persons;
- internal notes;
- attached documents;
- handoff to ToonExpo account provisioning.

## Phase 3 - Tasks & Processes

- global tasks area;
- configurable work spaces;
- task lists;
- process templates;
- task statuses;
- assignment;
- deadlines;
- blocked work tracking.

## Phase 4 - KPI / Dashboard / Reports

- dashboard widgets;
- staff/team KPI;
- process/task analytics;
- participant onboarding progress;
- reports/exports if needed.

## Phase 5 - ToonExpo Account Provisioning Integration

- account/company creation request from BOS to ToonExpo;
- account creation status response;
- linked ToonExpo company id stored in BOS;
- failed request/retry handling.

## First Deep Module

Start with:

```text
Internal CRM / Deals
```

Reason: company/deal cards become the center for onboarding, tasks, documents, notes and reporting.
