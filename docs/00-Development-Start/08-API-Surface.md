# BOS Release 1 API Surface

## Status

Accepted route baseline. NestJS controllers and generated OpenAPI are canonical once implementation starts.

## Conventions

- Base path: `/api/v1`.
- JSON fields use `camelCase`; database columns use `snake_case`.
- Identifiers are UUIDs. Timestamps are UTC RFC 3339 strings.
- List endpoints use cursor pagination with default `limit=50` and maximum `limit=100`.
- Mutable aggregates expose an integer `version`; update commands include `expectedVersion` and return `409 conflict` on stale writes.
- Resource-creation, transition, allocation, provisioning and publication POST commands require a client UUID `Idempotency-Key`. NestJS scopes it to user + command, retains the result for 24 hours and returns `409` if the same key is reused with a different request hash.
- Validation errors use stable field paths. Domain failures use stable problem codes and never rely on English message matching.
- Every response includes or echoes `X-Request-Id`.
- Private responses use `Cache-Control: no-store`.

Error body:

```json
{
  "type": "urn:bigprojects-bos:problem:conflict",
  "title": "Conflict",
  "status": 409,
  "code": "DEAL_VERSION_CONFLICT",
  "requestId": "uuid",
  "errors": []
}
```

## Auth And Users

```text
POST   /auth/login
POST   /auth/mfa/verify
POST   /auth/mfa/enroll
POST   /auth/mfa/confirm
POST   /auth/logout
GET    /auth/session
GET    /auth/csrf
POST   /auth/password/forgot
POST   /auth/password/reset
POST   /auth/invitations/accept
GET    /users
POST   /users/invitations
PATCH  /users/:userId
POST   /users/:userId/sessions/revoke
```

## Event Cycles

```text
GET    /cycles
POST   /cycles
GET    /cycles/:cycleId
PATCH  /cycles/:cycleId
POST   /cycles/:cycleId/transitions/:status
POST   /cycles/:cycleId/make-current
```

At most one cycle is `isCurrent=true`; more than one cycle may have `active` status during an overlap period.

Only active cycles can be current. New builder/partner engagements accept planning or active cycles. Completed cycles allow Admin-only corrections and remaining integration actions; archived/cancelled cycles reject mutations.

## Organizations And Contacts

```text
GET    /organizations
POST   /organizations
GET    /organizations/:organizationId
PATCH  /organizations/:organizationId
POST   /organizations/:organizationId/archive
GET    /organizations/:organizationId/contacts
POST   /organizations/:organizationId/contacts
GET    /contacts/:contactId
PATCH  /contacts/:contactId
POST   /contacts/:contactId/archive
```

## Builder Sales

```text
GET    /builder-deals
POST   /builder-deals
GET    /builder-deals/:dealId
PATCH  /builder-deals/:dealId
POST   /builder-deals/:dealId/transitions/:stage
```

Creation atomically creates one `CycleEngagement(kind=builder_sale)` and its one `BuilderDeal`. The transition endpoint enforces reasons and allocation decisions; `won` is rejected without an active same-cycle allocation.

## Partner Relations

```text
GET    /partner-participations
POST   /partner-participations
GET    /partner-participations/:participationId
PATCH  /partner-participations/:participationId
POST   /partner-participations/:participationId/transitions/:stage
```

Creation atomically creates one `CycleEngagement(kind=partner)` and its one `PartnerParticipation`.

## Notes, Attachments And Activity

```text
GET    /entities/:entityType/:entityId/notes
POST   /entities/:entityType/:entityId/notes
PATCH  /notes/:noteId
POST   /notes/:noteId/archive
POST   /entities/:entityType/:entityId/attachments/upload-intents
POST   /attachments/:attachmentId/finalize
GET    /attachments/:attachmentId/download-url
POST   /attachments/:attachmentId/archive
GET    /entities/:entityType/:entityId/activity
```

The route is polymorphic for UI convenience, but persistence uses explicit nullable target foreign keys plus a database check that exactly one supported target is set. `fileUrl` is never stored; R2 object keys and short-lived signed URLs are used.

Supported Note targets are `organization`, `contact`, `builderDeal` and `partnerParticipation`. Supported Attachment targets are those four plus `venuePlan`, `spaceArea`, `spaceAllocation` and `provisioningRequest`. Other `entityType` values are rejected.

## Venue Sales Map

```text
GET    /cycles/:cycleId/venue-plan
POST   /cycles/:cycleId/venue-plan/source-upload-intent
POST   /cycles/:cycleId/venue-plan/source-finalize
POST   /venue-plans/:planId/revisions/source-upload-intent
POST   /venue-plans/:planId/revisions/source-finalize
PATCH  /venue-plans/:planId/calibration
PUT    /venue-plans/:planId/cells
GET    /venue-plans/:planId/areas
POST   /venue-plans/:planId/areas
PATCH  /space-areas/:areaId
POST   /space-areas/:areaId/repartition
POST   /space-areas/:areaId/archive
GET    /venue-plans/:planId/allocations
POST   /space-allocations
PATCH  /space-allocations/:allocationId
POST   /space-allocations/:allocationId/release
GET    /venue-plans/:planId/publications
POST   /venue-plans/:planId/publications
POST   /venue-map-publications/:publicationId/retry
```

Area, cell, allocation and publication mutations are transactional and revalidated by NestJS. Map publish is Admin-only.

Allocation release rejects removal of the last active area from a `won` BuilderDeal unless the same command transaction creates its replacement or performs an allowed terminal deal transition.

Initial source finalization atomically creates VenuePlan and revision 1. Replacement finalization creates a new active revision and supersedes the prior revision only after verifying that the prior revision has no active allocations.

## ToonExpo Provisioning

```text
GET    /provisioning-requests
GET    /provisioning-eligibility
POST   /provisioning-requests
GET    /provisioning-requests/:requestId
POST   /provisioning-requests/:requestId/retry
POST   /provisioning-requests/:requestId/cancel
POST   /provisioning-requests/:requestId/resolve-link
POST   /provisioning-requests/:requestId/resolve-create
```

Request creation is an explicit Admin/assigned-Staff action after builder `won` or partner `confirmed`. Ambiguous company linking and forced creation after candidate review are Admin-only.

`retry` reuses the immutable request id/payload. A data correction uses `POST /provisioning-requests` with `supersedesRequestId`; the old failed/review request is cancelled/superseded rather than edited.

## Health And Contracts

```text
GET    /health/live
GET    /health/ready
GET    /openapi.json
```

Liveness checks only the process. Readiness verifies required configuration and a bounded database query; it does not call ToonExpo synchronously.
