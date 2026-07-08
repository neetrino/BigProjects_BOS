# KPI Sources And Metrics

## Deal Metrics

Possible metrics:

- assigned deals count;
- approved participant deals;
- lost/cancelled deals;
- deals stuck in status;
- contract pending count.

## Task Metrics

Possible metrics:

- open tasks;
- completed tasks;
- overdue tasks;
- blocked tasks;
- tasks completed in selected period;
- tasks by workspace.

## Onboarding Metrics

Possible metrics:

- assigned checklist items;
- completed checklist items;
- blocked checklist items;
- onboarding completion by responsible user;
- deals with outdated checklist template under responsibility.

## Provisioning Metrics

Possible metrics:

- provisioning requests created;
- successful provisioning;
- failed provisioning;
- pending/manual action required.

## KPI Status

Recommended simple statuses:

```text
on_track
at_risk
behind
completed
```

## Score Logic

If a numeric score is used, keep it transparent.

Recommended v1 approach:

- show metric cards first;
- use simple status labels;
- avoid opaque weighted formulas until real process data exists.

Possible score inputs later:

- task completion rate;
- overdue count;
- blocked count;
- deal approval count;
- onboarding completion percent.

