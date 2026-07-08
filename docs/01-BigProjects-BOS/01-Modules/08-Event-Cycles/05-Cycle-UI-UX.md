# Cycle UI UX

## Purpose

Cycle UI should make it obvious which ToonExpo iteration the user is working in.

## Global Cycle Selector

Recommended:

- show current cycle in top-level BOS shell or dashboard filter;
- allow switching cycle from CRM/dashboard/reports;
- default to active cycle;
- show archived cycles only when user explicitly opens historical filters.

## Cycle List Page

Cycle list should show:

- name;
- status;
- date range;
- sequence/year;
- deals count;
- approved participants count;
- onboarding completion summary;
- created/updated dates.

Clicking a cycle opens a detail sheet or cycle workspace.

## Cycle Detail

Cycle detail can be a sheet in v1 unless it becomes a long reporting workspace.

Recommended sections:

- general info;
- dates/status;
- deal summary;
- onboarding summary;
- tasks summary;
- reports/analytics links;
- audit/history.

## CRM Filter Behavior

CRM board/list should default to current active cycle.

Filter options:

- current cycle;
- specific cycle;
- all cycles;
- archived cycles only if enabled by advanced filter.

Deal cards should show cycle only when the current view can include multiple cycles. In a single-cycle board, showing cycle on every card may be unnecessary.

## Creating A Deal

When creating a deal:

- preselect current active cycle;
- allow changing cycle before save;
- require cycle if no current active cycle exists;
- show warning if selected cycle is completed/archived/cancelled.

## Creating A Cycle

Cycle creation can be a quick dialog:

- name;
- year;
- sequence;
- start date;
- end date;
- status default planning.

More detailed planning can happen later in the cycle sheet.

## Empty States

- no active cycle: prompt admin to create or activate a cycle;
- no deals in cycle: show create deal action;
- completed cycle: show historical/reporting state, not active work prompt;
- archived cycle: show read-only historical state by default.

