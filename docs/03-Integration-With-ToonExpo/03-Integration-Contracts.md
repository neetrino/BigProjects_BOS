# BOS Integration Contracts

## Purpose

This file defines the first integration contracts between BigProjects BOS and ToonExpo Ecosystem.

## v1 Contract Principle

Do not duplicate ToonExpo data into BOS in v1.

BigProjects admins can open ToonExpo directly when they need ToonExpo data.

Release 1 has two contracts: account/company provisioning and public venue-map publication.

## BOS -> ToonExpo Signals

### Successful Participation Signal

Fields:

- request id;
- Organization id from BOS;
- CycleEngagement id from BOS;
- company name;
- company type: builder | bank | partner | service | other;
- contact person;
- contact email;
- contact phone optional;
- successful business state: builder `won` or partner `confirmed`;
- requested ToonExpo access modules.

### Create ToonExpo Account Request

Fields:

- request id;
- Organization id from BOS;
- company name;
- company type;
- primary contact name;
- primary contact email;
- primary contact phone optional;
- role/type: builder | partner | bank;
- event cycle id/name if relevant;
- modules to enable: builder_portal, constructor_crm, readiness, partner_profile, bank_offers, analytics.

## ToonExpo -> BOS Response

### Account Creation Result

Fields:

- request id;
- ToonExpo company id;
- primary user id;
- status: success | linked_existing | needs_review | failed;
- error message if failed;
- created_at.

## Idempotency Rule

Provisioning must be safe to retry.

Use request id and BOS Organization external id for idempotency. Normalize primary user email for user matching.

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

- title and normalized background asset descriptor;
- calibrated map dimensions;
- public area geometry;
- area code/name and public display mode;
- public organization/project reference only when allowed;
- custom public label when selected;
- public landmarks;
- routing-ready cell classifications/access points when configured.

### Privacy Rule

For `publicDisplayMode = hidden`, organization id, name and other identity fields are omitted. For `custom_label`, only the approved public label is included. Internal deal stage, price, responsible staff, notes and attachments are never part of this contract.

### ToonExpo Response

- request id;
- BOS venue plan id;
- accepted snapshot version;
- ToonExpo snapshot id;
- status: `published | already_published | rejected | failed`;
- validation errors if rejected;
- activated_at optional.

### Publication Rules

- retrying the same version/checksum is idempotent;
- the same version with a different checksum is rejected;
- older versions cannot replace a newer active version;
- failed publication leaves the prior ToonExpo snapshot active;
- ToonExpo stores a local immutable copy and serves public traffic without a BOS runtime dependency.

## Rule

Contracts remain narrow. Provisioning and published map snapshots do not authorize broad cross-system data synchronization.
