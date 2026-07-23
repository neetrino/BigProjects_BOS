# BigProjects BOS Data Model

## Core Entities

### User

- `id`
- `name`
- `email`
- `passwordHash`
- `role`: `admin | staff`
- `status`: `active | disabled`
- `locale`
- timestamps

### Session

- `id`
- `userId`
- `tokenHash`
- `expiresAt`
- timestamps

### EventCycle

- `id`
- `name`
- `code`
- `status`: `draft | active | closed`
- start and end dates
- timestamps

### Organization

- `id`
- `name`
- `type`: `builder | bank | partner | other`
- registration/tax identifier optional
- phone, email, website optional
- ToonExpo company id optional
- timestamps

### Contact

- `id`
- `organizationId`
- name, phone, email and position
- primary flag
- timestamps

## Workflow Entities

### BuilderDeal

- `id`
- `eventCycleId`
- `organizationId`
- primary contact optional
- assigned staff optional
- `stage`: `new | contacted | negotiation | won | lost`
- expected square meters optional
- agreed amount optional
- short description optional
- timestamps

### PartnerParticipation

- `id`
- `eventCycleId`
- `organizationId`
- primary contact optional
- assigned staff optional
- `stage`: `new | contacted | confirmed | declined`
- partner type optional
- short description optional
- timestamps

There is no common `CycleEngagement` abstraction in Release 1. The two workflows remain separate and easy to understand.

## Map Entities

### VenuePlan

- `id`
- `eventCycleId`
- title
- background image key
- width and height
- pixels-per-meter calibration
- publish status
- timestamps

### SpaceArea

- `id`
- `venuePlanId`
- code and name
- calculated square meters
- `publicDisplayMode`: `organization | custom_label | hidden`
- custom public label optional
- timestamps

### SpaceAreaCell

- `spaceAreaId`
- `venuePlanId`
- integer `x` and `y`

Unique `(venuePlanId, x, y)` prevents overlapping active areas.

### SpaceAllocation

- `id`
- `spaceAreaId`
- `builderDealId` optional
- `partnerParticipationId` optional
- active flag
- assigned and released timestamps

Exactly one of `builderDealId` or `partnerParticipationId` is set.

## Shared Content

### Note

- owner type and owner id
- body
- author
- timestamp

### Attachment

- owner type and owner id
- original filename
- object key
- content type and size
- uploader
- timestamp

## Data Rules

- one organization may participate in many cycles;
- one cycle has one venue plan in Release 1;
- one builder deal may have several active allocations;
- a partner allocation is optional;
- a deal cannot become `won` without an active allocation;
- an assigned area cannot be deleted until released;
- standard `createdAt`, `updatedAt` and actor fields are sufficient; no event store is required.
