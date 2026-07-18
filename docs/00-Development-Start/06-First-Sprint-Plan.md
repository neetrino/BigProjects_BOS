# BOS First Sprint Plan

## Goal

Create the technical skeleton and first usable internal shell without implementing full business workflows yet.

## Deliverables

- monorepo scaffold;
- `apps/web` app shell;
- complete NestJS `apps/api` foundation with module structure;
- shared packages;
- TypeScript/lint/format/test baseline;
- env validation;
- NestJS-owned auth foundation after session strategy confirmation;
- protected dashboard route;
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
- dashboard route is protected;
- docs updated with setup commands;
- no secrets committed.

## Decisions Needed Before Sprint

- auth approach;
- database credentials/provider;
- exact backend session/cookie strategy.
