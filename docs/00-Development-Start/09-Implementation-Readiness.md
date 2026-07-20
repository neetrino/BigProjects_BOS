# BOS Release 1 Implementation Readiness

## Status

**READY FOR IMPLEMENTATION** as of 2026-07-20.

Release 1 product, architecture, data, auth, permission, UI and integration decisions are closed. Provider secrets and account creation are external delivery prerequisites, not unresolved documentation decisions.

## Canonical Precedence

When documents conflict, use this order:

1. repository `AGENTS.md` product boundary;
2. [Production Scope](./01-Production-Scope.md);
3. [Tech Card](../TECH_CARD.md) and [Frontend / Backend Boundary](../architecture/FRONTEND_BACKEND_BOUNDARY.md);
4. [Authentication And Security](./07-Authentication-And-Security.md), [Database Schema Baseline](./04-Database-Schema-Draft.md), [API Surface](./08-API-Surface.md), [Delivery And Operations](./10-Delivery-And-Operations.md) and [Integration Contracts](../03-Integration-With-ToonExpo/03-Integration-Contracts.md);
5. Release 1 module specifications and acceptance criteria;
6. UI guidance and roadmap documents;
7. later-phase module concepts and reference templates.

Later-phase Dashboard, Tasks, Onboarding, KPI and Analytics documents are design context only. They cannot add Release 1 tables, routes, navigation or acceptance requirements.

## Closed Decisions

| Area | Release 1 decision |
|---|---|
| Product boundary | Internal BOS only; ToonExpo remains a separate system and source of truth for its product data. |
| Delivery | Production Release 1, implemented incrementally in one Size C monorepo. |
| Runtime | Browser -> Next.js -> NestJS -> Prisma -> PostgreSQL. |
| Toolchain | One strict TypeScript 5.9.x line across all workspaces; TypeScript 6 requires a complete compatibility PR. |
| Validation/client | NestJS class-validator DTO -> OpenAPI -> generated Hey API fetch/types/Zod; browser Zod is UX-only. |
| Persistence runtime | Prisma 7 `@prisma/adapter-pg`, one client per container, pooled runtime URL and direct migration-only URL. |
| Auth | Invite-only email/password, mandatory Admin TOTP, opaque PostgreSQL-backed sessions in secure cookies. |
| Roles | Admin, Staff and Viewer with server-enforced assignment rules. |
| Tenancy | Single BigProjects tenant; Organization is a CRM entity, not an auth tenant. |
| Locale/time | `hy`, `ru`, `en`; default `hy`; timestamps stored UTC and shown in user timezone, default `Asia/Yerevan`. |
| Data lifecycle | Archive/history instead of hard deletion; immutable audit events and publication identity/payload/checksum with advancing attempt/result metadata. |
| Commercial fields | Contract and payment statuses are included lightweight Release 1 fields; amounts require an ISO 4217 currency. |
| Current cycle | Zero or one current cycle, while multiple cycles may be active during overlap. |
| Engagement model | Separate builder and partner engagements; one Organization may have one engagement of each kind in the same cycle. |
| Provisioning trigger | Explicit action after `won`/`confirmed`; no automatic account creation. |
| Access email | ToonExpo owns participant credential/setup delivery; BOS email is only for BOS auth. |
| Files | Private R2 objects attached to supported entities; signed access; no document module. |
| Map | One plan per cycle, original source retained, normalized render asset, deterministic cell geometry and partial active-revision row-run mutation. |
| Pricing | Optional commercial amounts; no accounting/payment processing. |
| Integration transport | HTTPS JSON, bearer service credential, explicit idempotency key, bounded timeout/retry and no shared database. |
| Inbound transport | JSON request bodies are capped at 1 MiB; files use signed R2 transfer. |
| CI | Format, lint, boundary checks, typecheck, tests, OpenAPI/schema checks, builds, migration safety and security scans. |
| Operations | Frankfurt Cloud Run/Neon pair with a staging-latency promotion gate, immutable artifact promotion, forward-only migrations, 99.5% objective, RPO 5 minutes and RTO 4 hours. |

## External Prerequisites

The implementation can start before these values exist. Staging deployment cannot complete until they are supplied through the approved secret stores:

- production/staging root domains and DNS ownership;
- Neon projects/branches and runtime/migration credentials;
- Cloudflare R2 buckets and credentials;
- Resend domain verification and API key for BOS auth emails;
- Sentry projects/DSNs;
- Google Cloud project, Artifact Registry, Cloud Run services and Secret Manager access;
- Vercel project and environment configuration;
- ToonExpo staging endpoint, service credential and contract-test environment;
- GitHub environment protection/required-check configuration.

No secret value belongs in Markdown, source code, fixtures or committed `.env` files.

## Start Gate

Implementation starts at Sprint 0. A sprint may be marked complete only when its documented Definition of Done and relevant module acceptance criteria are automated or demonstrably satisfied. Any scope change after this gate requires an entry in `docs/DECISIONS.md` and updates to affected contracts/acceptance criteria before code merges.

## Intentionally Deferred Product Scope

The following are closed as **not in Release 1**, not left undecided:

- full Dashboard;
- Tasks and configurable Work Spaces;
- Deal Onboarding Checklist;
- Staff/Team KPI;
- Analytics/Report catalog;
- professional visitor routing;
- ToonExpo public, builder, buyer, Constructor CRM, readiness and QR/check-in modules.
