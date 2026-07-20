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

The architecture supports:

- optional base price per square meter;
- derived area list price;
- final negotiated amount on BuilderDeal or PartnerParticipation.

Final pricing policy may be configured later without changing the map ownership model.

