# BigProjects BOS Tech Card

## Status

Accepted Release 1 architecture baseline. Provider credentials and environment-specific domains are deployment prerequisites, not open architecture decisions.

## Project Size

Size C - large, layout: monorepo (`apps/*`, `packages/*`).

## Date

2026-07-20

## Delivery Model

BigProjects BOS is a full production product. It is not a prototype or MVP. Release planning may split implementation into stages, but every included module must be designed for production operation, security, maintainability and complete acceptance criteria.

## Version Policy

- Use stable production releases only; no canary, beta or release candidate packages.
- Pin exact dependency versions in `pnpm-lock.yaml` and container images.
- Stay on the major/minor lines below and install the latest security patch available at implementation time.
- Upgrade major versions only through an explicit architecture decision and migration plan.

Stable-line verification on 2026-07-20: [Node.js 24 LTS](https://nodejs.org/en/download/archive/v24), [Next.js 16.2](https://nextjs.org/blog/next-16-2), [React 19.2](https://react.dev/versions), [TypeScript 5.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html), [Tailwind CSS 4.3](https://tailwindcss.com/blog/tailwindcss-v4-3), [next-intl](https://next-intl.dev/), [NestJS 11](https://docs.nestjs.com/migration-guide), [Prisma ORM 7](https://www.prisma.io/blog/announcing-prisma-orm-7-0-0), [Prisma PostgreSQL 18 support](https://docs.prisma.io/docs/orm/reference/supported-databases), [Neon PostgreSQL 18](https://neon.com/docs/changelog/2026-02-27), [Hey API](https://heyapi.dev/), [Konva 10](https://github.com/konvajs/konva/releases) and [react-konva 19.2](https://www.npmjs.com/package/react-konva).

## Core Stack

| Area | Decision | Status | Notes |
|---|---|---:|---|
| Package manager | pnpm 11.x | Confirmed | Workspace package manager. |
| Monorepo tooling | Turborepo | Confirmed | Size C build/task orchestration. |
| Node.js | 24.x LTS | Confirmed | Production LTS runtime. |
| TypeScript | 5.9.x, strict | Confirmed | One version across the monorepo; matches the accepted NestJS 11 toolchain baseline. |
| Frontend | Next.js 16.2.x + React 19.2.x latest patched release | Confirmed | `apps/web` presentation layer only; React 19.2.0 is forbidden by the [official RSC security advisory](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components). |
| Frontend styles | Tailwind CSS 4.3.x | Confirmed | With shadcn/ui and custom BOS components. |
| Frontend localization | next-intl latest stable | Confirmed | App Router/Server Component support with preference-based, non-prefixed routes. |
| Venue map rendering | Konva 10.x + react-konva 19.2.x | Confirmed | Client-side 2D grid/area editor; domain state persists through NestJS, not Konva JSON. |
| Backend | NestJS 11.1.x | Confirmed | `apps/api` owns the complete product backend. |
| API | REST + OpenAPI | Confirmed | NestJS controllers are canonical. |
| Database | PostgreSQL 18.x on Neon | Confirmed | Neon PostgreSQL 18 is production GA. |
| ORM | Prisma ORM 7.x | Confirmed | Runtime database access from NestJS only. |
| Authentication | NestJS Auth module + Passport | Confirmed | Invite-only credentials, Admin TOTP and opaque PostgreSQL-backed sessions. |
| File storage | Cloudflare R2 | Confirmed | Private attachment/source assets with signed access. |
| Email | Resend | Confirmed | BOS invitations and password resets only; ToonExpo sends participant access email. |
| Error tracking | Sentry | Confirmed | Separate web/API projects or environments with sensitive-data filtering. |
| Frontend hosting | Vercel | Confirmed | Deploys `apps/web`. |
| Backend hosting | Google Cloud Run | Confirmed | Deploys containerized `apps/api`. |
| CI/CD | GitHub Actions | Confirmed | Required checks and dedicated migration/deploy jobs. |

## Frontend - `apps/web`

TypeScript 5.9 is the selected production compiler baseline for every workspace package. TypeScript 6 adoption requires a separate compatibility PR proving NestJS decorators/CLI, Swagger, Prisma generation, Hey API generation, lint, unit/integration tests and both production builds; do not split compiler versions between web and API.

| Parameter | Decision |
|---|---|
| Responsibility | Internal BOS pages, workspaces, sheets, forms and browser interaction |
| Rendering | Next.js App Router, Server Components by default, Client Components where interactive |
| Data access | Generated `packages/api-client` fetch SDK calling the NestJS API |
| Forms | React Hook Form + generated Zod schemas for UX feedback; NestJS remains authoritative |
| Server state | API-driven; React Query only where client revalidation is needed |
| Local state | React state; Zustand is allowed for the complex venue-map editor session only when needed |
| Forbidden | Prisma, SQL, direct PostgreSQL, product route handlers, backend Server Actions, authoritative auth/business logic |

Localization is built into the initial shell: `hy`, `ru` and `en` message catalogs, user preference, Armenian/Cyrillic-capable font fallback and no hard-coded user-facing strings in feature components. Default locale is `hy`; fallback is `en`. Routes are not locale-prefixed. Login can set a non-sensitive `bos_locale` preference cookie; after login the StaffProfile locale is canonical and changing it updates both profile and cookie.

Next.js Server Components may fetch the NestJS API. Server Actions must not implement product mutations; forms call NestJS endpoints.

## Backend - `apps/api`

| Parameter | Decision |
|---|---|
| Framework | NestJS 11.1.x modular monolith |
| Responsibility | All auth, RBAC, validation, business logic, persistence, audit and integrations |
| HTTP | REST controllers with `/api/v1` version prefix |
| Validation | Global `ValidationPipe`; class-validator DTOs are the sole manually authored HTTP validation contract |
| Documentation | Swagger/OpenAPI generated from NestJS controllers and DTOs |
| Persistence | Repositories/services call Prisma through `packages/db` |
| Errors | Global NestJS exception filter with stable problem codes and request IDs |
| Logging | Pino structured logs with sensitive-field redaction |
| Uploads | NestJS authorizes and signs R2 uploads or receives uploads when required |

## API Contract And Client Generation

NestJS controllers and class-validator DTOs are the only manually authored HTTP contract. The Swagger generation command writes the committed artifact to `packages/api-client/openapi.json`; `@hey-api/openapi-ts` consumes it and writes the fetch SDK, TypeScript models and Zod request/response schemas to `packages/api-client/src/generated`. Consumers do not require a running API during install/build; CI regenerates both locations and fails on any diff. Files under `src/generated` are never edited manually. The hand-written `apps/web/src/lib/api-client/` boundary configures the generated client: `browser.ts` owns runtime base URL, `credentials: include`, session-bound CSRF headers on mutations and request IDs; `server.ts` is server-only/read-only and forwards the current request cookie for Server Component reads. Stable problem-response parsing is shared inside this boundary, and product mutations never use the server adapter.

Generated Zod expresses only constraints present in OpenAPI. Frontend validation is an early UX aid: cross-field custom validators, authorization and business/database invariants remain NestJS/PostgreSQL responsibilities and must not be manually duplicated in browser schemas. `packages/contracts` contains only framework-neutral enums/constants that genuinely need compile-time sharing; it contains no second request/response validation implementation.

## Database - `packages/db`

| Parameter | Decision |
|---|---|
| Database | PostgreSQL 18.x on Neon |
| ORM | Prisma ORM 7.x using the Prisma 7 generator/output conventions |
| Runtime adapter | `@prisma/adapter-pg` using the pooled DML-only `DATABASE_URL` |
| Prisma config | `prisma.config.ts` explicitly loads local env and uses direct `DIRECT_URL` for CLI/migrations |
| Runtime owner | Only `apps/api` may import and execute the Prisma client |
| Schema changes | Prisma migrations committed to the repository |
| Migration execution | One dedicated CI/deploy job; never a web request or Next.js build |
| Runtime credentials | Pooled DML-only application role |
| Migration credentials | Direct owner connection available only to migration jobs |
| Seed data | Explicit dev/test seed scripts |
| Cache/queues | No Redis initially; low-volume shared security throttles use PostgreSQL and Redis requires a measured/ADR-backed need |

`apps/api` creates one `PrismaClient` per Cloud Run container and reuses it across requests; request handlers never call `$disconnect()`. Pool size and acquisition/idle timeouts are configured in the `pg` adapter rather than legacy Prisma URL parameters. The protected migration job is the only runtime given the direct owner URL.

## Authentication And Security

| Parameter | Decision | Status |
|---|---|---:|
| Auth owner | NestJS API | Confirmed |
| Roles | BOS Admin, BOS Staff, BOS Viewer | Confirmed |
| Credentials | Invite-only internal email/password; Admin TOTP | Confirmed |
| Session transport | Opaque server-side session in secure httpOnly cookie | Confirmed |
| Password hashing | argon2id | Confirmed when passwords are used |
| Authorization | NestJS guards/policies on every protected operation | Confirmed |
| CORS/CSRF | Explicit allowlist and CSRF protection for cookie mutations | Confirmed |
| Rate limits | Auth, provisioning and publication endpoint-specific limits | Confirmed |
| Audit | Stage, allocation, map publication and provisioning changes | Confirmed |

## Testing

| Layer | Tool / expectation |
|---|---|
| Domain/application unit | Vitest, focused on business rules and services |
| API integration | Nest testing utilities + Supertest against test database |
| Contract | OpenAPI generation plus deterministic Hey API client/Zod regeneration and drift check |
| Frontend component | React Testing Library where behavior warrants it |
| End to end | Playwright for critical internal workflows |

Required pull-request gates are format check, lint, frontend/backend boundary check, typecheck, unit tests, API integration tests, OpenAPI + Hey API regeneration drift check, Prisma validation/migration check, web build, API build and dependency/secret scanning. Critical Playwright flows gate promotion after the relevant workflow exists.

## Monorepo Layout

```text
apps/
  web/                  # Next.js frontend only
  api/                  # NestJS complete product backend
packages/
  domain/               # small shared kernel only; feature domains stay in API modules
  contracts/            # framework-neutral enums/constants only
  api-client/           # committed openapi.json plus generated-only src/generated; web-facing
  db/                   # Prisma schema/client/migrations; API runtime only
  ui/                   # reusable React UI
  shared/               # environment-neutral utilities
  config/               # shared build/lint/type configuration
```

## Non-Negotiable Runtime Boundary

- Request flow: browser -> Next.js UI -> NestJS REST API -> Prisma -> PostgreSQL.
- `apps/web` never imports Prisma, queries PostgreSQL or implements product endpoints.
- `apps/api` is the only product backend and runtime database owner.
- Auth, authorization and business mutations are always enforced by NestJS.
- A scheduled Cloud Run Job may run the same API image's integration-dispatch command for persisted ToonExpo attempts; it is not a second product backend.
- Canonical rules: [Frontend / Backend Boundary](./architecture/FRONTEND_BACKEND_BOUNDARY.md).

## Environment Values Required Before Staging

- Neon, R2, Resend, Sentry, Vercel and Google Cloud accounts/credentials;
- ToonExpo staging endpoint and service credential;
- staging and production root domains/DNS;
- environment-specific pool/concurrency tuning after the documented safe defaults.

These values must be supplied through Vercel environment configuration and Google Secret Manager. They are intentionally absent from documentation and Git. The closed auth/session design is defined in [Authentication And Security](./00-Development-Start/07-Authentication-And-Security.md).
