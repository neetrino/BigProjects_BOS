# BOS Integration Contracts

## Purpose

This file defines the first integration contracts between BigProjects BOS and ToonExpo Ecosystem.

## v1 Contract Principle

Do not duplicate ToonExpo data into BOS in v1.

BigProjects admins can open ToonExpo directly when they need ToonExpo data.

Release 1 has two contracts: account/company provisioning and public venue-map publication.

## Transport And Authentication

- Both contracts use HTTPS JSON endpoints owned by ToonExpo.
- BOS sends `Authorization: Bearer <service credential>`, `Idempotency-Key: <request id>` and `X-Request-Id`.
- Service credentials are different for staging and production, stored in Google Secret Manager and never exposed to `apps/web`.
- ToonExpo authorizes the credential for only provisioning and venue-map publication scopes.
- Service credentials rotate at least every 90 days with a short two-key overlap; rotation is audited in both environments.
- Request timeout is 10 seconds. BOS automatically retries network errors, `429` and `5xx` at most 3 times with exponential backoff and jitter; it honors `Retry-After`.
- BOS never automatically retries validation/auth/permission errors or `needs_review`/`rejected` results.
- After automatic attempts are exhausted, the request remains failed and an authorized user can retry the same immutable request explicitly.
- Maximum JSON body is 5 MiB excluding the separately copied background asset.

NestJS may perform the first 10-second attempt in the initiating API request. A transient failure persists `next_attempt_at`; a Cloud Scheduler-triggered Cloud Run Job runs the same API image's integration-dispatch command every minute and claims due provisioning/publication rows with `FOR UPDATE SKIP LOCKED`. Each automatic attempt is a separate bounded execution, so retries never keep a browser request open for the whole backoff period. No Redis/external queue is used.

Contract endpoints:

```text
POST /integrations/bos/v1/provisioning
PUT  /integrations/bos/v1/venue-maps/:bosVenuePlanId/versions/:version
```

## Provisioning Contract

### Internal Eligibility Rule

The external request can be created only from:

- BuilderDeal in `won`; or
- PartnerParticipation in `confirmed`.

This is a BOS validation rule, not a separate signal or endpoint.

### Create ToonExpo Account Request

Fields:

- request id;
- schema version: `bos-provisioning.v1`;
- Organization id from BOS;
- CycleEngagement id and exactly one BuilderDeal/PartnerParticipation id;
- company name;
- company type: builder | bank | partner | service | other;
- registration/tax identifier optional;
- primary contact name;
- primary contact email;
- primary contact phone optional;
- preferred language optional: hy | ru | en;
- participant type: builder | partner | bank;
- event cycle id, code and name;
- modules to enable: builder_portal, constructor_crm, readiness, partner_profile, bank_offers, analytics.

`builder` comes from BuilderDeal. PartnerParticipation uses `bank` only when its partner category is bank; all other partner categories use `partner`. The module list is selected from the documented allowlist, snapshotted on first send and immutable for retries.

## ToonExpo -> BOS Response

### Account Creation Result

Fields:

- request id;
- ToonExpo company id;
- primary user id;
- status: success | linked_existing | needs_review | failed;
- stable error code and error message when failed;
- candidate company ids when needs_review;
- error message if failed;
- created_at;
- access_delivery_status optional: queued | sent | failed.

## Idempotency Rule

Provisioning must be safe to retry.

The `Idempotency-Key` and body request id are the same immutable UUID. ToonExpo stores the response against that key. Reusing the key with a different payload checksum returns conflict. BOS Organization external id resolves company links; normalized primary user email is used for User matching only.

HTTP result semantics:

- `200/201`: terminal success, linked_existing or needs_review response body;
- `400/422`: invalid schema/business payload, no automatic retry;
- `401/403`: credential/scope error, no automatic retry and security alert;
- `409`: idempotency/version conflict, no automatic retry;
- `429`: retry according to `Retry-After`;
- `5xx` or network timeout: bounded automatic retry.

Company resolution order:

1. existing stored BOS Organization -> ToonExpo Company link;
2. exact registration/tax identifier when available;
3. manually confirmed candidate based on normalized company identity;
4. create a new ToonExpo Company.

Do not automatically merge companies by display name or primary contact email alone. Ambiguous matches return `needs_review` with candidate ids so BOS Admin can link an existing company or create a new one.

## VenueMapSnapshotV1

### Request Identity

- request id;
- BOS venue plan id;
- BOS event cycle id/code;
- snapshot version;
- schema version: `venue-map.v1`;
- checksum;
- created/published timestamps.

### Public Map Content

- title and normalized background asset descriptor (`assetId`, SHA-256, MIME type, width, height and one short-lived signed download URL);
- calibrated map dimensions;
- public area geometry;
- area code/name and public display mode;
- public organization/project reference only when allowed;
- custom public label when selected;
- public landmarks;
- routing-ready cell classifications/access points when configured.

The signed asset URL is transport metadata and is excluded from the snapshot checksum so it can be renewed on a safe retry. ToonExpo verifies the asset checksum, copies the asset into its own storage before activation and never renders from the BOS/R2 URL.

### Privacy Rule

For `publicDisplayMode = hidden`, organization id, name and other identity fields are omitted. For `custom_label`, only the approved non-empty public label is included. `organization` is emitted only for a won builder or confirmed partner and contains the public Organization name plus optional ToonExpo company id; BOS internal ids are omitted. Non-successful allocations are projected as hidden. Internal deal stage, price, responsible staff, notes and attachments are never part of this contract.

### ToonExpo Response

- request id;
- BOS venue plan id;
- accepted snapshot version;
- ToonExpo snapshot id;
- status: `published | already_published | rejected | failed`;
- validation errors if rejected;
- activated_at optional when status is `published` or `already_published`.

### Publication Rules

- retrying the same version/checksum is idempotent;
- the same version with a different checksum is rejected;
- older versions cannot replace a newer active version;
- failed publication leaves the prior ToonExpo snapshot active;
- ToonExpo stores a local immutable copy and serves public traffic without a BOS runtime dependency.

## Rule

Contracts remain narrow. Provisioning and published map snapshots do not authorize broad cross-system data synchronization.
