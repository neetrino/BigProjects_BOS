# Definition And Boundaries

## Definition

Event Cycle is a BOS record that represents one ToonExpo event iteration.

Examples:

```text
ToonExpo 2026-1
ToonExpo 2026-Q1
ToonExpo 2026 Spring
ToonExpo 2026-2
```

The cycle groups the work BigProjects performs for that event: selling participation, onboarding participants, preparing materials, creating ToonExpo accounts and measuring results.

## Why It Exists

ToonExpo can happen multiple times per year. Without cycles, deals and reports from different event iterations would mix together.

The same builder company can participate in multiple cycles. The company remains one long-lived relationship, but each event participation is a new deal/process.

## In Scope

- create and edit event cycles;
- set active/current cycle;
- assign deals to a cycle;
- filter CRM boards/lists by cycle;
- connect onboarding checklist progress to cycle through deals;
- connect event-specific tasks to cycle;
- filter dashboard by cycle;
- run reports per cycle;
- compare cycles over time;
- archive completed cycles without losing history.

## Out Of Scope In v1

- public event website management;
- ticketing/payment for visitors;
- exhibition venue map setup;
- detailed event operations calendar;
- automatic recurrence generation for cycles;
- full project management system for event production;
- direct editing of ToonExpo builder/public data from BOS.

## Main Boundary

BOS cycle tracks BigProjects internal business process.

ToonExpo platform manages participant-facing/public platform data after accounts and profiles exist.

The integration between BOS and ToonExpo should stay minimal in v1:

- BOS knows which companies/deals are approved for a cycle;
- BOS can trigger ToonExpo account/company provisioning;
- ToonExpo manages builder/public data inside ToonExpo;
- BOS does not need a full copy of ToonExpo inventory, CRM or readiness data.

