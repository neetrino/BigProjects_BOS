# Deal Pipeline And Statuses

## Purpose

BuilderDeal stage shows where a builder sale is in a specific ToonExpo cycle.

## Canonical Statuses

```text
new
contacted
negotiation
contract_pending
won
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

### won

The builder sale is successful and the builder is confirmed for this cycle.

Required invariant:

- at least one active SpaceAllocation exists for this BuilderDeal in the same EventCycle.

After `won`, account provisioning and public map publication may continue.

## Terminal Statuses

### lost

Company did not join this cycle.

Store lost reason.

### cancelled

Deal/participation was cancelled.

Store cancellation reason.

## Contract Status

Included Release 1 values:

```text
not_required
not_started
sent
signed
cancelled
```

## Payment Status

Included Release 1 values:

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

Contract and payment statuses are lightweight operational metadata, not accounting integration. A commercial amount is optional; when present, ISO 4217 currency is required.

Important transitions can require lightweight confirmation:

- move to won;
- move to lost;
- move to cancelled.

Do not duplicate the full deal form in transition modals. If required fields are missing, open/highlight them in the deal sheet.

## Won Effects

Moving to `won` can:

- enable ToonExpo provisioning request;
- make public organization display eligible for its assigned areas;
- update sold-area and participant counters.

Moving to `lost` or `cancelled` requires an explicit choice to release or keep active area allocations. The choice is audited.
