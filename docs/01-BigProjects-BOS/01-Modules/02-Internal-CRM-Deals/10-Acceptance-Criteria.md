# Acceptance Criteria

## CRM Basics

- [ ] BOS Staff can create Organization, Contact and BuilderDeal records.
- [ ] BuilderDeal belongs to an EventCycle through CycleEngagement.
- [ ] Builder Deals board defaults to current active cycle.
- [ ] BuilderDeals can be viewed as board and list.
- [ ] Organization and Contact details open in side sheets.
- [ ] Deal details open in side sheet from board/list.

## Pipeline

- [ ] Deal can move through defined statuses.
- [ ] `won` stage is available.
- [ ] Lost/cancelled require or allow reason.
- [ ] `won` is rejected without an active SpaceAllocation.
- [ ] Lost/cancelled requires an explicit release/keep allocation decision.

## Space And Provisioning

- [ ] Deal sheet shows assigned areas and total square meters.
- [ ] Deal sheet can open area picker and map.
- [ ] Won BuilderDeal can create ToonExpo provisioning request.
- [ ] Repeated Organization participation uses a new BuilderDeal for the new cycle.

## Boundaries

- [ ] BOS CRM does not show ToonExpo Constructor CRM as BOS deals.
- [ ] BOS CRM does not manage buyer requests or apartment sales.
- [ ] PartnerParticipation is absent from Builder Sales board, totals and reports.
- [ ] BOS CRM does not require full ToonExpo data sync in v1.
- [ ] Notes/attachments are stored on relevant entities, not a separate files module.

## Permissions

- [ ] BOS Viewer cannot edit CRM data.
- [ ] BOS Staff can work assigned/allowed deals.
- [ ] BOS Admin can manage all CRM records and settings.
- [ ] Important stage, allocation and provisioning changes are auditable.
