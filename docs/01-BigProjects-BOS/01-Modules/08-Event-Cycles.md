# BOS Module: Event Cycles

## Status

v1

## Documentation

This overview is intentionally short. Full module documentation is split into focused files:

1. [Module Index](./08-Event-Cycles/00-Module-Index.md)
2. [Definition And Boundaries](./08-Event-Cycles/01-Definition-And-Boundaries.md)
3. [Cycle Lifecycle And Statuses](./08-Event-Cycles/02-Cycle-Lifecycle-And-Statuses.md)
4. [Cycle Relationship To Deals And Companies](./08-Event-Cycles/03-Cycle-Relationship-To-Deals-And-Companies.md)
5. [Cycle Onboarding Tasks And Reports](./08-Event-Cycles/04-Cycle-Onboarding-Tasks-And-Reports.md)
6. [Cycle UI UX](./08-Event-Cycles/05-Cycle-UI-UX.md)
7. [Entity Fields](./08-Event-Cycles/06-Entity-Fields.md)
8. [Acceptance Criteria](./08-Event-Cycles/07-Acceptance-Criteria.md)

## 1. Purpose

Event Cycles represent repeated ToonExpo event iterations.

BigProjects may run ToonExpo two, three or four times per year. Each event cycle starts a new sales/organization process while preserving company/contact history.

## 2. Examples

```text
ToonExpo 2026-1
ToonExpo 2026-2
ToonExpo 2026-Q1
ToonExpo 2026 Spring
```

## 3. In Scope

- create event cycle;
- mark active cycle;
- connect deals to a cycle;
- connect onboarding checklists to a cycle;
- filter dashboard/tasks/reports by cycle;
- compare results by cycle.

## 4. Main Rule

Companies and contacts can persist across cycles.

Deals, onboarding progress, event participation and many tasks belong to a specific cycle.

```text
Company = long-lived relationship
Deal = participation attempt for a specific event cycle
Onboarding checklist = cycle-specific work for that deal
```

Cycle is the operational container for one ToonExpo iteration. It should be filterable across CRM, onboarding, tasks, dashboard and reports.

## 5. Data Entities

### EventCycle

- id;
- name;
- year;
- sequence;
- starts_at;
- ends_at;
- status;
- description.

### Deal

Deal should include:

- event_cycle_id;
- company_id;
- status;
- responsible_user_id.

## 6. Statuses

```text
planning
active
completed
archived
cancelled
```

## 7. Acceptance Criteria

- BOS Admin can create a new cycle.
- Deals can be assigned to a cycle.
- Dashboard can filter by active cycle.
- Reports can compare cycles.
- Same company can participate in multiple cycles with separate deals/history.
