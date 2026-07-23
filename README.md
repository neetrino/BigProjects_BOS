# BigProjects BOS

BigProjects BOS is a small internal operating tool for approximately 20 BigProjects employees.

Release 1 contains two lightweight Kanban workflows and one interactive venue-space map:

- Builder Sales CRM;
- Partner Relations;
- Venue Sales Map connected to CRM and partner records.

The product is intentionally simple. It is a production application for a small internal team, not an enterprise platform.

## Runtime Boundary

```text
Browser -> Next.js frontend -> NestJS API -> Prisma -> PostgreSQL
```

- Next.js owns frontend pages and interaction only.
- NestJS owns all backend behavior and business rules.
- Only NestJS may access Prisma/PostgreSQL.

## Documentation

Read [Documentation Hub](./docs/README.md) first.

Canonical documents:

- [Development Handoff](./docs/00-DEVELOPMENT-HANDOFF.md)
- [Release 1 Scope](./docs/00-SCOPE.md)
- [Architecture](./docs/01-ARCHITECTURE.md)
- [Tech Card](./docs/TECH_CARD.md)
- [Implementation Roadmap](./docs/06-IMPLEMENTATION-ROADMAP.md)
- [Acceptance Criteria](./docs/07-ACCEPTANCE.md)

## Project Size

`Size: B - medium, layout: simple feature-based monorepo.`

The previous enterprise-style implementation is preserved in the `sipan` branch. It is reference material only and must not define the architecture of this branch.

## Local Development

### Prerequisites

- Node.js 22+ and pnpm
- Docker (for local PostgreSQL)

### Setup

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm dev
```

`docker compose up -d` starts PostgreSQL 18 on port `5433` with database `bos`.

Run apps individually if needed:

```bash
pnpm --filter @bos/api dev
pnpm --filter @bos/web dev
```

### URLs

- Web: http://localhost:3000
- API health: http://localhost:4000/api/v1/health

### Quality commands

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
