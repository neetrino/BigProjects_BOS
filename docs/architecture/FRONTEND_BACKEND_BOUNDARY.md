# Frontend / Backend Boundary

This document is an authoritative implementation rule for BigProjects BOS. If another document, template or generated plan conflicts with it, this document and `docs/TECH_CARD.md` take precedence.

## Runtime Ownership

```text
Browser
  -> apps/web: Next.js 16.2.x + React 19.2.x (Vercel)
  -> HTTPS REST API
  -> apps/api: NestJS 11.1.x (Google Cloud Run)
  -> packages/db: Prisma ORM 7.x
  -> PostgreSQL 18.x (Neon)
```

## `apps/web` - Frontend Only

Next.js owns the presentation layer:

- App Router pages, layouts and route groups;
- Server Components and Client Components for rendering UI;
- forms, browser interaction, accessibility and responsive behavior;
- frontend route protection and redirects for user experience;
- typed calls to the NestJS REST API;
- frontend caching and rendering strategy for API responses.

Next.js must not own:

- product REST endpoints or backend controllers;
- Prisma Client, SQL or direct PostgreSQL access;
- authoritative authentication or authorization decisions;
- business workflows, persistence or integration orchestration;
- product mutations implemented in Server Actions;
- product API implemented in `app/api/**/route.ts`.

Server Components may call the NestJS API. They may not query the database. Server Actions are not used as the product backend; form mutations call the NestJS API through the typed API client.

## `apps/api` - Complete Product Backend

NestJS owns every backend capability:

- REST controllers and OpenAPI documentation;
- authentication, sessions/tokens, RBAC and authorization;
- validation of all external input;
- application services and business rules;
- transactions, repositories and Prisma access;
- audit logging;
- file upload authorization and R2 integration;
- email and ToonExpo provisioning integrations;
- scheduled/background work when introduced;
- health/readiness endpoints, structured logs and error mapping.

Every product mutation must pass through NestJS, including mutations initiated by a Next.js Server Component or form.

## Database Ownership

- Prisma schema, migrations and generated client live in `packages/db`.
- Only `apps/api` may import the runtime Prisma client from `packages/db`.
- `apps/web`, `packages/ui` and browser code may not import `packages/db`.
- Migrations run as a dedicated CI/deploy step, never from the Next.js runtime or a Cloud Run request handler.
- PostgreSQL is the source of truth; frontend caches are disposable projections.

## Contract Ownership

- NestJS controllers and DTOs define the canonical API contract.
- OpenAPI is generated from `apps/api`.
- NestJS Swagger generates `packages/api-client/openapi.json`; `@hey-api/openapi-ts` consumes it into `packages/api-client/src/generated` fetch functions, types and Zod schemas. Only `apps/web` consumes that package. Those paths are committed, CI-regenerated and never hand-edited; `apps/web/src/lib/api-client/browser.ts` owns cookie/CSRF mutations, while server-only `server.ts` forwards request cookies for reads and cannot issue product mutations.
- Generated frontend Zod is UX validation, not a second business-rule implementation. Cross-field, authorization and persistence invariants remain server-only.
- `packages/contracts` contains framework-neutral enums/constants only and must not contain request/response validators or business logic.

## Allowed Exceptions

Next.js framework endpoints may be added only for frontend infrastructure that cannot live in NestJS, such as framework-generated metadata. An exception must be documented in an ADR. It may not access Prisma, PostgreSQL or implement product behavior.

## Review Checklist

- [ ] Product endpoint is a NestJS controller under `apps/api`.
- [ ] Authorization is enforced by NestJS guards/policies.
- [ ] Database access originates only from `apps/api` through `packages/db`.
- [ ] Next.js code uses the typed NestJS API client.
- [ ] Generated API client/Zod output matches the current OpenAPI document and has no manual edits.
- [ ] No product Server Action or Next route handler bypasses NestJS.
- [ ] OpenAPI and frontend client remain synchronized.
