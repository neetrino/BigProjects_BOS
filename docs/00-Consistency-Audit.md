# BigProjects BOS Consistency Audit

## Status

Updated for the confirmed Release 1 boundary and venue-map architecture.

## Canonical Release 1 Decisions

- BOS is separate from ToonExpo Ecosystem.
- Builder Sales CRM contains only BuilderDeal records.
- Partner Relations owns separate PartnerParticipation records and a compact Kanban.
- Both use a neutral Organization, EventCycle and technical CycleEngagement root.
- Venue Sales Map owns the calibrated metric plan, cells, areas and allocations.
- BuilderDeal `won` requires at least one active allocation.
- Partner `confirmed` does not require an allocation.
- Admin and Staff may author sellable areas; only Admin publishes.
- BOS sends idempotent account provisioning requests and immutable public map snapshots.
- ToonExpo stores and serves its own public map copy.
- Check-in and professional routing are not BOS Release 1 features.
- Tasks, onboarding checklist, KPI, full dashboard and analytics/reports are later phases.

## Canonical Roles

```text
BOS Admin
BOS Staff
BOS Viewer
```

## Canonical Status Groups

- EventCycle: planning, active, completed, archived, cancelled.
- BuilderDeal: new, contacted, negotiation, contract_pending, won, lost, cancelled.
- PartnerParticipation: identified, invited, discussing, confirmed, declined, cancelled.
- SpaceAllocation: active, released, archived.
- Public display: organization, custom_label, hidden.
- Provisioning: not_started, pending, success, failed, linked_existing, needs_review, cancelled.

## Naming Decisions

- Organization is stable identity; it is not a pipeline record.
- CycleEngagement is shared technical context, not a third user-facing module.
- BuilderDeal and PartnerParticipation are distinct business subtypes.
- SpaceArea is a named contiguous set of 1 m x 1 m cells.
- SpaceAllocation links a SpaceArea to a CycleEngagement.
- VenueMapSnapshotV1 is an immutable public projection, not editable source data.

## Remaining Watch Items

- Final pricing policy may use base price per m2 plus a negotiated total without changing map ownership.
- Professional routing should begin only after real venue plans and walkability classifications are validated.
- Later modules must integrate through owning module APIs rather than adding fields directly to Release 1 tables.

