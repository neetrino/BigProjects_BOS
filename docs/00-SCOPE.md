# BigProjects BOS Release 1 Scope

## Product Purpose

BigProjects BOS helps approximately 20 internal employees sell ToonExpo venue space and manage the companies involved in each event cycle.

The system has three working areas:

1. Builder Sales CRM;
2. Partner Relations;
3. Venue Sales Map.

There are exactly two Kanban boards: Builder Sales and Partner Relations.

## Included

- internal email/password login;
- two roles: Admin and Staff;
- Armenian, Russian and English UI;
- event cycles;
- organizations and contacts;
- Builder Sales Kanban, list, cards and side sheets;
- Partner Relations Kanban, list, cards and side sheets;
- notes and attachments inside business sheets;
- one venue plan per event cycle in Release 1;
- image-based venue plan with calibrated 1 m x 1 m grid;
- rectangular selection of contiguous cells to create a sellable area;
- area name and automatically calculated square meters;
- assign, release and replace areas from a deal, partner record or map;
- one or several areas per builder deal;
- optional area assignment for a partner;
- Builder Deal cannot become `won` without an assigned area;
- manual ToonExpo company/account creation request;
- manual public map publication to ToonExpo;
- simple success/error status and manual retry for integrations.

## Explicitly Excluded

- Task Management and workspaces;
- onboarding checklist;
- KPI;
- dashboard widgets;
- analytics and reports;
- payroll, HR, accounting or payments;
- TOTP/MFA;
- complex subroles or permission builders;
- automatic integration queues and schedulers;
- generated frontend API SDK;
- full audit/event projection system;
- visitor check-in;
- QR functionality;
- indoor routing or positioning;
- ToonExpo public website and buyer experience;
- ToonExpo builder portal, Constructor CRM and Readiness;
- building/floor/apartment visual maps;
- polygon editing and automatic PDF rasterization.

## Release 1 Success

An employee can:

1. create an event cycle;
2. add a company and contact;
3. create and move a builder deal through the Kanban;
4. create an area on the venue map and assign it to the deal;
5. move the deal to `won`;
6. manage partners in a separate lightweight Kanban;
7. request a ToonExpo account for an eligible company;
8. publish the current public venue map to ToonExpo.

## Simplicity Rule

Release 1 is production software, but its architecture must match the real scale of approximately 20 users. Production quality means correct permissions, validation, backups, secure passwords and reliable core workflows. It does not mean speculative enterprise infrastructure.
