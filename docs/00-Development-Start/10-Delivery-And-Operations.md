# BOS Delivery And Operations Baseline

## Status

Accepted Release 1 delivery baseline. Provider resource ids and secret values remain environment configuration.

## Environments

| Environment | Purpose | Data rule |
|---|---|---|
| Development | Local web/API plus PostgreSQL 18, MinIO, ClamAV, Mailpit and ToonExpo contract stub containers | Synthetic/dev data only |
| Staging | Acceptance, integration contract tests and migration rehearsal | Synthetic or explicitly sanitized data |
| Production | Internal live BOS | Real operational data |

No environment shares a database, R2 bucket/prefix, ToonExpo credential, Sentry environment or signing/encryption secret with another.

Local adapters must preserve production contracts (S3-compatible private objects/signed URLs, SMTP/email capture and the exact ToonExpo OpenAPI schema) but cannot be used as evidence that provider IAM, DNS or production integration works. Those are verified in staging.

## CI And Promotion

Every pull request must pass:

- lockfile/frozen install;
- format and lint;
- frontend/backend dependency-boundary check;
- TypeScript strict typecheck;
- unit and API integration tests;
- generated OpenAPI drift and typed-client compatibility check;
- Prisma format/validate and migration-history check against an ephemeral database;
- `apps/web` and `apps/api` production builds;
- dependency vulnerability, license policy and secret scans.

Critical/high vulnerabilities in production dependencies fail CI. A temporary exception requires documented reachability/mitigation, Technical Lead approval and an expiry no longer than 14 days. Unknown licenses and copyleft libraries linked into the application fail CI unless an explicit legal/architecture decision approves them; MIT, ISC, BSD and Apache-2.0 are allowed by default. Unmodified GPL tools in separate build/scan containers (including ClamAV) are permitted with their notices and without linking their code into BOS; AGPL/SSPL components require explicit approval.

Merge to the protected main branch builds immutable web/API artifacts once. Staging deployment uses those artifacts, runs migrations through the dedicated migration identity/job and executes health, contract and available critical Playwright tests. Production promotion requires successful staging evidence plus human approval; artifacts are promoted, not rebuilt.

## Database Migration Rule

- Prisma migrations are committed and applied by one protected job using the direct owner connection.
- Runtime starts only after the migration job succeeds.
- Migrations are forward-only in production. Application rollback cannot assume a destructive database rollback.
- Breaking changes use expand -> deploy compatible code/backfill -> switch reads/writes -> contract in a later release.
- Destructive migration SQL requires explicit Technical Lead approval and a verified restore point.
- Staging rehearses the exact production migration set before promotion.

## Deployment And Rollback

- Vercel deploys `apps/web`; Google Cloud Run deploys the pinned `apps/api` image and ClamAV sidecar. Cloud Scheduler invokes a Cloud Run integration-dispatch Job using the same API image every minute.
- Readiness must pass before traffic reaches a new API revision.
- Failed web/API rollout returns traffic to the last known-good artifact/revision.
- If a forward migration prevents application rollback, ship a forward compatibility fix rather than manually reversing production data.
- Integration failures do not roll back BOS domain transactions; they leave explicit retryable request/publication state.

## Availability And Recovery Objectives

- Internal production availability objective: 99.5% per calendar month, excluding announced maintenance.
- Target RPO: 5 minutes; target RTO: 4 hours.
- The selected Neon production plan must provide [continuous restore/PITR](https://neon.com/blog/announcing-point-in-time-restore) capable of the RPO.
- A restore rehearsal to an isolated database is performed before launch and at least quarterly.
- Production R2 uses unique keys, conditional create-only writes (`If-None-Match: *`), an indefinite [bucket-lock](https://developers.cloudflare.com/r2/buckets/bucket-locks/) rule on the immutable `objects/` prefix and a bucket-scoped runtime token without bucket-configuration permission. Application code has no active-object delete path. Quarantine uses a separate lifecycle-managed prefix. Recovery/access is tested before launch.
- Audit/publication payload exports needed for recovery remain separate from transient logs.

## Observability

- NestJS Pino logs structured JSON with request id, route template, status, duration, actor id when authenticated and redacted error code.
- `apps/web` and `apps/api` report exceptions to separate Sentry projects/environments with source maps and PII filtering.
- Cloud Run metrics cover request rate, p50/p95 latency, 4xx/5xx, instance/concurrency and container memory/CPU.
- Neon monitoring covers connection use, query latency, storage and failed connections.
- Integration metrics cover pending age, attempts, terminal failures, needs-review count and publication version lag.

Initial alerts:

- API 5xx rate above 2% for 5 minutes;
- API p95 above 2 seconds for 10 minutes, excluding attachment finalization;
- readiness failure or crash loop;
- database connection budget above 80%;
- any production map publication failure;
- 3 consecutive ToonExpo provisioning transport failures or oldest pending request above 15 minutes;
- Sentry new high-severity regression.

## Operational Retention

- Application logs: 30 days unless incident/legal hold requires longer.
- Sentry events: 90 days or the closest provider-plan setting.
- Revoked/expired auth sessions and one-time tokens: eligible for purge after 90 days.
- Business records, audit events and publication payloads have no automatic Release 1 purge.

## Required Runbooks Before Production

- user/Admin lockout and MFA recovery;
- database restore/PITR and migration failure;
- R2/attachment scan failure;
- ToonExpo credential rotation/outage and idempotent replay;
- failed/stuck venue-map publication;
- Vercel/Cloud Run rollback;
- suspected secret exposure or account compromise.

Staging can be built while runbooks are drafted; production promotion is blocked until each runbook has an owner and one tabletop/technical verification.

ClamAV definitions update at container startup and periodically into a shared writable volume. Attachment finalization fails closed and alerts when definitions are older than 48 hours; unrelated BOS API readiness remains available.
