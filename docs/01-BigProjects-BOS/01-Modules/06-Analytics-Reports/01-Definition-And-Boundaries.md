# Definition And Boundaries

## Definition

Analytics / Reports is the BOS read-only reporting area.

It answers:

```text
How is BigProjects performing across ToonExpo cycles, deals, onboarding, tasks and team work?
```

## In Scope

- cycle reports;
- deal reports;
- participant reports;
- onboarding reports;
- task/process reports;
- staff KPI reports;
- ToonExpo provisioning reports;
- blocked/overdue work;
- exports if needed.

## Out Of Scope In v1

- full BI data warehouse;
- public website analytics from ToonExpo;
- buyer behavior analytics;
- Constructor CRM editing;
- accounting/reporting system;
- custom report builder with arbitrary SQL-like queries;
- scheduled report automation unless added later.

## Source Of Truth

Reports read from:

- EventCycle;
- Company;
- Deal;
- DealOnboardingChecklistItem;
- Task;
- WorkSpace;
- ProcessInstance;
- StaffUser/KpiRecord;
- ToonExpoProvisioningRequest.

Reports should not create duplicate operational records.

## Editing Rule

If user needs to act, report links to source module.

Examples:

- blocked checklist item -> deal sheet;
- pending provisioning -> provisioning queue;
- overdue task -> task sheet;
- deal count by status -> filtered CRM board/list.

