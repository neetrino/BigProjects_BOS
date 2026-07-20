# BOS First Implementation Iteration — Sprint 0

## Goal

Create the technical skeleton and runnable internal shell without implementing authentication or business workflows yet. Authentication begins only after Sprint 0 passes its Definition of Done.

## Execution Order And Ownership

1. Technical Lead: workspace/package/config skeleton and dependency pins.
2. Backend Lead: NestJS bootstrap, env validation, health/errors/logging/OpenAPI and Prisma package boundary.
3. Frontend Lead: Next.js shell, typed API client, login/sheet primitives and protected placeholder workspace.
4. Security/Backend owner: verify auth-ready cookie/CORS/CSRF boundaries and secret separation without implementing login yet.
5. DevOps owner: CI gates, API container and non-secret deployment templates.
6. Technical Lead: integrated Definition-of-Done review; Product Owner confirms the shell matches Release 1 navigation/scope.

One person may hold several roles. Human names are delivery assignments outside the product specification and do not change this order.

## Deliverables

- monorepo scaffold;
- `apps/web` app shell;
- `hy`/`ru`/`en` localization shell and user-locale contract;
- complete NestJS `apps/api` foundation with module structure;
- shared packages;
- TypeScript/lint/format/test baseline;
- env validation;
- local Docker Compose dependencies and ToonExpo contract stub;
- application shell and `/builder-sales` placeholder route;
- side sheet UI primitive;
- Prisma 7 baseline schema imported at runtime only by NestJS;
- NestJS OpenAPI generation and typed frontend API client;
- architecture boundary lint/CI checks;
- Cloud Run Docker/deployment configuration for `apps/api`.

## Definition Of Done

- `pnpm install` works;
- lint/typecheck pass;
- app shell runs locally;
- API health endpoint works;
- OpenAPI document builds from NestJS;
- `apps/web` has no Prisma, database or product API implementation;
- application shell and `/builder-sales` placeholder route render against the API health/config baseline;
- docs updated with setup commands;
- no secrets committed.

## Accepted Inputs

- [Authentication And Security](./07-Authentication-And-Security.md);
- [Database Schema Baseline](./04-Database-Schema-Draft.md);
- [API Surface](./08-API-Surface.md);
- [Implementation Readiness](./09-Implementation-Readiness.md).

Local implementation uses validated development configuration. Real provider credentials are required for staging integration, not for starting the sprint.
