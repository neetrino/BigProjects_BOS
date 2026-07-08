# Definition And Boundaries

## Definition

Deal Onboarding Checklist is a list of required work items attached to one participant deal.

It answers:

```text
For this company, in this ToonExpo cycle, what still needs to be done?
```

## Important Concept

Deal and onboarding are connected.

The deal is the sales/participation process. The checklist is the operational list inside that deal.

Do not create a separate high-level Onboarding module that competes with CRM/Deals in v1.

## In Scope

- admin-managed checklist template;
- template versions;
- latest active template;
- deal checklist snapshot from template;
- checklist progress inside deal sheet;
- item completion checkbox/status;
- item categories;
- item responsible user optional;
- item notes optional;
- item attachments optional;
- manual update of active deal checklist from latest template;
- audit log for template and checklist changes.

## Out Of Scope In v1

- full task management inside checklist;
- independent onboarding board outside deal CRM;
- automatic background updates to active deal checklists;
- complex approval workflows;
- dependencies between checklist items;
- reminders/automation unless simple notifications are easy;
- readiness scoring inside BOS;
- editing ToonExpo project/apartment inventory from BOS.

## Relationship To Event Cycle

Checklist item belongs to a deal.

Deal belongs to an event cycle.

Therefore checklist progress is cycle-specific:

```text
Event Cycle -> Deal -> Onboarding Checklist Items
```

If the same company participates in another cycle, it receives a new deal and a new checklist.

## Relationship To Tasks

Checklist is a simple deal block.

Tasks module is the general execution system with workspaces, assignees, deadlines and boards.

In v1, checklist items can have responsible users and simple status. They do not need to become full tasks unless a later workflow requires it.

