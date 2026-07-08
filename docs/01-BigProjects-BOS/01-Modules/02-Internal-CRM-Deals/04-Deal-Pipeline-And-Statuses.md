# Deal Pipeline And Statuses

## Purpose

Deal status shows where the company is in the BigProjects participation process for a specific ToonExpo cycle.

## Recommended Statuses

```text
new
contacted
negotiation
contract_pending
approved_participant
lost
cancelled
```

## Active Statuses

### new

Company/deal exists but real communication has not started.

### contacted

BigProjects has reached out or established first contact.

### negotiation

Participation terms, package, placement or details are being discussed.

### contract_pending

Company is close to approval. Contract/payment/confirmation is pending.

### approved_participant

Company has become a ToonExpo participant for this cycle.

This status is successful from sales point of view, but operational work may continue:

- onboarding checklist;
- account provisioning;
- data/material collection;
- handoff into ToonExpo.

## Terminal Statuses

### lost

Company did not join this cycle.

Store lost reason.

### cancelled

Deal/participation was cancelled.

Store cancellation reason.

## Contract Status

Optional v1:

```text
not_required
not_started
sent
signed
cancelled
```

## Payment Status

Optional v1:

```text
not_required
pending
partial
paid
overdue
cancelled
```

## Stage Movement

Managers can move deals by drag/drop or status field.

Important transitions can require lightweight confirmation:

- move to approved_participant;
- move to lost;
- move to cancelled.

Do not duplicate the full deal form in transition modals. If required fields are missing, open/highlight them in the deal sheet.

## Approval Effects

Moving to approved_participant can:

- activate/continue onboarding checklist;
- enable ToonExpo provisioning request;
- update reports;
- keep deal visible in active cycle work until onboarding/provisioning is complete.

