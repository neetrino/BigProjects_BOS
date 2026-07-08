# Role Views

## BOS Admin / Management

Admin dashboard can show all data:

- all cycles;
- all deals;
- all tasks;
- all managers;
- all provisioning requests;
- all KPI summaries.

## BOS Staff / Manager

Staff dashboard should focus on assigned/allowed work:

- my deals;
- my tasks;
- my blocked items;
- my onboarding checklist responsibilities;
- current cycle summary.

Staff may still see team-level summaries if allowed.

## BOS Viewer

Viewer dashboard is read-only.

Viewer can open source views in read-only mode.

## Permissions

Dashboard must respect permissions from source modules.

If user cannot see a deal/task/company in source module, dashboard must not reveal it through summary drill-down.

Aggregated counts can be shown only if allowed by role policy.

