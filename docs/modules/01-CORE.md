# Core Records Module

## Purpose

Provide the small set of records used by both Kanban boards and the map.

## Event Cycles

Examples:

- `ToonExpo 2026-1`
- `ToonExpo 2026-2`

Each cycle starts its own builder deals, partner records and venue plan. Organizations and contacts are reused across cycles.

Statuses:

```text
draft -> active -> closed
```

Only one cycle is selected as the current working cycle in the UI.

## Organizations

Organization is a stable company record. Type is descriptive:

- builder;
- bank;
- partner;
- other.

Organization type does not decide which Kanban it belongs to. A Builder Deal or Partner Participation creates the cycle-specific workflow.

## Contacts

Contacts belong to an organization. One may be marked primary. Contacts are edited inside the organization sheet and selected inside deal/partner sheets.

## Notes And Attachments

Notes and files attach directly to:

- Organization;
- Builder Deal;
- Partner Participation.

No separate Notes, Communication or Files workspace exists.
