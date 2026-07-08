# BOS Technical Architecture

## Recommended Stack

Pending confirmation:

- Next.js App Router for `apps/web`;
- NestJS REST API for `apps/api`;
- Google Cloud Run hosts `apps/api`;
- PostgreSQL + Prisma;
- pnpm workspaces + Turborepo;
- shared packages for domain/contracts/db/ui/shared/config.

## Module Boundaries

Each BOS module should have:

- domain rules in `packages/domain`;
- contracts/DTOs in `packages/contracts`;
- persistence in `packages/db`;
- API handlers/services in `apps/api`;
- screens/components in `apps/web`.

## UI Pattern

- Workspace pages: dashboard, CRM board/list, tasks, reports, settings.
- Entity details: side sheet.
- Related entities: stacked sheet.
- Quick actions: short dialog.

## API Pattern

- REST endpoints grouped by module.
- Zod/class-validator validation at boundaries.
- OpenAPI generated from API definitions if NestJS is confirmed.
- No public API changes without docs update.

## Integration

Provisioning contract is the only required v1 external integration.

See [Integration Contracts](../03-Integration-With-ToonExpo/03-Integration-Contracts.md).
