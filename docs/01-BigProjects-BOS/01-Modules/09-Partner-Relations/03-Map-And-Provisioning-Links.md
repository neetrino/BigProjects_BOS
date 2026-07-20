# Map And Provisioning Links

## Optional Venue Space

A partner may receive zero, one or several `SpaceAllocation` records. Space is optional and does not block `confirmed`.

The Partner Participation sheet can:

- open the map picker;
- attach an available named area;
- open the assigned area in Venue Sales Map;
- remove or replace an allocation subject to allocation history rules.

## Public Identity

Each allocation has a `publicDisplayMode`:

```text
organization
custom_label
hidden
```

Default: `organization`.

- `organization` publishes the confirmed partner identity.
- `custom_label` publishes only `publicLabel`, for example `Partner Zone`.
- `hidden` publishes no organization identity and renders the area as neutral/empty.

Private identity data must be stripped from the snapshot in BOS. ToonExpo must not receive data that it is not allowed to display.

## Provisioning

A confirmed partner may trigger the same idempotent ToonExpo provisioning infrastructure used by builders, with partner-specific company type and module access.

Provisioning does not merge the BuilderDeal and PartnerParticipation business processes.
