# Definition And Boundaries

## Definition

EventCycle represents one ToonExpo event iteration inside BOS, for example `ToonExpo 2026-1` or `ToonExpo 2026 Spring`.

It groups Release 1 builder/partner engagements, the venue plan, allocations, provisioning requests and publication history while Organization/Contact identity remains long-lived.

## Why It Exists

ToonExpo can happen multiple times per year. Without EventCycle, business stages, allocations and integration history from different event iterations would mix together.

## In Scope

- create/edit a cycle;
- choose zero or one current cycle;
- allow overlapping active cycles;
- create cycle-specific builder and partner engagements;
- filter Release 1 workspaces and counters by cycle;
- own at most one Release 1 VenuePlan;
- preserve completed/cancelled/archived cycle history.

## Out Of Scope

- public event website management;
- ticketing or visitor payments;
- detailed event operations calendar/project management;
- automatic recurrence generation;
- Dashboard, Tasks, Onboarding, KPI and report catalog in Release 1;
- direct editing of ToonExpo builder/public product data from BOS.

Venue Sales Map is in Release 1 and owns venue-plan setup; EventCycle only owns the plan relationship.

## ToonExpo Boundary

BOS sends the cycle id/code/name only inside approved provisioning and venue-map publication contracts. ToonExpo owns participant-facing/public data and BOS does not mirror its inventory, CRM or readiness data.
