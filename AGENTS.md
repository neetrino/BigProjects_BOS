# Agent Instructions - BigProjects BOS Simple V1

Read `docs/00-DEVELOPMENT-HANDOFF.md` first. Then follow the canonical reading order in `docs/README.md` before implementation.

## Product Scale

- approximately 20 internal users;
- a few ToonExpo cycles per year;
- low concurrent usage;
- Size B, not Size C;
- production quality proportional to this real scale.

Prefer the smallest clear implementation that satisfies the documented workflow. Do not add speculative scalability or enterprise infrastructure.

## Required Boundaries

- `apps/web` is Next.js frontend only;
- `apps/api` is the complete NestJS backend;
- only `apps/api` accesses Prisma/PostgreSQL;
- modules use a simple `controller -> service -> Prisma` structure;
- create shared packages only after real duplication exists.

## Explicitly Forbidden In Release 1

- Task Management, workspaces, onboarding checklist, KPI, dashboard or reports;
- TOTP/MFA and recovery-code systems;
- generated OpenAPI frontend SDK or duplicated generated Zod package;
- DDD-style domain/application/infrastructure/presentation layers for simple CRUD;
- background queues, schedulers, `SKIP LOCKED` dispatchers or automatic retry engines;
- event sourcing, immutable audit/event projections or complex retention systems;
- global file/function size rules that force mechanical splitting;
- arbitrary coverage percentages;
- ToonExpo public, buyer, builder portal, readiness, QR or check-in features.

Swagger/OpenAPI documentation may be generated at runtime from NestJS, but frontend requests remain a small handwritten typed client.

Do not continue into future scope without explicit owner approval. When the requested acceptance criteria pass, stop and report.
