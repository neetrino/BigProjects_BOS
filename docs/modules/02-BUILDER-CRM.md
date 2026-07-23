# Builder Sales CRM

## Purpose

Manage companies buying exhibition space.

This is the main BOS workflow and one of exactly two Kanban boards.

## Stages

```text
new -> contacted -> negotiation -> won
                             \-> lost
```

Stage names may be relabeled in the UI later, but Release 1 does not include an Admin pipeline builder.

## Create Deal

Required:

- event cycle;
- organization.

Optional:

- primary contact;
- assigned staff;
- expected square meters;
- agreed amount;
- short description.

## Deal Card

Show only information needed to scan the board:

- organization;
- main contact;
- expected and assigned square meters;
- assigned area labels;
- responsible staff;
- amount when present.

## Deal Sheet

Tabs or simple sections:

- Details;
- Areas;
- Notes;
- Attachments.

The ToonExpo account action appears after the deal is eligible.

## Area Rule

`won` requires at least one active Space Allocation.

When moving a won/negotiating deal to `lost`, ask whether assigned areas should be released. A simple confirmation is enough; no policy engine is required.

## Not Included

- onboarding checklist;
- tasks;
- KPI;
- forecast engine;
- automated follow-up;
- email campaign;
- configurable pipeline.
