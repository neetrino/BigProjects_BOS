# BigProjects BOS Implementation Roadmap

## Phase 0 - Project Setup

- initialize repo and tooling;
- configure environment structure;
- add base layout;
- add auth/account foundation for internal users;
- confirm database and deployment setup.

## Phase 1 - Core Internal Data

- event cycles;
- organizations;
- contacts;
- cycle engagements;
- builder deals;
- partner participations;
- staff users;
- notes and attachments on entity cards.

## Phase 2 - Builder Sales And Partner Relations

- cycle-specific deal board;
- organization cards;
- deal pipeline;
- deal detail sheet;
- contact persons;
- internal notes;
- attached documents;
- separate compact Partner Relations pipeline and sheet.

## Phase 3 - Venue Sales Map

- plan upload and metric calibration;
- cell classifications;
- sellable area editor;
- allocations from map and business sheets;
- BuilderDeal `won` enforcement;
- allocation history and repartitioning.

## Phase 4 - ToonExpo Provisioning And Map Publication

- idempotent company/user provisioning;
- existing company/user link resolution;
- `VenueMapSnapshotV1` generation;
- manual publish, retry and status indicators;
- ToonExpo activation response.

## Later Product Phases

- tasks and workspaces;
- onboarding checklist;
- KPI;
- full dashboard and analytics/reports;
- professional visitor routing support after venue-map validation.

## First Deep Module

Start with:

```text
Builder Sales CRM
```

Reason: BuilderDeal is the commercial center of Release 1 and must be designed together with venue-space allocation.
