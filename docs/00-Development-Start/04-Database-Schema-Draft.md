# BOS Database Schema Draft

## Ownership

PostgreSQL 18.x on Neon is accessed only by the NestJS `apps/api` runtime through Prisma ORM 7.x in `packages/db`. Next.js must not import Prisma, execute SQL or run migrations.

## Core Tables

- users;
- staff_profiles;
- organizations;
- contacts;
- event_cycles;
- cycle_engagements;
- builder_deals;
- partner_participations;
- deal_notes;
- attachments;
- venue_plans;
- venue_plan_cells;
- space_areas;
- space_area_cells;
- space_allocations;
- venue_map_publications;
- toonexpo_provisioning_requests;
- audit_logs.

## Key Relationships

```text
organizations 1..n contacts
event_cycles 1..n cycle_engagements
organizations 1..n cycle_engagements
cycle_engagements 0..1 builder_deals
cycle_engagements 0..1 partner_participations
event_cycles 1..1 venue_plans in Release 1
venue_plans 1..n space_areas
space_areas 1..n space_area_cells
cycle_engagements 0..n space_allocations
space_areas 0..n historical space_allocations and at most one active allocation
cycle_engagements 0..n toonexpo_provisioning_requests
```

## Important Rules

- Organization and Contact are long-lived;
- CycleEngagement, BuilderDeal and PartnerParticipation are cycle-specific;
- every CycleEngagement has exactly one business subtype;
- BuilderDeal and PartnerParticipation remain separate tables and rules;
- BuilderDeal `won` requires an active SpaceAllocation;
- PartnerParticipation `confirmed` does not require space;
- active area cells cannot overlap;
- attachments belong to real entities;
- map publication is idempotent by venue plan id and version;
- provisioning must be idempotent by request id / BOS organization id / primary email.

## Needs Confirmation

- exact auth/session tables;
- attachment storage metadata;
- audit log granularity;
- soft delete policy;
- database timeout/pool settings.
