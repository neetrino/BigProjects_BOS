# Event Cycles - Module Index

## Purpose

Event Cycles define repeated ToonExpo event iterations inside BigProjects BOS.

BigProjects can run ToonExpo several times per year. Each cycle starts new builder/partner engagements, venue-map work, allocations and account provisioning while preserving master Organization/Contact history.

## Core v1 Rules

- Cycle is the main operational container for one ToonExpo iteration.
- Organization/Contact history persists across cycles.
- CycleEngagement represents one Organization's cycle context with a BuilderDeal or PartnerParticipation subtype.
- Each Release 1 cycle can create at most one VenuePlan and must have it before map allocation/publication work.
- Release 1 workspaces and counters are filterable by active/current cycle.
- Completed cycles stay available for history and comparison.

## Reading Order

1. [Definition And Boundaries](./01-Definition-And-Boundaries.md)
2. [Cycle Lifecycle And Statuses](./02-Cycle-Lifecycle-And-Statuses.md)
3. [Cycle Relationship To Deals And Companies](./03-Cycle-Relationship-To-Deals-And-Companies.md)
4. [Cycle UI UX](./05-Cycle-UI-UX.md)
5. [Entity Fields](./06-Entity-Fields.md)
6. [Acceptance Criteria](./07-Acceptance-Criteria.md)

[Cycle Onboarding, Tasks And Reports](./04-Cycle-Onboarding-Tasks-And-Reports.md) is later-phase context and is not part of the Release 1 reading baseline.

## Related Modules

- Builder Sales CRM
- Partner Relations
- Venue Sales Map
- ToonExpo Account Provisioning
