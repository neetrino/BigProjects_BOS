# Cycle Lifecycle And Statuses

## Purpose

Cycle status tells BOS whether the event iteration is being planned, actively sold/onboarded, completed or archived.

## Statuses

Canonical Release 1 statuses:

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
- preparing the venue plan and early engagements.

### active

The cycle is currently being worked.

Used for:

- new participant deals;
- sales pipeline;
- active venue/map/provisioning workspaces.

There should normally be one primary active cycle, but the data model should not break if BigProjects temporarily overlaps two cycles.

### completed

The event iteration has ended and main operational work is done.

Used for:

- reviewing outcomes;
- preserving history.

Completed cycles should usually be read-only for normal staff, with admin edits allowed for corrections.

### archived

The cycle is old and hidden from default operational views.

Archived cycles remain available in explicit historical filters.

### cancelled

The planned cycle did not happen.

Engagement/allocation history remains, and operational views distinguish cancelled cycles from completed cycles.

## Current Cycle Rule

BOS should have a clear current/active cycle selector.

Default behavior:

- CRM deal board defaults to current active cycle;
- Partner Relations and Venue Sales Map default to current active cycle.

There may be zero or one `is_current` cycle. Multiple cycles may have `active` status during an overlap; Admin explicitly selects which active cycle is current.

Only an `active` cycle can be current. When the current cycle leaves `active`, BOS clears `is_current` in the same transaction; Admin then selects another active cycle or leaves none current.

## Transition Rules

- planning -> active;
- active -> completed;
- completed -> archived;
- planning -> cancelled;
- active -> cancelled only by admin and with reason.

Transitions are not reversible in Release 1. New engagements are allowed only in `planning` or `active`. Completed cycles permit Admin-only corrections and remaining provisioning/publication actions; archived and cancelled cycles are read-only.

Do not delete cycles with deals/history.
