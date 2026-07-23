# Implementation Roadmap

## Delivery Rule

Implement one phase, demonstrate its acceptance flow, fix real defects, then continue. Do not add future modules or global refactors between phases.

## Phase 0 - Foundation

- pnpm workspace;
- `apps/web` Next.js;
- `apps/api` NestJS;
- Prisma and PostgreSQL;
- basic CI: format, lint, typecheck, test and build;
- local Docker PostgreSQL;
- environment templates;
- Armenian, Russian and English foundation.

Stop condition: both applications start and the web can call NestJS health.

## Phase 1 - Auth And Core Records

- Admin and Staff;
- login/logout and secure sessions;
- staff account management;
- Event Cycles;
- Organizations;
- Contacts.

Stop condition: Admin can create a Staff user, cycle, company and contact.

## Phase 2 - Builder Sales CRM

- Kanban and list;
- deal create/edit sheet;
- stage changes;
- responsible staff;
- notes and attachments.

Stop condition: a deal can move from `new` to `negotiation`; `won` remains blocked until map allocation exists.

## Phase 3 - Partner Relations

- separate lightweight Kanban and list;
- partner create/edit sheet;
- shorter stage flow;
- notes and attachments;
- optional area section prepared.

Stop condition: partner workflow works independently and does not appear in Builder Sales.

## Phase 4 - Venue Sales Map

- image upload;
- calibration;
- 1 m x 1 m grid;
- pan and zoom;
- rectangular cell selection;
- area create/edit/delete;
- assignments from map and sheets;
- `won` rule;
- public display mode.

Stop condition: create a 25 m2 area, assign it to a deal and move the deal to `won`.

## Phase 5 - ToonExpo Integration

- manual company/account request;
- duplicate-safe link result;
- manual map publish;
- simple status, error and retry.

Stop condition: local ToonExpo stub accepts one account and one map update without creating duplicates.

## Phase 6 - Release Check

- owner walkthrough;
- critical bug fixes;
- small Playwright smoke suite;
- staging deployment;
- production configuration checklist.

Stop condition: [Release 1 Acceptance Criteria](./07-ACCEPTANCE.md) pass.

## Future Scope

Tasks, onboarding checklist, KPI, dashboard, analytics, reports and visitor routing may be discussed later. They are not placeholders to implement during Release 1.
