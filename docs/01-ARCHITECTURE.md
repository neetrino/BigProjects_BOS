# BigProjects BOS Architecture

## Decision

**Project size:** B - medium

**Style:** simple feature-based modular application
**Repository:** one monorepo with two deployables

```text
Browser -> apps/web (Next.js) -> apps/api (NestJS) -> Prisma -> PostgreSQL
```

## Responsibilities

### Next.js Frontend

- pages, navigation and localization;
- Kanban, tables, cards, sheets, forms and map interaction;
- small handwritten typed API client;
- no Prisma imports;
- no direct database access;
- no authoritative business rules;
- no product API endpoints or mutations implemented in Next.js.

### NestJS Backend

- authentication and role checks;
- validation;
- all business rules;
- persistence through Prisma;
- file metadata and signed upload handling;
- ToonExpo HTTP integration;
- Swagger/OpenAPI documentation.

### PostgreSQL

- users and sessions;
- cycles, companies and contacts;
- deals and partner participations;
- venue plans, areas, cells and allocations;
- notes and attachment metadata.

## Repository Layout

```text
bigprojects-bos/
  apps/
    web/
      src/
        app/
        features/
          auth/
          cycles/
          organizations/
          builder-crm/
          partners/
          venue-map/
          settings/
        components/
        lib/api/
    api/
      src/
        auth/
        cycles/
        organizations/
        builder-crm/
        partners/
        venue-map/
        attachments/
        toonexpo/
        common/
        prisma/
  prisma/
    schema.prisma
    migrations/
  docs/
```

Do not create `packages/domain`, `packages/contracts`, `packages/api-client` or other packages before real duplication proves they are needed.

## Backend Module Pattern

Use this pattern by default:

```text
feature/
  feature.controller.ts
  feature.service.ts
  dto/
```

The service may use Prisma directly. Add a repository only when queries become genuinely complex or require a reusable test boundary.

Do not create separate domain, application, infrastructure, mapper, command, policy and guard files for ordinary CRUD.

## API Contract

- REST JSON API under `/api/v1`;
- NestJS DTOs validate requests;
- Swagger/OpenAPI is generated for documentation;
- frontend types are handwritten close to the small API client;
- no generated frontend SDK in Release 1.

## Authentication

- accounts are created by an Admin;
- email and password login;
- password hashes use Argon2id;
- server-side session stored in PostgreSQL;
- secure HTTP-only cookie;
- basic login rate limiting;
- CSRF protection for cookie-authenticated mutations;
- no TOTP/MFA in Release 1.

## Files

Attachments belong to a company, deal or partner record. There is no separate Files module.

- production objects: Cloudflare R2;
- local development: MinIO or a simple compatible adapter;
- PostgreSQL stores only metadata and object keys.

## Deployment

- frontend: Vercel;
- backend: Google Cloud Run;
- database: Neon PostgreSQL;
- attachments: Cloudflare R2.

No Redis, message broker, Cloud Scheduler or worker service is required for Release 1.

## Testing

Required:

- unit tests for critical status and allocation rules;
- API tests for authentication and core mutations;
- a small Playwright smoke flow for login, CRM and map assignment;
- lint, typecheck and production builds.

No mandatory global coverage percentage. Test depth follows business risk.
