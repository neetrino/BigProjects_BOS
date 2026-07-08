# Cycle Onboarding Tasks And Reports

## Onboarding Relationship

Deal onboarding checklist belongs to the deal.

Because deal belongs to an event cycle, onboarding progress is cycle-specific.

```text
Event Cycle
  -> Deal
    -> Deal Onboarding Checklist Items
```

## Checklist Per Cycle

If the same company joins another ToonExpo cycle, it receives a new deal and a new onboarding checklist for that cycle.

Completed checklist items from an older cycle do not automatically complete the new cycle's checklist.

However, previous history can help managers:

- show last cycle participation summary;
- copy reusable company data manually if needed;
- avoid asking for unchanged information where practical.

## Tasks Relationship

Tasks can be:

- general/internal tasks without a cycle;
- cycle-specific tasks;
- deal-specific tasks;
- onboarding checklist item-linked tasks if later needed.

For v1, deal onboarding checklist remains a simple checklist and should not become a full task system.

Tasks module can still reference cycle_id for event-specific work.

## Task Workspace Relation

Task workspaces are visual/organizational shells.

Examples:

- Sales;
- Marketing;
- Event Prep;
- Participant Materials;
- Admin.

A task can belong to a workspace and also be linked to an event cycle.

Do not make event cycle a replacement for task workspace. They solve different problems:

- Cycle answers "which ToonExpo iteration?";
- Workspace answers "which work direction/team/context?".

## Reports By Cycle

Reports should support:

- deals count by cycle;
- approved participants by cycle;
- lost/cancelled deals by cycle;
- sales value by cycle if tracked;
- onboarding completion by cycle;
- ToonExpo accounts provisioned by cycle;
- task progress by cycle if useful;
- comparison between cycles.

## Dashboard By Cycle

Current cycle dashboard should show:

- total active deals;
- deals by stage;
- approved participants;
- onboarding completion progress;
- overdue checklist items;
- pending ToonExpo account provisioning;
- responsible manager workload;
- basic financial status if tracked.

## Historical Comparison

Cycle comparison can answer:

- how many companies participated in each event;
- which cycle had more approved participants;
- how sales values changed;
- which onboarding areas caused delays;
- which managers handled more deals.

Advanced BI is not required in v1. Practical summary tables and charts are enough.

