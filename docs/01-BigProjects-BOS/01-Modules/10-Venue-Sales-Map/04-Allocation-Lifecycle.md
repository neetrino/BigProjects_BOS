# Allocation Lifecycle

## Allocation State

Release 1 does not implement expiring holds.

```text
active
released
archived
```

Availability is derived:

- no active allocation: available;
- active allocation: assigned;
- historical allocation: does not occupy cells.

## Multiple Areas

One CycleEngagement may have several active allocations. One SpaceArea may have at most one active allocation.

## Release Rule

Releasing the last active allocation of a `won` BuilderDeal is rejected. It is allowed only when another same-cycle allocation is created in the same transaction or the deal is moved to `lost`/`cancelled` with the explicit release decision.

Moving a BuilderDeal to `lost` or `cancelled` opens a required choice:

```text
Release assigned areas
Keep assigned areas
```

The selected outcome and actor are audited. No destructive release occurs silently.

## Repartitioning

- Only unallocated cells can be included in a new area.
- A free area may be archived and replaced by smaller or differently shaped areas.
- An assigned area must first be explicitly released.
- Historical area and allocation records remain queryable.

## Price Model

Release 1 stores:

- optional base price per square meter;
- derived area list price;
- final negotiated amount on BuilderDeal or PartnerParticipation.

Amounts are optional operational metadata. Whenever an amount is present, ISO 4217 currency is required. BOS does not calculate invoices, receive payments or implement accounting in Release 1.
