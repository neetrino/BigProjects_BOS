# Definition And Boundaries

## Definition

Dashboard is the first operational overview for BigProjects BOS users.

It answers:

```text
What is happening now, what needs attention, and where should I go next?
```

## In Scope

- current cycle summary;
- active deals summary;
- approved participants summary;
- onboarding checklist progress;
- blocked/overdue tasks;
- staff/team KPI summary;
- ToonExpo account provisioning status;
- key risks/warnings;
- quick links into source modules.

## Out Of Scope

- editing full deal details directly on dashboard;
- full report builder;
- public ToonExpo analytics;
- Constructor CRM editing;
- document archive;
- BI warehouse.

## Source Modules

Dashboard reads data from:

- Event Cycles;
- Builder Sales CRM;
- Deal Onboarding Checklist;
- Tasks / Processes;
- Staff / KPI;
- ToonExpo Account Provisioning.

Dashboard must not become a second place to maintain the same data.

## Main Rule

Dashboard cards should always link to the real workspace or filtered list where the user can act.

Examples:

- "12 blocked tasks" opens blocked task list;
- "5 pending provisioning requests" opens provisioning queue;
- "8 deals in contract pending" opens filtered CRM board/list;
- "Onboarding 70%" opens onboarding report or filtered deals.
