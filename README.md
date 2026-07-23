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
