# Acceptance Criteria

## Authoring

- Admin can upload and calibrate one hall plan for an EventCycle.
- Admin and Staff can create named areas from contiguous 1 m x 1 m sellable cells according to permissions.
- Area square meters are derived from cells.
- Active areas cannot overlap.
- Free cells can be repartitioned while historical records remain preserved.

## Business Integration

- One BuilderDeal can receive several areas.
- BuilderDeal cannot transition to `won` without an active area.
- One PartnerParticipation can optionally receive several areas.
- Map opens linked builder or partner sheet.
- Deal and partner sheets open the map picker.

## Public Projection

- Allocation supports organization, custom label and hidden modes.
- Private organization data is absent from the public payload.
- Admin can publish an immutable version to ToonExpo.
- Failed publication leaves the previous version active.
- BOS clearly shows whether unpublished changes exist.

## Quality

- Editor supports pan/zoom and remains usable on supported desktop viewport sizes.
- Public snapshot geometry is deterministic for the same source version.
- NestJS, not Next.js, enforces overlap, permission, transition and publication rules.
- Routing and check-in are not required for this Release 1 module.

