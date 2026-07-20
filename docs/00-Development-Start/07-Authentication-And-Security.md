# BOS Authentication And Security Baseline

## Status

Accepted for Release 1 on 2026-07-20.

## Identity Model

- BOS uses internal email-and-password accounts. There is no public sign-up.
- A BOS Admin invites Staff and Viewer users. The first Admin is created by a one-time, audited bootstrap command.
- Email is unique after trim and lowercase normalization.
- Passwords are hashed with Argon2id using at least 64 MiB memory, 3 iterations and parallelism 1. Parameters are stored with each hash so they can be raised later.
- Passwords are 12-128 characters. Common/compromised passwords are rejected using a pinned offline blocklist updated through normal dependency/data updates; auth does not call a third-party password service at runtime.
- Admin MFA with TOTP is mandatory in production. Staff and Viewer MFA is supported but not mandatory in Release 1.
- TOTP secrets are encrypted with AES-256-GCM using an environment key from Google Secret Manager. Ten single-use recovery codes are generated and stored only as hashes.
- Account statuses are `invited`, `active`, `suspended` and `archived`.

## Session Decision

BOS uses opaque server-side sessions, not browser-stored JWT access/refresh tokens.

- NestJS generates a cryptographically random 256-bit session secret.
- Only a SHA-256 hash of the secret is stored in `auth_sessions`.
- The browser receives the secret in a host-only `__Host-bos_session` cookie with `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, no `Domain` and `Max-Age` no longer than the absolute session lifetime.
- Session idle lifetime is 8 hours and absolute lifetime is 7 days.
- Session id rotates after login, MFA completion, password change, role change and every 24 hours during an active session.
- Password change, suspension and archive revoke all sessions for the affected user.
- Logout revokes the current session. Admin can revoke all sessions for a user.
- An Admin MFA reset requires another Admin. The sole-Admin emergency path is an audited one-time CLI command with direct production operator approval.

Production web and API hosts must be same-site custom domains, for example `bos.<company-domain>` and `api.bos.<company-domain>`. The exact root domain is environment configuration, not an architecture decision. Vercel and Cloud Run default domains are not the production cookie topology.

## CSRF, CORS And Origin Rules

- NestJS accepts credentialed browser requests only from the exact configured BOS web origin; wildcard CORS is forbidden.
- Every state-changing cookie-authenticated request requires a session-bound CSRF token in `X-CSRF-Token` and an allowed `Origin` header.
- `GET /api/v1/auth/csrf` returns the token after the session is established.
- Login, invitation acceptance and password reset validate `Origin` and use their own rate limits.
- API responses containing private BOS data use `Cache-Control: no-store`.

## Browser Security Headers And Content

- Production enables HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive `Permissions-Policy` and `frame-ancestors 'none'`.
- Content Security Policy defaults to `default-src 'self'` and explicitly allowlists only required Vercel/API/Sentry/R2 origins; unsafe inline script and wildcard origins are forbidden.
- Release 1 notes, reasons, names and public labels are plain text. React escapes them and the API rejects control characters/invalid lengths; arbitrary HTML is not stored or rendered.
- Signed R2 URLs are never written to audit logs or error telemetry.

## Auth Lifecycle

```text
Admin invite -> single-use setup link -> password -> Admin TOTP when applicable -> active account
Login -> password -> TOTP when required -> opaque session
Forgot password -> single-use reset link -> password reset -> revoke all sessions
```

- Invitation links expire after 72 hours.
- Password reset links expire after 30 minutes.
- Tokens are random, single-use and stored only as hashes.
- Resend sends BOS invitation and password-reset email. ToonExpo, not BOS, sends ToonExpo participant access email.

## Initial Rate Limits

- Login: 5 failed attempts per normalized email and per IP in 15 minutes, followed by a 15-minute cooldown.
- Invitation acceptance and password reset: 10 requests per IP per hour and 3 emails per account per hour.
- Authenticated API: 300 requests per user per minute, with lower endpoint-specific limits where mutations are expensive.
- Provisioning and map publication: 10 action requests per user per minute; integration retries remain explicitly idempotent.

Limits are configuration values and may be tuned from observed traffic without changing the security model.

Security/action limits use PostgreSQL `rate_limit_buckets` so enforcement is shared across Cloud Run instances; a Redis dependency is not required in Release 1. Keys use HMAC of normalized email/IP/user id with an environment secret so raw identifiers are not stored as bucket keys. Expired buckets are purged operationally.

## Authorization Decision

- BOS is single-tenant for BigProjects. There is no tenant selector or participant tenant boundary in Release 1.
- Admin can view and mutate all Release 1 BOS records and manage users/settings.
- Staff can view all Release 1 operational records. Staff can mutate records assigned to them and records they create; new engagements are assigned to the creator by default.
- Only Admin can reassign an engagement to another user, replace/calibrate a venue source plan, resolve ambiguous ToonExpo company matches, publish a map or manage users/settings.
- Staff can create/edit free areas and allocate them to engagements assigned to that Staff user. Staff cannot edit another user's deal/participation or release its allocation directly.
- Viewer is read-only and cannot create notes, attachments or integration actions.
- NestJS guards and module policies enforce every rule. Frontend hiding is not authorization.

## Secrets And Environments

- Local development uses uncommitted `.env.local` values validated at startup.
- Staging and production API secrets are stored in Google Secret Manager and exposed to Cloud Run at runtime.
- Vercel stores only web runtime configuration and the public API origin; database, R2, Resend and ToonExpo secrets never enter `apps/web`.
- Local development uses containerized PostgreSQL 18, MinIO, ClamAV, Mailpit and a ToonExpo contract stub. Staging and production use separate Neon databases/branches, R2 buckets, Resend configuration, Sentry environments and ToonExpo credentials.
- Secret values and provider account identifiers are deployment prerequisites and must never be written into documentation or Git.

## Required Security Events

Authentication success/failure, MFA enrollment/reset, password reset, role/status change, session revocation, integration credential failure and authorization denial are logged with request id and actor/subject ids. Passwords, session secrets, reset tokens, CSRF tokens and full integration credentials are always redacted.
