# BigProjects BOS - Technical Architecture

Internal business operating system for BigProjects. BOS manages event cycles, participant sales, onboarding, internal tasks, KPI, analytics and ToonExpo account provisioning.

**Project size:** C - large  
**Architecture style:** modular monolith in a monorepo  
**Primary deployables:** `apps/web` and `apps/api`  
**Last updated:** 2026-07-17

---

## 1. Architecture Thesis

BigProjects BOS is not a public website and not the ToonExpo participant platform. It is an internal operational system where the team organizes each ToonExpo cycle from the first lead to approved participation and account provisioning.

The correct architecture is a **modular monolith**:

- one product repository;
- one Next.js operational web app;
- one NestJS API deployed as a container to Google Cloud Run;
- shared packages for domain logic, contracts, database, UI and tooling;
- strict module boundaries so CRM, cycles, onboarding, tasks, KPI and provisioning do not become one tangled codebase.

This gives the team enough structure for a large product without the cost and confusion of microservices.

BOS is a full production product, not an MVP or prototype. The implementation may be delivered incrementally, but the architecture, security, migrations, observability and acceptance criteria must be production-ready from the first release.

### Authoritative runtime boundary

```text
Browser -> Next.js frontend -> NestJS REST API -> Prisma -> PostgreSQL
```

`apps/web` is never a second backend. It must not contain product API routes, product mutations in Server Actions, Prisma imports, direct database access or authoritative business rules. All backend behavior belongs to `apps/api`. See [Frontend / Backend Boundary](./architecture/FRONTEND_BACKEND_BOUNDARY.md).

---

## 2. System Context

```mermaid
flowchart LR
  Staff["BigProjects Staff"]
  Admin["BOS Admin"]
  Web["apps/web\nNext.js Operational UI\nVercel"]
  Api["apps/api\nNestJS API\nGoogle Cloud Run"]
  Db["PostgreSQL / Neon"]
  R2["Cloudflare R2\nattachments"]
  Email["Resend\nemails"]
  ToonExpo["ToonExpo Ecosystem\nprovisioning endpoint"]
  Sentry["Sentry\nerrors"]

  Staff --> Web
  Admin --> Web
  Web -->|"REST + session"| Api
  Api --> Db
  Api --> R2
  Api --> Email
  Api --> ToonExpo
  Api --> Sentry
  Web --> Sentry
```

### Boundary

BOS owns internal operational work. ToonExpo owns public/builder/buyer platform work.

BOS sends only the minimum required provisioning request to ToonExpo when a participant is approved. BOS does not mirror ToonExpo inventory, buyer, QR or CRM data.

---

## 3. Runtime Components

| Component | Path | Responsibility | Deployment |
|---|---|---|---|
| Web app | `apps/web` | Internal dashboards, CRM boards, deal sheets, tasks, reports, settings | Vercel |
| API app | `apps/api` | Business logic, RBAC, validation, persistence, provisioning integration | Google Cloud Run |
| Domain package | `packages/domain` | Small shared kernel for cross-module value objects only | bundled into API |
| Contracts package | `packages/contracts` | DTOs, Zod schemas, enums, API contracts | bundled |
| Database package | `packages/db` | Prisma schema, migrations, database client, persistence mapping | bundled |
| UI package | `packages/ui` | Shared UI primitives: cards, sheets, tables, filters, forms | bundled |
| Shared package | `packages/shared` | Utilities, constants, logger interfaces, formatting helpers | bundled |
| Config package | `packages/config` | ESLint, TypeScript, Tailwind, Prettier and build config | bundled |

---

## 4. Monorepo Layout

```text
bigprojects-bos/
  apps/
    web/
      src/
        app/                  # Next.js App Router
        features/             # feature UI by module
        components/           # app-level components
        lib/                  # typed NestJS API client, UI auth state, config
      public/
    api/
      src/
        modules/              # NestJS product modules
        common/               # guards, decorators, filters, interceptors
        integrations/         # ToonExpo provisioning client
        main.ts
      Dockerfile              # Cloud Run container target
  packages/
    domain/                   # small shared kernel; feature domains stay in API modules
    contracts/                # schemas, DTOs, enums
    db/                       # Prisma schema/client/migrations; API runtime only
    ui/                       # reusable UI primitives
    shared/                   # utility helpers
    config/                   # shared tooling config
  docs/
  package.json
  pnpm-workspace.yaml
  turbo.json
```

