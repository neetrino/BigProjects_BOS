# Partner Relations

## Purpose

Manage banks and other non-builder participants without mixing them into Builder Sales.

Partner Relations is the second and final Kanban board in Release 1.

## Stages

```text
new -> contacted -> confirmed
                 \-> declined
```

## Partner Record

Required:

- event cycle;
- organization.

Optional:

- partner type;
- primary contact;
- responsible staff;
- short description;
- assigned area.

## Simplicity

The screen may reuse the same Kanban, card, list and sheet UI components as Builder Sales, but `PartnerParticipation` remains a separate database entity with separate stages.

Do not create fake Builder Deals for partners.

## Map

A partner may receive a map area. This is optional and does not block transition to `confirmed`.

Public display follows the area's selected mode:

- organization;
- custom label;
- hidden.

## Not Included

- partner pricing engine;
- sponsorship package builder;
- partner KPI;
- separate partner onboarding process;
- contract automation.
