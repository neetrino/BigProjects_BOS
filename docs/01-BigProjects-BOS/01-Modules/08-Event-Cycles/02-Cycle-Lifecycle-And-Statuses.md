# Cycle Lifecycle And Statuses

## Purpose

Cycle status tells BOS whether the event iteration is being planned, actively sold/onboarded, completed or archived.

## Statuses

Recommended v1 statuses:

```text
planning
active
completed
archived
cancelled
```

## Status Meanings

### planning

The cycle is created but not yet the main active working cycle.

Used for:

- setting dates;
- preparing targets;
- preparing templates;
- early planning tasks.

### active

The cycle is currently being worked.

Used for:

- new participant deals;
- sales pipeline;
- onboarding checklists;
- active cycle dashboard;
- current reports.

There should normally be one primary active cycle, but the data model should not break if BigProjects temporarily overlaps two cycles.

### completed

The event iteration has ended and main operational work is done.

Used for:

- closing reports;
- comparing outcomes;
- preserving history.

Completed cycles should usually be read-only for normal staff, with admin edits allowed for corrections.

### archived

The cycle is old and hidden from default operational views.

Archived cycles remain available in reports/history.

### cancelled

The planned cycle did not happen.

Deals/tasks can keep history, but reports should distinguish cancelled cycles from completed cycles.

## Current Cycle Rule

BOS should have a clear current/active cycle selector.

Default behavior:

- dashboard opens with current active cycle;
- CRM deal board defaults to current active cycle;
- onboarding reports default to current active cycle;
- task views can show all tasks but should allow cycle filtering.

## Transition Rules

- planning -> active;
- active -> completed;
- completed -> archived;
- planning -> cancelled;
- active -> cancelled only by admin and with reason.

Do not delete cycles with deals/history.

