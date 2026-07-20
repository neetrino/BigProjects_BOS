# BOS Database Schema Baseline

## Status

Accepted Release 1 logical baseline. Prisma names, indexes and migrations must preserve these ownership and integrity rules.

## Ownership

PostgreSQL 18.x on Neon is accessed only by the NestJS `apps/api` runtime through Prisma ORM 7.x in `packages/db`. Next.js must not import Prisma, execute SQL or run migrations.

## Core Tables

- users;
- staff_profiles;
- auth_sessions;
- mfa_recovery_codes;
- user_invitations;
- password_reset_tokens;
- api_idempotency_keys;
- rate_limit_buckets;
- organizations;
- contacts;
- event_cycles;
- cycle_engagements;
- builder_deals;
- partner_participations;
- notes;
- attachments;
- venue_plans;
- venue_plan_revisions;
- venue_plan_cells;
- venue_landmarks;
- space_areas;
- space_area_cells;
- space_allocations;
- venue_map_publications;
- toonexpo_provisioning_requests;
- audit_logs.

All primary identifiers use UUIDs. Mutable aggregates have `version`, `created_at` and `updated_at`. Database columns use `snake_case`; API fields use `camelCase`.

## Key Relationships

```text
organizations 1..n contacts
event_cycles 1..n cycle_engagements
organizations 1..n cycle_engagements
cycle_engagements 1..1 builder_deals XOR partner_participations
event_cycles 0..1 venue_plans in Release 1
venue_plans 1..n venue_plan_revisions and exactly one active revision after setup
venue_plan_revisions 1..n venue_plan_cells, venue_landmarks and space_areas
space_areas 1..n space_area_cells
cycle_engagements 0..n space_allocations
space_areas 0..n historical space_allocations and at most one active allocation
cycle_engagements 0..n toonexpo_provisioning_requests
organizations 0..1 toonexpo company link
```

## Important Rules

- Organization and Contact are long-lived;
- CycleEngagement, BuilderDeal and PartnerParticipation are cycle-specific;
- every CycleEngagement has one `kind` and exactly one matching business subtype, created in the same transaction;
- one Organization can have at most one engagement per EventCycle and kind, so it may be both builder and partner in the same cycle without merging the pipelines;
- BuilderDeal and PartnerParticipation remain separate tables and rules;
- BuilderDeal `won` requires an active SpaceAllocation;
- allocation commands cannot leave a `won` BuilderDeal without an active same-cycle allocation;
- PartnerParticipation `confirmed` does not require space;
- active area cells cannot overlap;
- source/calibration history is preserved through immutable superseded VenuePlanRevision records;
- notes and attachments use explicit nullable target foreign keys with a database check that exactly one supported target is set;
- map publication is idempotent by venue plan id and version;
- provisioning retries are idempotent by immutable request id; BOS Organization external id resolves companies, while normalized email matches users only.

## Auth Tables

- `users`: normalized unique email, password hash, role, status, MFA state and security timestamps;
- `staff_profiles`: display name, locale (`hy | ru | en`, default `hy`), timezone (default `Asia/Yerevan`) and staff metadata, one-to-one with user;
- `auth_sessions`: hashed session secret, user, created/last-seen/expires timestamps, revoked timestamp, IP/user-agent summary;
- `mfa_recovery_codes`: user, hashed single-use code and consumed timestamp; TOTP secret ciphertext/nonce/key-version stays on the user auth record;
- `user_invitations` and `password_reset_tokens`: hashed single-use token, user/email, expiry, consumed timestamp and creator where applicable.
- `api_idempotency_keys`: user, command scope, key, request hash, result entity/status and 24-hour expiry; same key with a different request hash is a conflict.
- `rate_limit_buckets`: hashed subject key, scope, fixed window/counter and blocked-until timestamp for cross-instance auth/action throttling; raw passwords/tokens are never keys.

Exact lifetimes and security behavior are defined in [Authentication And Security](./07-Authentication-And-Security.md).

## Commercial Baseline

- `cycle_engagements` owns `organization_id`, `event_cycle_id`, `kind`, `responsible_user_id` and `primary_contact_id`.
- `builder_deals` does not duplicate responsibility/contact fields. It owns stage, contract status, payment status, commercial amount/currency, close dates and terminal reasons/timestamps.
- `partner_participations` owns its stage/category, conditions and optional contribution amount/currency.
- Contract and payment statuses are persisted in Release 1. Whenever an amount is present, a three-letter ISO 4217 currency is required.
- At most one `event_cycles.is_current` row is true. Multiple cycles may still have `active` status during an overlap.

