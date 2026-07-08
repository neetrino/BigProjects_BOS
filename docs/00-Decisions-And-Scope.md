# BigProjects BOS Decisions And Scope

## System Decision

BigProjects BOS is one of two main systems:

```text
1. BigProjects BOS
2. ToonExpo Ecosystem
```

This repository is only for BigProjects BOS.

## In Scope

- internal dashboard;
- internal CRM / deals;
- tasks and processes;
- staff / team KPI;
- participant onboarding;
- analytics / reports;
- ToonExpo account provisioning integration.

## Out Of Scope

- public ToonExpo website/app;
- buyer/visitor area;
- builder portal;
- constructor CRM;
- builder readiness;
- QR/check-in implementation.

## v1 Decisions

- No separate Files/Documents module in v1.
- Files/documents are attachments to company, deal, task and process cards.
- No separate Internal Communication module in v1.
- Notes/comments live inside existing cards.
- No separate Expo Operations module in v1.
- Event preparation work is handled through Tasks & Processes.

## Integration Decision

BOS can send ToonExpo account/company creation requests.

BOS should not directly manage ToonExpo public data, constructor CRM sales data, or readiness scoring.