The first implementation should create this skeleton before individual business modules are built.

---

## 5. Dependency Rules

```mermaid
flowchart TD
  Web["apps/web"]
  Api["apps/api"]
  UI["packages/ui"]
  Contracts["packages/contracts"]
  Domain["packages/domain"]
  DB["packages/db"]
  Shared["packages/shared"]
  Config["packages/config"]

  Web --> UI
  Web --> Contracts
  Web --> Shared
  Api --> Contracts
  Api --> Domain
  Api --> DB
  Api --> Shared
  UI --> Shared
  DB --> Domain
  Web --> Config
  Api --> Config
```

Hard rules:

- `packages/domain` is a small shared kernel, not a global home for all business logic; it must not import Next.js, NestJS, Prisma, React or browser APIs.
- Feature-specific domain rules live in `apps/api/src/modules/<module>/domain`.
- `packages/db` maps database records to domain concepts; it does not own business policy.
- `packages/contracts` owns framework-neutral request/response shapes and status enums; canonical HTTP contracts are generated from NestJS OpenAPI.
- `apps/web` never imports Prisma or server secrets.
- `apps/web` does not import `packages/domain`; it consumes API contracts and view models.
- `apps/api` is the only runtime that talks directly to the database and backend external services.
- Product endpoints must not be implemented in Next.js route handlers.
- Product mutations must not be implemented as Next.js Server Actions.
- Cross-module imports go through public module exports, not deep internal paths.

---

## 6. Domain Modules

| Module | Owner | Core responsibility |
|---|---|---|
| Dashboard | BOS | Operational overview for the current cycle, deals, onboarding, tasks and KPI |
| Event Cycles | BOS | Creates cycle containers such as `ToonExpo 2026-Q1`; all deals belong to a cycle |
| Internal CRM / Deals | BOS | Companies, contacts, participant deals, pipeline stages and deal sheets |
| Deal Onboarding Checklist | BOS | Template-based checklist copied into each deal, with controlled updates for active deals |
| Tasks & Processes | BOS | Global task area plus workspaces for marketing, event prep, sales, operations and other directions |
| Staff / Team KPI | BOS | Staff activity, responsibility, performance indicators and manager visibility |
| Analytics / Reports | BOS | Cycle reports, sales numbers, onboarding progress, staff metrics and exports |
| ToonExpo Account Provisioning | BOS -> ToonExpo | Creates builder/partner accounts in ToonExpo after participant approval |

Coming-soon modules may exist in docs, but the initial production release must not block on them.

---

## 7. Core Data Flows

### 7.1 Event Cycle Flow

```mermaid
sequenceDiagram
  participant Admin as BOS Admin
  participant BOS as BOS API
  participant DB as PostgreSQL

  Admin->>BOS: Create event cycle
  BOS->>DB: Store cycle
  Admin->>BOS: Create participant deals inside cycle
  BOS->>DB: Store deals linked to cycle
  Admin->>BOS: Review reports by cycle
  BOS->>DB: Query cycle metrics
```

### 7.2 Deal And Onboarding Flow

```mermaid
sequenceDiagram
  participant Staff as Staff
  participant CRM as CRM Deal Sheet
  participant API as BOS API
  participant DB as PostgreSQL

  Staff->>CRM: Create deal
  CRM->>API: POST /deals
  API->>DB: Create deal + copy active checklist template
  Staff->>CRM: Mark checklist item done
  CRM->>API: PATCH /deals/:id/checklist/:itemId
  API->>DB: Save status + activity log
```

### 7.3 ToonExpo Provisioning Flow

```mermaid
sequenceDiagram
  participant Manager as BOS Manager
  participant BOS as BOS API
  participant Toon as ToonExpo API
  participant Mail as Email

  Manager->>BOS: Approve participant for ToonExpo
  BOS->>Toon: Provision company and user access
  Toon-->>BOS: Provisioning result
  BOS->>Mail: Send access delivery email if configured
  BOS-->>Manager: Show status in deal sheet
```

