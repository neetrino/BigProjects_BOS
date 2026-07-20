# Builder Sales CRM

## Status

Release 1 canonical module.

## Purpose

Builder Sales CRM manages only builder organizations that are buying exhibition space for a specific EventCycle.

`BuilderDeal` and `PartnerParticipation` are different entities and pipelines. Partner work is owned by [Partner Relations](./09-Partner-Relations.md).

## Core Rules

- Organization and Contact are long-lived.
- CycleEngagement is per EventCycle and provides shared infrastructure.
- BuilderDeal is the builder-only commercial subtype.
- One BuilderDeal may have several SpaceAllocations.
- BuilderDeal cannot transition to `won` without at least one active allocation.
- Lost/cancelled transitions require an explicit release/keep allocation choice.
- Won BuilderDeal may trigger idempotent ToonExpo provisioning.
- BOS Builder Sales is unrelated to the ToonExpo Constructor CRM for apartment buyers.

## Documentation

1. [Module Index](./02-Internal-CRM-Deals/00-Module-Index.md)
2. [Definition And Boundaries](./02-Internal-CRM-Deals/01-Definition-And-Boundaries.md)
3. [CRM Pages And Views](./02-Internal-CRM-Deals/02-CRM-Pages-And-Views.md)
4. [Organization Contact BuilderDeal Model](./02-Internal-CRM-Deals/03-Company-Contact-Deal-Model.md)
5. [Deal Pipeline And Statuses](./02-Internal-CRM-Deals/04-Deal-Pipeline-And-Statuses.md)
6. [Deal Sheet UX](./02-Internal-CRM-Deals/05-Deal-Sheet-UX.md)
7. [Cycle, Space And Provisioning Flow](./02-Internal-CRM-Deals/06-Cycle-Onboarding-And-Provisioning-Flow.md)
8. [Notes Attachments And Activity](./02-Internal-CRM-Deals/07-Notes-Attachments-And-Activity.md)
9. [Permissions](./02-Internal-CRM-Deals/08-Permissions.md)
10. [Entity Fields](./02-Internal-CRM-Deals/09-Entity-Fields.md)
11. [Acceptance Criteria](./02-Internal-CRM-Deals/10-Acceptance-Criteria.md)
