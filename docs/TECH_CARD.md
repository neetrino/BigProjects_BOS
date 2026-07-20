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

Stable-line verification on 2026-07-20: [Node.js 24 LTS](https://nodejs.org/en/download/archive/v24), [Next.js 16.2](https://nextjs.org/blog/next-16-2), [React 19.2](https://react.dev/versions), [TypeScript 6.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html), [Tailwind CSS 4.3](https://tailwindcss.com/blog/tailwindcss-v4-3), [next-intl](https://next-intl.dev/), [NestJS 11](https://docs.nestjs.com/migration-guide), [Prisma ORM 7](https://www.prisma.io/blog/announcing-prisma-orm-7-0-0), [Prisma PostgreSQL 18 support](https://docs.prisma.io/docs/orm/reference/supported-databases), [Neon PostgreSQL 18](https://neon.com/docs/changelog/2026-02-27) and [Konva 10](https://github.com/konvajs/konva/releases).

## Core Stack

| Area | Decision | Status | Notes |
|---|---|---:|---|
| Package manager | pnpm 11.x | Confirmed | Workspace package manager. |
| Monorepo tooling | Turborepo | Confirmed | Size C build/task orchestration. |
| Node.js | 24.x LTS | Confirmed | Production LTS runtime. |
| TypeScript | 6.0.x, strict | Confirmed | Stable ecosystem-compatible compiler baseline. |
| Frontend | Next.js 16.2.x + React 19.2.x latest patched release | Confirmed | `apps/web` presentation layer only; React 19.2.0 is forbidden by the [official RSC security advisory](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components). |
| Frontend styles | Tailwind CSS 4.3.x | Confirmed | With shadcn/ui and custom BOS components. |
| Frontend localization | next-intl latest stable | Confirmed | App Router/Server Component support with preference-based, non-prefixed routes. |
| Venue map rendering | Konva 10.x + compatible react-konva | Confirmed | Client-side 2D grid/area editor; domain state persists through NestJS, not Konva JSON. |
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

TypeScript 6.0 is the selected stable compiler baseline. Do not adopt the TypeScript 7 native compiler line until it is stable and the chosen NestJS/Next.js/lint/codegen toolchain passes an ADR-backed compatibility evaluation.

| Parameter | Decision |
|---|---|
| Responsibility | Internal BOS pages, workspaces, sheets, forms and browser interaction |
| Rendering | Next.js App Router, Server Components by default, Client Components where interactive |
| Data access | Typed HTTP client calling the NestJS API |
| Forms | React Hook Form + Zod for frontend feedback; NestJS repeats authoritative validation |
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
| Validation | Global `ValidationPipe`; class-validator DTOs unless an ADR approves another standard |
| Documentation | Swagger/OpenAPI generated from NestJS controllers and DTOs |
| Persistence | Repositories/services call Prisma through `packages/db` |
| Errors | Global NestJS exception filter with stable problem codes and request IDs |
| Logging | Pino structured logs with sensitive-field redaction |
| Uploads | NestJS authorizes and signs R2 uploads or receives uploads when required |

## Database - `packages/db`

| Parameter | Decision |
|---|---|
| Database | PostgreSQL 18.x on Neon |
| ORM | Prisma ORM 7.x using the Prisma 7 generator/output conventions |
| Runtime owner | Only `apps/api` may import and execute the Prisma client |
| Schema changes | Prisma migrations committed to the repository |
| Migration execution | One dedicated CI/deploy job; never a web request or Next.js build |
| Runtime credentials | Pooled DML-only application role |
| Migration credentials | Direct owner connection available only to migration jobs |
| Seed data | Explicit dev/test seed scripts |
| Cache/queues | No Redis initially; low-volume shared security throttles use PostgreSQL and Redis requires a measured/ADR-backed need |

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
| Contract | OpenAPI generation and frontend client compatibility check |
| Frontend component | React Testing Library where behavior warrants it |
| End to end | Playwright for critical internal workflows |

Required pull-request gates are format check, lint, frontend/backend boundary check, typecheck, unit tests, API integration tests, OpenAPI drift check, Prisma validation/migration check, web build, API build and dependency/secret scanning. Critical Playwright flows gate promotion after the relevant workflow exists.

## Monorepo Layout

```text
apps/
  web/                  # Next.js frontend only
  api/                  # NestJS complete product backend
packages/
  domain/               # small shared kernel only; feature domains stay in API modules
  contracts/            # framework-neutral API enums/schemas where shared
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
