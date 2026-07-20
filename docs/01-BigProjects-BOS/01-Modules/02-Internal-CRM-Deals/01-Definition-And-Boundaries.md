# Definition And Boundaries

## Definition

Builder Sales CRM manages BigProjects sales of exhibition space to builder organizations.

The central question is:

```text
Which builder is buying which areas in which ToonExpo cycle, and what is the current sales stage?
```

## Primary Users

- BOS Admin;
- BOS Staff / manager;
- BOS Viewer.

## In Scope

- builder Organization records;
- contact persons;
- cycle-specific deals;
- deal pipeline/stages;
- responsible manager;
- contract/payment status if tracked;
- notes and attachments on company/deal/contact;
- onboarding checklist inside deal sheet;
- tasks linked to deal/company if needed;
- ToonExpo account provisioning request after approval;
- cycle filters and reports.
- one or several venue-space allocations;
- map picker and map deep links;

## Out Of Scope

- ToonExpo Constructor CRM;
- buyer/visitor request handling;
- apartment sales pipeline;
- apartment inventory statuses;
- builder public profile editing;
- readiness scoring;
- partner participation pipeline;
- general file drive.

## Boundary With Partner Relations

PartnerParticipation is a separate entity, table, pipeline and workspace. It is not a BuilderDeal type and is never included in Builder Sales board totals or reports.

Both modules may reuse Kanban UI and CycleEngagement infrastructure.

## Boundary With ToonExpo Constructor CRM

BOS CRM answers:

```text
Did this builder/partner become a ToonExpo participant?
```

ToonExpo Constructor CRM answers:

```text
Which buyer is interested in which apartment/project from this builder?
```

These are different pipelines and must not be merged.

## Boundary With Venue Sales Map

Venue Sales Map owns geometry, cells, areas and allocations. Builder Sales owns sales stage and negotiated commercial data.

The NestJS BuilderDeal transition service must reject `won` when no active allocation exists.

## Boundary With Event Cycles

CRM deals are cycle-specific.

The same company can have a new deal for each ToonExpo cycle while company/contact history remains shared.
