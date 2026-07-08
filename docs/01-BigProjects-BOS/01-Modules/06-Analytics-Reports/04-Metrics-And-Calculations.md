# Metrics And Calculations

## Deal Metrics

- `deals_total`: count deals in filter.
- `deals_active`: count deals not lost/cancelled.
- `approved_participants`: count deals with status approved_participant.
- `lost_deals`: count deals with status lost.
- `cancelled_deals`: count deals with status cancelled.

## Onboarding Metrics

- `checklist_items_total`: active required checklist items.
- `checklist_items_done`: items with status done.
- `checklist_items_blocked`: items with status blocked.
- `onboarding_completion_percent`: done / total active required items.
- `deals_with_blocked_items`: deals having at least one blocked item.
- `deals_with_outdated_template`: deals using older template version than current active template.

Archived checklist items should not count as active required work.

Not applicable items should not block completion.

## Task Metrics

- `tasks_open`: todo + in_progress + blocked.
- `tasks_done`: done.
- `tasks_cancelled`: cancelled.
- `tasks_blocked`: blocked.
- `tasks_overdue`: open tasks with due_at before now.

## Provisioning Metrics

- `provisioning_pending`;
- `provisioning_success`;
- `provisioning_failed`;
- `provisioning_manual_action_required`.

## KPI Metrics

KPI can read from:

- completed tasks;
- assigned active tasks;
- approved participant deals;
- onboarding item completion;
- blocked work count.

KPI formulas can remain simple in v1 and be refined after real usage.

## Time Filters

Reports should support:

- event cycle filter;
- created date range;
- completed date range where relevant;
- due date range for tasks.

Event cycle filter is usually more important than raw date range for BOS.

