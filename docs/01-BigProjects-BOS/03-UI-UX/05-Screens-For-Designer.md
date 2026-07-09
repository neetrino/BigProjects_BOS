# BigProjects BOS Screens

## UI/UX Designer Brief

**Product:** BigProjects BOS  
**Audience:** UI/UX designer  
**Scope:** internal operational frontend  
**Not included:** ToonExpo public website, buyer app screens, builder portal design  
**Main direction:** desktop-first operational system

---

## 1. What This Document Is

This document lists the main BOS screens that need design.

It is intentionally written in a PDF-friendly format:

- no wide Markdown tables;
- one screen per block;
- short descriptions;
- clear must-have content;
- easy to read after PDF conversion.

BOS is not a public marketing site. It should feel like a dense, fast and professional internal operations tool.

---

## 2. Design Priorities

1. Fast internal work, not decorative presentation.
2. Clear event-cycle context everywhere.
3. CRM board/list with strong side-sheet details.
4. Deal onboarding checklist visible inside the deal workflow.
5. Task workspaces for different departments and directions.
6. Reports and KPI easy to scan.
7. ToonExpo provisioning visible from the deal flow.
8. Compact, professional, NBOS-style operational UI.

---

## 3. Core User Flows

### Flow A - New Participant Deal

```text
Dashboard
-> CRM Board
-> Create Deal
-> Deal Sheet
-> Checklist starts automatically
```

### Flow B - Onboarding Work

```text
CRM Board
-> Deal Sheet
-> Onboarding Checklist
-> Mark item done
-> Progress updates
```

### Flow C - Task Workspace

```text
Tasks
-> Workspaces
-> Marketing / Event Prep Workspace
-> Task Sheet
-> Linked deal/cycle
```

### Flow D - ToonExpo Provisioning

```text
Deal reaches approved stage
-> Deal Sheet Provisioning Block
-> Create ToonExpo account
-> Status shown in BOS
```

### Flow E - Cycle Reporting

```text
Event Cycles
-> Cycle Detail
-> Reports
-> Sales / Onboarding / KPI report
```

---

## 4. Priority 1 Screens

### Screen 01 - Login

**Purpose:** Internal staff entry.

**Must include:**

- clean login form;
- company/product identity;
- error state;
- forgot/reset state if needed.

**Designer focus:** Internal and professional, not marketing-heavy.

---

### Screen 02 - Dashboard

**Purpose:** Main operational overview.

**Must include:**

- current cycle selector;
- key metrics;
- deal pipeline summary;
- onboarding progress;
- urgent tasks;
- provisioning alerts.

**Designer focus:** Dashboard should be dense, scannable and action-oriented.

---

### Screen 03 - Event Cycles List

**Purpose:** Manage ToonExpo cycles.

**Must include:**

- cycle cards or table;
- cycle status;
- dates;
- participant count;
- revenue/progress summary;
- create/open cycle action.

---

### Screen 04 - Event Cycle Detail

**Purpose:** One cycle workspace.

**Must include:**

- cycle header;
- key metrics;
- linked deals;
- onboarding progress;
- tasks;
- reports shortcut;
- cycle status.

**Designer focus:** Every cycle should feel like its own operational container.

---

### Screen 05 - CRM / Deals Board

**Purpose:** Main sales/onboarding workspace.

**Must include:**

- kanban columns by deal stage;
- cycle filter;
- deal cards;
- assignee;
- company;
- value;
- onboarding progress;
- quick filters.

**Designer focus:** This is one of the most important BOS screens.

---

### Screen 06 - CRM / Deals List

**Purpose:** Table alternative to board.

**Must include:**

- searchable/filterable table;
- stage;
- assignee;
- cycle;
- company;
- value;
- checklist progress;
- provisioning status.

**Designer focus:** Table density matters. It should not feel oversized.

---

### Screen 07 - Deal Sheet

**Purpose:** Main detail sheet for one deal.

**Must include:**

- company/contact information;
- deal stage;
- deal value;
- notes;
- attachments;
- onboarding checklist;
- related tasks;
- activity timeline;
- ToonExpo provisioning block.

**Designer focus:** Deal Sheet is the central work surface. It should open from board/list without leaving the page.

---

### Screen 08 - Company Sheet

**Purpose:** Company detail without leaving CRM.

**Must include:**

- company data;
- contacts;
- related deals by cycle;
- notes;
- attachments;
- history.

---

### Screen 09 - Contact Sheet

**Purpose:** Contact/person detail.

**Must include:**

- name;
- role;
- phone/email;
- company link;
- related deals;
- notes/activity.

---

### Screen 10 - Deal Onboarding Checklist Section

**Purpose:** Checklist inside the deal sheet.