Provisioning must be idempotent. Retrying the same approved deal must not create duplicate ToonExpo companies or users.

---

## 8. Frontend Architecture

BOS frontend is an operational workspace. It should be dense, fast and predictable.

### UI model

```text
workspace page -> card/row -> side sheet
linked entity   -> stacked sheet
short action    -> dialog or inline confirmation
```

Full pages are reserved for true workspaces:

- Dashboard;
- Event Cycles;
- CRM board/list;
- Tasks & Processes;
- Staff / KPI;
- Reports;
- Settings.

Entity details open in side sheets. A deal, company, contact, task or checklist item should not force the user to leave the current workspace unless it is a full workflow.

### Frontend feature layout

```text
apps/web/src/features/
  dashboard/
  cycles/
  crm/
  onboarding-checklist/
  tasks/
  staff-kpi/
  reports/
  provisioning/
  settings/
```

Each feature should expose only its public UI and hooks. Shared primitives belong in `packages/ui`; business-specific screens stay in `apps/web/src/features`.

Frontend data rules:

- Server Components may fetch the NestJS API for initial rendering.
- Client Components may use the same typed API client through query/mutation hooks.
- Forms may validate locally for user feedback, but NestJS repeats authoritative validation.
- Route protection in Next.js improves navigation only; NestJS guards enforce real authorization.
- `app/api` and Server Actions are not product backend extension points.

---

## 9. Backend Architecture

The API is the complete backend and runs as a NestJS modular monolith. Each module owns its controllers, application services, domain policies, persistence adapters and permission checks.

```text
apps/api/src/modules/
  auth/
  users/
  cycles/
  companies/
  contacts/
  deals/
  onboarding-checklists/
  tasks/
  kpi/
  reports/
  provisioning/
  audit-log/
```

Recommended internal module shape:

```text
modules/deals/
  presentation/
    deals.controller.ts
    dto/
  application/
    commands/
    queries/
    deals.service.ts
  domain/
    deal.policy.ts
    deal.errors.ts
  infrastructure/
    prisma-deals.repository.ts
  deals.module.ts
```

API rules:

- REST endpoints grouped by module.
- OpenAPI/Swagger generated from controllers and DTOs.
- Request validation at the boundary.
- RBAC and ownership checks before business mutations.
- Audit logs for important status, provisioning and checklist changes.
- No business workflow hidden in React components.
- No product controller, repository or integration orchestration in `apps/web`.
- Cross-module writes go through the owning module's application service.

---

## 10. Data Architecture

BOS data is cycle-centered.

Core entities:

| Entity | Purpose |
|---|---|
| User | Internal BOS user |
| StaffProfile | Staff metadata, KPI visibility and responsibility |
| EventCycle | Operational container for each ToonExpo iteration |
| Company | Long-lived company/person organization record |
| Contact | Person connected to a company or deal |
| Deal | Cycle-specific participant sales/onboarding record |
| DealStage | CRM pipeline stage |
| ChecklistTemplate | Admin-managed onboarding checklist template |
| DealChecklistItem | Checklist copy attached to a deal |
| TaskWorkspace | Visual/task grouping such as marketing or event prep |
| Task | Work item linked to workspace, cycle, deal or staff |
| KpiRecord | Staff/team metric record |
| ProvisioningRequest | BOS -> ToonExpo account creation request |
| ActivityLog | Important timeline/audit event |
| Attachment | File metadata attached to entities |

Database implementation:

- PostgreSQL 18.x on Neon;
- Prisma ORM 7.x schema, generated client and migrations stored in `packages/db`;
- only `apps/api` imports the runtime Prisma client;
- migrations run once from CI/deployment tooling, not from Next.js or an API request;
- soft delete only where audit/history matters;
- timestamps and actor IDs on important mutations;
- indexes on cycle, deal stage, assignee, company, provisioning status and task status.

---

## 11. Integration Boundary With ToonExpo

BOS is the source of truth for internal participant acquisition and event preparation.

ToonExpo is the source of truth for public platform accounts, projects, apartments, buyer QR, CRM leads and exhibition experience.

Required initial production integration:

```text
BOS approved deal
  -> provisioning request
  -> ToonExpo creates company/user/module access
  -> ToonExpo returns status and external IDs
  -> BOS stores status on the deal/provisioning request
```

