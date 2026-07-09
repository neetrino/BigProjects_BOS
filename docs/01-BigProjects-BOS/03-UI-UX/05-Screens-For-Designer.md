# BigProjects BOS Screens For UI/UX Designer

## Purpose

This is the short screen list for the UI/UX designer.

Scope: BigProjects BOS internal operational frontend. BOS is not a public marketing website. It should look like a dense, fast, professional business operations system.

## Design Priorities

1. Fast internal work, not decorative presentation.
2. Clear event-cycle context everywhere.
3. CRM board/list with strong side-sheet details.
4. Deal onboarding checklist visible inside deal workflow.
5. Task workspaces for different departments/directions.
6. Reports and KPI easy to scan.
7. ToonExpo provisioning visible from the deal flow.

## Required Main Screens

| Priority | Screen | Purpose | Must Include |
|---:|---|---|---|
| 1 | Login | Internal staff entry | clean login form, company/product identity, error state, forgot/reset state if needed |
| 1 | Dashboard | Main operational overview | current cycle selector, key metrics, deal pipeline summary, onboarding progress, urgent tasks, provisioning alerts |
| 1 | Event Cycles List | Manage ToonExpo cycles | cycle cards/table, status, dates, participant count, revenue/progress summary, create/open cycle action |
| 1 | Event Cycle Detail | One cycle workspace | cycle header, key metrics, linked deals, onboarding progress, tasks, reports shortcut, cycle status |
| 1 | CRM / Deals Board | Main sales/onboarding workspace | kanban columns by deal stage, cycle filter, deal cards, assignee, company, value, onboarding progress, quick filters |
| 1 | CRM / Deals List | Table alternative to board | searchable/filterable table, stage, assignee, cycle, company, value, checklist progress, provisioning status |
| 1 | Deal Sheet | Main detail sheet for one deal | company/contact info, stage, value, notes, attachments, onboarding checklist, tasks, activity, ToonExpo provisioning block |
| 1 | Company Sheet | Company detail without leaving CRM | company data, contacts, related deals by cycle, notes, attachments, history |
| 1 | Contact Sheet | Contact/person detail | name, role, phone/email, company link, related deals, notes/activity |
| 1 | Deal Onboarding Checklist Section | Checklist inside deal sheet | progress bar, checklist items, done/pending status, owner, due date, required/optional marker, update action |
| 2 | Onboarding Template Settings | Admin-managed checklist template | checklist template list, add/edit/reorder item, active version, manual update active deals action |
| 2 | Tasks Global Board | All operational tasks | kanban/list switch, task cards, workspace label, assignee, priority, due date, linked cycle/deal |
| 2 | Task Workspaces List | Direction/department shells | workspace cards for marketing, sales, event prep, operations etc., task counts, status summaries |
| 2 | Task Workspace Detail | Focused task area by direction | workspace header, task board/list, filters, linked deals/cycles, quick create task |
| 2 | Task Sheet | Task details | title, status, assignee, priority, due date, linked deal/cycle/company, comments/notes, activity |
| 2 | Staff / Team KPI | Staff performance overview | staff list/cards, KPI summary, assigned deals/tasks, completion rates, filters by cycle/date |
| 2 | Staff Detail Sheet | One staff member detail | assigned work, KPI breakdown, deals, tasks, recent activity |
| 2 | Reports Overview | Report entry point | report cards, filters by cycle/date/staff, quick export action |
| 2 | Deal / Sales Reports | Sales pipeline reporting | totals, stage conversion, revenue/value, cycle comparison, table + charts |
| 2 | Onboarding Reports | Checklist and readiness of deals | progress by deal, blocked items, missing requirements, status filters |
| 2 | Provisioning Workspace | ToonExpo account provisioning control | pending/created/failed statuses, retry action, linked deal/company, error details |
| 3 | Settings | Basic internal configuration | users, roles, stages, checklist templates, workspace categories, integration settings |
| 3 | Empty / Loading / Error States | Product consistency | empty board, no tasks, no deals, failed provisioning, loading skeletons |

## Key User Flows To Show

### Flow 1: New Participant Deal

```text
Dashboard -> CRM Board -> Create Deal -> Deal Sheet -> Checklist starts automatically
```

### Flow 2: Onboarding Work

```text
CRM Board -> Deal Sheet -> Onboarding Checklist -> Mark item done -> Progress updates
```

### Flow 3: Task Workspace

```text
Tasks -> Workspaces -> Marketing/Event Prep Workspace -> Task Sheet -> Linked deal/cycle
```

### Flow 4: ToonExpo Provisioning

```text
Deal reaches approved stage -> Deal Sheet Provisioning Block -> Create ToonExpo account -> Status shown in BOS
```

### Flow 5: Cycle Reporting

```text
Event Cycles -> Cycle Detail -> Reports -> Sales/Onboarding/KPI report
```

## Responsive States Required

BOS is desktop-first, but should still be usable on laptop and tablet.

Designer should prepare at least:

- desktop screen around 1440px width;
- laptop screen around 1280px width;
- tablet state for boards/sheets if layout changes strongly.

Mobile is not primary for BOS v1. Do not optimize the whole BOS workflow for phone unless a specific screen later requires it.

## Shared Components To Design

- app shell/sidebar;
- top bar with cycle selector;
- filter/search bar;
- kanban board column;
- deal card;
- task card;
- KPI/stat card;
- table row density;
- side sheet;
- stacked side sheet;
- quick create dialog;
- status badge;
- progress bar/checklist progress;
- activity timeline;
- attachment/note block;
- empty state;
- failed provisioning/error state.

## Side Sheet Standard

Most entity details should open in side sheets:

- deal;
- company;
- contact;
- task;
- staff member;
- checklist item;
- provisioning request.

Full pages should be reserved for real workspaces: dashboard, CRM board/list, task workspace, reports, settings and cycle detail.

## Not In Designer Scope Now

- ToonExpo public website screens;
- buyer/mobile app screens;
- builder portal design;
- public project/apartment pages;
- deep admin CRUD for every tiny dictionary;
- complex BI dashboard variations;
- future paid/ticket/event-commerce flows.

## Notes

- BOS should feel close to NBOS-style operational UI: compact, clean, fast, sheet-based.
- Do not make huge marketing-style hero sections.
- Tables and kanban cards should be readable and information-dense.
- Every important screen should show current cycle context.
- Design should be professional enough to reuse later for internal admin screens.
