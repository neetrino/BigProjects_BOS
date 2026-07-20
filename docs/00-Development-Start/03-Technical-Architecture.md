# BOS Technical Architecture

## Confirmed Runtime Split

```text
apps/web (Next.js 16.2.x + React 19.2.x on Vercel)
  -> typed HTTPS REST calls
apps/api (NestJS 11.1.x on Google Cloud Run)
  -> Prisma ORM 7.x
PostgreSQL 18.x (Neon)
```

- `apps/web` is frontend only.
- `apps/api` is the complete product backend.
- Only `apps/api` may import the Prisma runtime client or access PostgreSQL.
- Product API routes and mutations must not be implemented with Next.js route handlers or Server Actions.

See [Frontend / Backend Boundary](../architecture/FRONTEND_BACKEND_BOUNDARY.md).

## Stack

- pnpm workspaces + Turborepo;
- Node.js 24.x LTS and TypeScript 6.0.x strict;
- Next.js 16.2.x, React 19.2.x and Tailwind CSS 4.3.x for `apps/web`;
- NestJS 11.1.x REST API and OpenAPI for `apps/api`;
- PostgreSQL 18.x on Neon and Prisma ORM 7.x;
- Vercel for web and Google Cloud Run for the API.
- Konva 10.x with compatible react-konva for the client-side venue-map editor.

## Module Boundaries

Each BOS feature is implemented across explicit layers:

- frontend screens/view models in `apps/web/src/features`;
- NestJS controllers/application services in `apps/api/src/modules`;
- feature business rules in the owning NestJS module domain folder; `packages/domain` is reserved for a small shared kernel only;
- Prisma schema/client/migrations in `packages/db`;
- neutral API enums/schemas in `packages/contracts`;
- reusable presentation components in `packages/ui`.

## API Pattern

- REST endpoints grouped by NestJS module under `/api/v1`.
- NestJS guards own authorization.
- Global NestJS validation and exception handling.
- OpenAPI generated from NestJS controllers/DTOs.
- Frontend client generated from or checked against OpenAPI.
- No public API changes without contract and documentation updates.

## Integration

Release 1 has two required external integrations:

- idempotent ToonExpo company/user provisioning;
- idempotent immutable `VenueMapSnapshotV1` publication.

See [Integration Contracts](../03-Integration-With-ToonExpo/03-Integration-Contracts.md).
