# BigProjects BOS Tech Card

## Project Size

`Size: B - medium, layout: simple feature-based monorepo.`

## Scale

- approximately 20 internal users;
- low concurrency;
- a few event cycles per year;
- desktop-first internal usage;
- no public traffic.

## Stack

| Area | Choice |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Backend | NestJS 11, TypeScript |
| Database | PostgreSQL 18 on Neon |
| ORM | Prisma 7 |
| UI | Tailwind CSS and accessible React primitives |
| Map | Konva 10 with react-konva |
| Localization | Armenian, Russian and English |
| File storage | Cloudflare R2; MinIO locally if needed |
| Frontend hosting | Vercel |
| Backend hosting | Google Cloud Run |
| API documentation | NestJS Swagger/OpenAPI |

## Deliberate Non-Choices

- no generated OpenAPI frontend client;
- no DDD layer stack;
- no microservices;
- no Redis;
- no queue or scheduler;
- no TOTP/MFA;
- no event sourcing;
- no immutable audit projection;
- no strict file/function line limits;
- no arbitrary test coverage threshold.

## Quality Baseline

- frontend/backend boundary remains strict;
- all inputs validated by NestJS;
- passwords and sessions handled securely;
- Prisma migrations are committed and reviewed;
- critical business rules are tested;
- errors are logged with request context;
- production secrets stay outside Git;
- implementation stops when Release 1 acceptance criteria pass.