## Attachment Baseline

Note targets are Organization, Contact, BuilderDeal and PartnerParticipation. Attachment targets are those four plus VenuePlan, SpaceArea, SpaceAllocation and ToonExpoProvisioningRequest. CycleEngagement does not duplicate subtype notes/attachments.

Attachments store:

- original filename, detected MIME type and byte size;
- private R2 bucket/object key, checksum and upload status;
- exactly one target entity foreign key;
- uploader, created/updated/archived timestamps;
- scan status/result timestamp.

Permanent public URLs and plaintext file contents are not stored in PostgreSQL. Buckets are private; downloads use 10-minute signed URLs. Normal attachments allow PDF, PNG, JPEG, WebP, DOCX, XLSX and PPTX up to 25 MiB; archives and executable formats are rejected. Venue source plans allow PDF, PNG, JPEG or WebP up to 50 MiB.

Uploads go to a private quarantine key through a signed intent. Finalization verifies expected size, magic-byte MIME and SHA-256, then streams the object through a pinned ClamAV sidecar available only to the API container. The finalize endpoint has a 90-second endpoint-specific timeout. A clean result is copied once to a checksum/UUID-based immutable `objects/` key and activates the attachment; infected/unscannable files are rejected and unavailable. Quarantine keys expire by lifecycle rule. The original venue source and normalized render asset are both retained.

## Audit Baseline

`audit_logs` is append-only and records actor, action, subject type/id, request id, timestamp and redacted before/after or structured metadata. At minimum it covers:

- authentication/security administration;
- cycle status/current-cycle changes;
- organization/contact archive and reassignment;
- builder/partner stage and commercial-status changes;
- notes/attachment archive;
- map calibration, cell/area/allocation changes;
- provisioning creation, attempts and resolution;
- publication creation, attempts and activation result.

Audit records and immutable publication payload/checksum records are never updated or hard-deleted by product APIs.

Audit metadata stores changed field names and safe scalar before/after values. Password/auth tokens, TOTP secrets, full note bodies, signed URLs, file content, provider credentials and raw integration authorization headers are never copied into audit metadata.

## Archive And Deletion Policy

- No generic soft-delete flag is applied to every table.
- Referenced Organizations, Contacts, engagements, areas and attachments are archived with actor/time metadata.
- Cycles use their explicit completed/archived/cancelled lifecycle and are never deleted after dependent records exist.
- Allocations are released/archived; published snapshots and audit events are immutable.
- Expired API idempotency/rate-limit rows may be purged after 24 hours. Sessions and one-time tokens are revoked/expired and may be purged after 90 days by an operational cleanup job.
- Release 1 performs no automatic purge of business/audit records. A later legal retention policy can add anonymization/purge jobs without weakening current referential history.

## Database Runtime Defaults

- Runtime instantiates one container-scoped `PrismaClient` with `@prisma/adapter-pg` and reuses it across Cloud Run requests. Request handlers and scheduled commands never call `$disconnect()` after individual work.
- The `pg` adapter uses the pooled DML-only Neon `DATABASE_URL` with `max: 10`, `connectionTimeoutMillis: 5000` and `idleTimeoutMillis: 30000`; Prisma 7 pool behavior is not configured through legacy Prisma URL pool parameters.
- Cloud Run concurrency starts at 40; production starts with maximum 5 instances and minimum 1.
- PostgreSQL statement timeout is 15 seconds; Prisma interactive transaction timeout is 10 seconds.
- API request timeout: 30 seconds. External integration calls use shorter limits from the integration contract.
- `prisma.config.ts` explicitly imports `dotenv/config` for local tooling, points CLI/migrations to the direct owner `DIRECT_URL` and never exposes that credential to the API runtime. The generated client/output path follows Prisma 7 conventions.
- Local development and CI use PostgreSQL 18 containers. Staging and production use separate Neon projects/branches and credentials. Values are environment configuration and validated at startup.
- Deployment validation must keep `max instances * pool size` plus migration/operations headroom below the selected Neon plan connection limit before any scaling increase.

These are safe starting limits, not unresolved choices. Changes after load testing are operational tuning recorded with evidence.
