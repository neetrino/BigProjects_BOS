# BigProjects BOS Consistency Audit

## Status

Passed for the confirmed Release 1 boundary, security baseline and venue-map architecture on 2026-07-20.

## Audit Coverage

Reviewed repository boundary/instructions, brief/decisions/progress/tech card, architecture and dependency rules, the complete development-start pack, all Release 1 module specifications, role/data/UI documents and all BOS-ToonExpo integration documents. Later-phase module files were checked for Release 1 leakage and classified as non-authoritative future context.

## Resolved Blocking Gaps

- selected invite-only credentials, mandatory Admin TOTP and opaque server sessions;
- confirmed R2, Resend, Sentry and GitHub Actions responsibilities;
- separated ToonExpo participant email delivery from BOS auth email;
- fixed Staff visibility/assignment authorization semantics;
- fixed current-cycle overlap semantics and allowed lifecycle mutations;
- fixed Organization/EventCycle engagement uniqueness to support separate builder and partner roles;
- made contract/payment metadata and currency behavior explicit;
- defined attachment targets, private storage, scanning and signed access;
- defined archive, immutable audit and database runtime defaults;
- separated derived `not_started` provisioning state from persisted requests;
- made provisioning payloads immutable and correction/retry behavior deterministic;
- added integration authentication, endpoints, idempotency, timeout/retry and asset-copy rules;
- removed deferred Dashboard/Tasks/Onboarding/KPI/Reports from Release 1 routes, screens and acceptance criteria;
- added canonical API surface and documentation precedence/readiness gate;
- added VenuePlanRevision/landmark/content-version fields so source replacement cannot corrupt historical areas or publications;
- fixed one authored API contract: NestJS class-validator DTOs generate OpenAPI, and Hey API generates the web fetch/type/Zod package;
- selected one TypeScript 5.9 baseline and explicit Prisma 7 adapter/config/pool mechanics;
- selected partial row-run cell mutation, the 1 MiB JSON envelope and the measurement-gated Frankfurt deployment pair.

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

`not_started` is derived before a provisioning request exists; persisted requests begin at `pending`.

## Naming Decisions

- Organization is stable identity; it is not a pipeline record.
- CycleEngagement is shared technical context, not a third user-facing module.
- BuilderDeal and PartnerParticipation are distinct business subtypes.
- SpaceArea is a named contiguous set of 1 m x 1 m cells.
- SpaceAllocation links a SpaceArea to a CycleEngagement.
- VenueMapSnapshotV1 is an immutable public projection, not editable source data.

## Validation Result

- no unresolved Release 1 `Draft`, `Proposed`, `Needs confirmation`, pending-decision or ambiguous optional-v1 markers;
- local Markdown links outside reference templates resolve;
- canonical statuses, scope, runtime ownership and integration directions agree across the audited documents;
- validation/codegen ownership, package dependencies, map mutation semantics and Prisma runtime/migration connections agree across the audited documents;
- provider secrets/DNS and named deployment approvers remain external prerequisites only and are intentionally not stored in Git.

## Non-Blocking Future Constraints

- Release 1 stores optional base/list/negotiated amount metadata with required ISO currency and has no accounting behavior.
- Professional routing should begin only after real venue plans and walkability classifications are validated.
- Later modules must integrate through owning module APIs rather than adding fields directly to Release 1 tables.
