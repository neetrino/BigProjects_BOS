# BOS First Sprint Plan

## Goal

Create the technical skeleton and first usable internal shell without implementing full business workflows yet.

## Deliverables

- monorepo scaffold;
- `apps/web` app shell;
- `apps/api` API shell;
- shared packages;
- TypeScript/lint/format/test baseline;
- env validation;
- initial auth placeholder/decision implementation;
- protected dashboard route;
- side sheet UI primitive;
- Prisma baseline schema;
- Cloud Run deployment config placeholder for `apps/api`.

## Definition Of Done

- `pnpm install` works;
- lint/typecheck pass;
- app shell runs locally;
- API health endpoint works;
- dashboard route is protected;
- docs updated with setup commands;
- no secrets committed.

## Decisions Needed Before Sprint

- auth approach;
- database credentials/provider;
- whether to scaffold NestJS immediately or start API package with placeholder.