Not part of the current production scope:

- syncing ToonExpo buyer data back to BOS;
- syncing builder apartment inventory to BOS;
- duplicating ToonExpo CRM inside BOS;
- event check-in reporting inside BOS unless a later reporting requirement appears.

---

## 12. Security Model

Security baseline:

- NestJS-owned authentication using Passport and the confirmed cookie/session strategy;
- httpOnly secure cookies;
- role checks: BOS Admin, BOS Staff, BOS Viewer;
- entity ownership/context checks for staff-level visibility if needed in v2;
- input validation for every API mutation;
- rate limits on auth and provisioning endpoints;
- no secrets in frontend code;
- audit log for status changes, provisioning attempts and checklist updates.

R2 file access must use signed upload/download flows or API-mediated file delivery. Files are not a separate product module in v1; they are attachments on domain entities.

---

## 13. Deployment Architecture

| Environment | Web | API | Database | Purpose |
|---|---|---|---|---|
| Development | `localhost:3000` | `localhost:4000` | Local or Neon dev branch | Local development |
| Staging | Vercel preview/staging | Cloud Run staging service | Neon staging branch/db | Acceptance and QA |
| Production | Vercel production domain | Cloud Run production service | Neon production db | Live BOS |

Infrastructure:

- Vercel hosts `apps/web`;
- Google Cloud Run hosts `apps/api`;
- Neon/PostgreSQL stores relational data;
- Cloudflare R2 stores attachments;
- Resend sends emails if enabled;
- Sentry tracks runtime errors;
- GitHub Actions runs lint, typecheck, tests and builds.

Cloud Run should receive a Docker image built from `apps/api/Dockerfile`. Runtime configuration comes from environment variables and Google Secret Manager or the chosen secret source.

---

## 14. Scaling Strategy

Expected v1 load is operational, not high traffic. Optimize for correctness, clarity and fast iteration first.

Scale path:

1. Keep the modular monolith.
2. Add database indexes based on real slow queries.
3. Add Upstash Redis only when caching, queues or rate-limit storage become necessary.
4. Move heavy background work into a worker only when a real workload appears.
5. Keep integrations idempotent so retries are safe.

---

## 15. Key Decisions

| Decision | Choice | Reason |
|---|---|---|
| Product split | BOS separate from ToonExpo | Different users, lifecycle and ownership |
| Architecture | Modular monolith | Simpler than microservices, still structured |
| Repo layout | `apps/*` and `packages/*` | Fits Size C and two deployables |
| Frontend | Next.js App Router | Strong for operational web UI |
| Backend | NestJS | Modules, guards, validation and OpenAPI |
| API style | REST + OpenAPI | Clear CRUD/workflow contract |
| Database | PostgreSQL 18 + Prisma ORM 7 | Relational workflows and reporting |
| API hosting | Google Cloud Run | Containerized NestJS runtime |
| Web hosting | Vercel | Best fit for Next.js |
| Integration | Minimal BOS -> ToonExpo provisioning | Avoids duplicate data ownership |

---

## 16. Implementation Guardrails

- Do not create a separate Documents module in the current production scope; attach files to entities.
- Do not create broad ToonExpo sync in the current production scope.
- Do not make onboarding a separate product away from deals; the checklist lives in the deal flow.
- Do not overbuild roles in the initial production release; start with Admin, Staff and Viewer.
- Do not place backend code, Prisma access or product API routes in Next.js.
- Do not add queues or realtime until a concrete workflow needs them.
- Every module must have docs, entity fields and acceptance criteria before deep implementation.

---

## 17. Related Documents

- [Tech Card](./TECH_CARD.md)
- [Production Scope](./00-Development-Start/01-Production-Scope.md)
- [Dependency Graph](./architecture/DEPENDENCY_GRAPH.md)
- [Frontend / Backend Boundary](./architecture/FRONTEND_BACKEND_BOUNDARY.md)
- [BOS / ToonExpo Boundary](./03-Integration-With-ToonExpo/01-BOS-ToonExpo-Boundary.md)
- [Integration Contracts](./03-Integration-With-ToonExpo/03-Integration-Contracts.md)
- [Decisions](./DECISIONS.md)
