# BigProjects BOS Decisions And Scope

## System Decision

BigProjects BOS is one of two main systems:

```text
1. BigProjects BOS
2. ToonExpo Ecosystem
```

This repository is only for BigProjects BOS.

## In Scope

- Builder Sales CRM for companies buying exhibition space;
- separate Partner Relations pipeline;
- event cycles;
- interactive Venue Sales Map on a calibrated 1 m x 1 m grid;
- deal/partner space allocation;
- manual publication of a public map snapshot to ToonExpo;
- ToonExpo company/account provisioning integration;
- internal notes, attachments, activity and audit required by these workflows.

## Out Of Scope

- public ToonExpo website/app;
- buyer/visitor area;
- builder portal;
- constructor CRM;
- builder readiness;
- QR/check-in implementation.

## Release 1 Decisions

- BuilderDeal and PartnerParticipation are different business entities and pipelines.
- Builder Sales contains only builder sales records.
- BuilderDeal cannot transition to `won` without an active venue space allocation.
- Partner venue space is optional.
- BOS is the only venue map editor; ToonExpo stores a published public snapshot.
- Professional visitor routing is deferred until the map is complete and validated.
- No separate Files/Documents module in Release 1.
- Files/documents are attachments to Organization, BuilderDeal, PartnerParticipation, map and provisioning records.
- No separate Internal Communication module in Release 1.
- Notes/comments live inside existing cards.
- Task Management, onboarding checklists, KPI, full dashboards and analytics remain documented future scope and are not Release 1 deliverables.

## Integration Decision

BOS sends idempotent ToonExpo account/company creation requests and versioned public venue-map snapshots.

BOS should not directly manage any other ToonExpo public data, constructor CRM sales data, or readiness scoring.
