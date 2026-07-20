# BOS Status Enums

These are canonical Release 1 values unless a section is explicitly marked later phase.

## User Status

```text
invited
active
suspended
archived
```

## Organization / Contact Lifecycle Status

```text
active
archived
```

## Event Cycle Status

```text
planning
active
completed
archived
cancelled
```

## Builder Deal Stage

```text
new
contacted
negotiation
contract_pending
won
lost
cancelled
```

`won` requires at least one active SpaceAllocation.

## Builder Contract Status

```text
not_required
not_started
sent
signed
cancelled
```

## Builder Payment Status

```text
not_required
pending
partial
paid
overdue
cancelled
```

## Partner Participation Stage

```text
identified
invited
discussing
confirmed
declined
cancelled
```

Partner `confirmed` does not require venue space.

## Space Allocation Status

```text
active
released
archived
```

## Public Display Mode

```text
organization
custom_label
hidden
```

## Venue Map Publication Status

```text
draft
publishing
published
publish_failed
archived
```

## Task Status

Later phase, not Release 1:

```text
todo
in_progress
blocked
done
cancelled
```

## Work Space Status

Later phase, not Release 1:

```text
active
archived
disabled
```

## Onboarding Step Status

Later phase, not Release 1:

```text
open
done
blocked
not_applicable
archived
```

Onboarding step status describes one checklist item inside a deal. It is not a separate onboarding workflow pipeline.

## Onboarding Checklist Template Status

Later phase, not Release 1:

```text
draft
active
archived
```

## KPI Status

Later phase, not Release 1:

```text
on_track
at_risk
behind
completed
```

## ToonExpo Provisioning Status

```text
not_started
pending
success
failed
linked_existing
needs_review
cancelled
```

`not_started` is a derived CycleEngagement summary before a request exists. Persisted requests begin at `pending`.

## Attachment Status

```text
pending_upload
pending_scan
active
rejected
archived
```
