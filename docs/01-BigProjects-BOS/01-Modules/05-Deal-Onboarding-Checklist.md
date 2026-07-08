# BOS Module: Deal Onboarding Checklist

## Status

v1

## Documentation

This overview is intentionally short. Full module documentation is split into focused files:

1. [Module Index](./05-Deal-Onboarding-Checklist/00-Module-Index.md)
2. [Definition And Boundaries](./05-Deal-Onboarding-Checklist/01-Definition-And-Boundaries.md)
3. [Checklist Template Lifecycle](./05-Deal-Onboarding-Checklist/02-Checklist-Template-Lifecycle.md)
4. [Deal Checklist Instance](./05-Deal-Onboarding-Checklist/03-Deal-Checklist-Instance.md)
5. [Active Deal Template Updates](./05-Deal-Onboarding-Checklist/04-Active-Deal-Template-Updates.md)
6. [Checklist UX In Deal Sheet](./05-Deal-Onboarding-Checklist/05-Checklist-UX-In-Deal-Sheet.md)
7. [Relationship To Tasks KPI And ToonExpo](./05-Deal-Onboarding-Checklist/06-Relationship-To-Tasks-KPI-And-ToonExpo.md)
8. [Entity Fields](./05-Deal-Onboarding-Checklist/07-Entity-Fields.md)
9. [Acceptance Criteria](./05-Deal-Onboarding-Checklist/08-Acceptance-Criteria.md)

## Purpose

Deal Onboarding Checklist manages the required work inside each participant deal.

This is not a separate complicated onboarding platform. It is a checklist/block inside the deal card/sheet.

The checklist is created from an admin-managed template. The template can evolve over time as BigProjects learns the real onboarding process.

## In Scope

- default checklist template for all ToonExpo participant deals;
- admin-managed checklist template items;
- template versioning / latest active template;
- checklist progress inside deal sheet;
- simple checkbox completion;
- responsible user per item if needed;
- category per item;
- attachment/note per item if needed;
- manual update of active deal checklist from the latest template;
- account creation item for ToonExpo;
- project/media/material collection items.

## Template Rule

BigProjects Admin can edit the default onboarding checklist template from BOS settings/admin area.

When a new ToonExpo participant deal is created, it receives the latest active checklist template.

Existing deals do not update automatically in the background. This prevents active managers from losing context or seeing unexpected checklist changes during work.

For active, not-completed deals, BOS must provide a manual action:

```text
Update checklist from latest template
```

This action should:

- add new template items that are missing in the deal checklist;
- keep already completed deal checklist items;
- keep existing notes, attachments and responsible users;
- mark removed/obsolete template items as archived/legacy instead of deleting them automatically;
- write an audit log entry with user, time and template version.

Completed, cancelled or lost deals should not be updated by default.

## Relationship To ToonExpo

BOS tracks onboarding checklist completion inside the deal.

ToonExpo stores and manages actual public/builder platform data after the account is created.

## Out Of Scope

- editing apartment inventory inside BOS;
- readiness scoring inside BOS;
- constructor CRM work inside BOS.

## Example Checklist Items

- contract/payment confirmed;
- company data collected;
- contact person confirmed;
- ToonExpo account created;
- project data requested;
- media requested;
- building/floor/apartment data requested;
- visual map materials requested;
- readiness started;
- public profile ready.

## Acceptance Criteria

- Every new ToonExpo participant deal can receive default checklist items.
- Every new deal receives the latest active onboarding checklist template.
- Deal sheet shows completed/remaining checklist count.
- Responsible user can check completed items.
- BigProjects Admin can change the checklist template for future deals.
- BigProjects Admin can manually update an active deal from the latest checklist template.
- Checklist is simple and does not require a separate task management workflow.
