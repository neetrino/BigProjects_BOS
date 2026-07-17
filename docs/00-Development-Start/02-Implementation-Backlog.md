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

## Sprint 2 - Event Cycles And CRM Core

- event cycle CRUD;
- company/contact CRUD;
- deal CRUD;
- deal board/list by cycle;
- deal sheet.

## Sprint 3 - Onboarding Checklist

- checklist template management;
- deal checklist instance;
- progress counters;
- manual template update action;
- checklist item notes/attachments.

## Sprint 4 - Tasks And Workspaces

- global tasks;
- workspace CRUD;
- workspace board/list;
- task sheet;
- links to cycle/company/deal/checklist item.

## Sprint 5 - Provisioning

- provisioning request model;
- provisioning queue;
- BOS -> ToonExpo contract client;
- retry/idempotency;
- result/status display.

## Sprint 6 - Dashboard Reports KPI

- dashboard widgets;
- staff KPI summaries;
- reports by cycle;
- basic exports if needed.
