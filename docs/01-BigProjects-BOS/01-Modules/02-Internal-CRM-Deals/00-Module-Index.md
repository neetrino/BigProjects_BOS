# Builder Sales CRM - Module Index

## Purpose

Builder Sales CRM is the BOS workspace where BigProjects sells exhibition space to builder organizations.

It handles BuilderDeals, contacts, notes, attachments, cycle relation, venue-space allocation and ToonExpo account provisioning handoff.

## Core v1 Rules

- This CRM contains builder sales only.
- PartnerParticipation belongs to the separate Partner Relations module.
- BOS CRM is not ToonExpo Constructor CRM.
- One Organization can have many BuilderDeals across event cycles.
- One BuilderDeal belongs to one EventCycle through CycleEngagement.
- One BuilderDeal can have several SpaceAllocations.
- BuilderDeal cannot transition to `won` without an active allocation.
- Files/documents are attached to company/deal/contact records; there is no separate Files/Documents module in v1.
- Won BuilderDeal can trigger ToonExpo account provisioning.
- BOS does not manage apartment buyer sales pipeline.

## Reading Order

1. [Definition And Boundaries](./01-Definition-And-Boundaries.md)
2. [CRM Pages And Views](./02-CRM-Pages-And-Views.md)
3. [Company Contact Deal Model](./03-Company-Contact-Deal-Model.md)
4. [Deal Pipeline And Statuses](./04-Deal-Pipeline-And-Statuses.md)
5. [Deal Sheet UX](./05-Deal-Sheet-UX.md)
6. [Cycle Onboarding And Provisioning Flow](./06-Cycle-Onboarding-And-Provisioning-Flow.md)
7. [Notes Attachments And Activity](./07-Notes-Attachments-And-Activity.md)
8. [Permissions](./08-Permissions.md)
9. [Entity Fields](./09-Entity-Fields.md)
10. [Acceptance Criteria](./10-Acceptance-Criteria.md)

## Related Modules

- Event Cycles
- Partner Relations
- Venue Sales Map
- ToonExpo Account Provisioning
