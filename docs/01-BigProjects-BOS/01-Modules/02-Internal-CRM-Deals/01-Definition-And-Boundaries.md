# Definition And Boundaries

## Definition

Internal CRM / Deals manages BigProjects relationships with companies that may participate in ToonExpo.

The central question is:

```text
Which company are we bringing into which ToonExpo cycle, and what is the current participation status?
```

## Primary Users

- BOS Admin;
- BOS Staff / manager;
- BOS Viewer.

## In Scope

- company records;
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

## Out Of Scope

- ToonExpo Constructor CRM;
- buyer/visitor request handling;
- apartment sales pipeline;
- apartment inventory statuses;
- builder public profile editing;
- readiness scoring;
- event venue map setup;
- general file drive.

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

## Boundary With Onboarding Checklist

Onboarding checklist is a block inside the deal sheet.

It tracks required internal work for that participant deal, but it is not a separate CRM or task product in v1.

## Boundary With Event Cycles

CRM deals are cycle-specific.

The same company can have a new deal for each ToonExpo cycle while company/contact history remains shared.

