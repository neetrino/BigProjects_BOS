# Partner Relations - Module Index

## Purpose

Partner Relations manages banks, sponsors, service companies and other non-builder participants through a dedicated, compact pipeline.

It is not a filtered view of Builder Sales and it does not create fake builder deals.

## Release 1 Rules

- `BuilderDeal` and `PartnerParticipation` are separate business entities.
- Partner Relations has its own Kanban, list, cards and sheets.
- The Kanban UI framework may be shared with Builder Sales, but stages, fields, validation and reports are independent.
- A partner may optionally receive venue space.
- A confirmed partner may trigger ToonExpo provisioning.
- Partner records never enter Builder Sales queries, totals or pipeline reports.

## Reading Order

1. [Domain Model And Boundaries](./01-Domain-Model-And-Boundaries.md)
2. [Pipeline And Workspace UX](./02-Pipeline-And-Workspace-UX.md)
3. [Map And Provisioning Links](./03-Map-And-Provisioning-Links.md)
4. [Entity Fields And Statuses](./04-Entity-Fields-And-Statuses.md)
5. [Permissions](./05-Permissions.md)
6. [Acceptance Criteria](./06-Acceptance-Criteria.md)