**Must include:**

- progress bar;
- checklist items;
- done/pending status;
- owner;
- due date;
- required/optional marker;
- update action.

**Designer focus:** This is not a separate product page in v1. It lives inside the deal workflow.

---

## 5. Priority 2 Screens

### Screen 11 - Onboarding Template Settings

**Purpose:** Admin-managed checklist template.

**Must include:**

- checklist template list;
- add/edit/reorder item;
- active version;
- manual update active deals action.

---

### Screen 12 - Tasks Global Board

**Purpose:** All operational tasks.

**Must include:**

- kanban/list switch;
- task cards;
- workspace label;
- assignee;
- priority;
- due date;
- linked cycle/deal.

---

### Screen 13 - Task Workspaces List

**Purpose:** Direction/department shells.

**Must include:**

- workspace cards;
- examples: marketing, sales, event prep, operations;
- task counts;
- status summaries.

---

### Screen 14 - Task Workspace Detail

**Purpose:** Focused task area by direction.

**Must include:**

- workspace header;
- task board/list;
- filters;
- linked deals/cycles;
- quick create task.

---

### Screen 15 - Task Sheet

**Purpose:** Task details.

**Must include:**

- title;
- status;
- assignee;
- priority;
- due date;
- linked deal/cycle/company;
- comments/notes;
- activity.

---

### Screen 16 - Staff / Team KPI

**Purpose:** Staff performance overview.

**Must include:**

- staff list/cards;
- KPI summary;
- assigned deals/tasks;
- completion rates;
- filters by cycle/date.

---

### Screen 17 - Staff Detail Sheet

**Purpose:** One staff member detail.

**Must include:**

- assigned work;
- KPI breakdown;
- deals;
- tasks;
- recent activity.

---

### Screen 18 - Reports Overview

**Purpose:** Report entry point.

**Must include:**

- report cards;
- filters by cycle/date/staff;
- quick export action.

---

### Screen 19 - Deal / Sales Reports

**Purpose:** Sales pipeline reporting.

**Must include:**

- totals;
- stage conversion;
- revenue/value;
- cycle comparison;
- table and charts.

---

### Screen 20 - Onboarding Reports

**Purpose:** Checklist and readiness of deals.

**Must include:**

- progress by deal;
- blocked items;
- missing requirements;
- status filters.

---

### Screen 21 - Provisioning Workspace

**Purpose:** ToonExpo account provisioning control.

**Must include:**

- pending statuses;
- created statuses;
- failed statuses;
- retry action;
- linked deal/company;
- error details.

---

## 6. Priority 3 Screens

### Screen 22 - Settings

**Purpose:** Basic internal configuration.

**Must include:**

- users;
- roles;
- stages;
- checklist templates;
- workspace categories;
- integration settings.

---

### Screen 23 - Empty / Loading / Error States

**Purpose:** Product consistency.

**Must include:**

- empty board;
- no tasks;
- no deals;
- failed provisioning;
- loading skeletons.

---

## 7. Responsive States

BOS is desktop-first, but should still be usable on laptop and tablet.

Designer should prepare at least:

- desktop around 1440px width;
- laptop around 1280px width;
- tablet only where layout changes strongly, especially boards and side sheets.

Mobile is not primary for BOS v1. Do not optimize the whole BOS workflow for phone unless a specific screen later requires it.

---

## 8. Shared Components To Design

- app shell/sidebar;
- top bar with cycle selector;
- filter/search bar;
- kanban board column;
- deal card;
- task card;
- KPI/stat card;
- compact table row;
- side sheet;
- stacked side sheet;
- quick create dialog;
- status badge;
- checklist progress bar;
- activity timeline;
- attachment/note block;
- empty state;
- failed provisioning/error state.

---

## 9. Side Sheet Standard

Most entity details should open in side sheets:

- deal;
- company;
- contact;
- task;
- staff member;
- checklist item;
- provisioning request.

Full pages should be reserved for true workspaces:

- dashboard;
- CRM board/list;
- task workspace;
- reports;
- settings;
- cycle detail.

---

## 10. Not In Designer Scope Now

- ToonExpo public website screens;
- buyer/mobile app screens;
- builder portal design;
- public project/apartment pages;
- deep admin CRUD for every tiny dictionary;
- complex BI dashboard variations;
- future paid/ticket/event-commerce flows.

---

## 11. Final Notes For Designer

- BOS should feel close to NBOS-style operational UI: compact, clean, fast and sheet-based.
- Do not make huge marketing-style hero sections.
- Tables and kanban cards should be readable and information-dense.
- Every important screen should show current cycle context.
- Design should be professional enough to reuse later for internal admin screens.
