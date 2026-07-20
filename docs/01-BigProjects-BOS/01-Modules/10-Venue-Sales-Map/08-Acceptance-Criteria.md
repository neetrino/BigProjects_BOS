# Acceptance Criteria

## Authoring

- Admin can upload and calibrate one hall plan for an EventCycle.
- Admin and Staff can create named areas from contiguous 1 m x 1 m sellable cells according to permissions.
- Area square meters are derived from cells.
- Active areas cannot overlap.
- A cell cannot change away from sellable while it belongs to an active area.
- Free cells can be repartitioned while historical records remain preserved.
- Source/calibration replacement creates a new revision and cannot orphan historical areas/publications or proceed with active allocations.

## Business Integration

- One BuilderDeal can receive several areas.
- BuilderDeal cannot transition to `won` without an active area.
- Last active allocation cannot be released while BuilderDeal remains `won`.
- One PartnerParticipation can optionally receive several areas.
- Map opens linked builder or partner sheet.
- Deal and partner sheets open the map picker.

## Public Projection

- Allocation supports organization, custom label and hidden modes.
- Private organization data is absent from the public payload.
- Non-won/non-confirmed allocations are forced to hidden in the public snapshot; custom label requires non-empty plain text.
- Admin can publish an immutable version to ToonExpo.
- Failed publication leaves the previous version active.
- BOS clearly shows whether unpublished changes exist.

## Quality

- Editor supports pan/zoom and remains usable on supported desktop viewport sizes.
- Public snapshot geometry is deterministic for the same source version.
- NestJS, not Next.js, enforces overlap, permission, transition and publication rules.
- Routing and check-in are not required for this Release 1 module.
