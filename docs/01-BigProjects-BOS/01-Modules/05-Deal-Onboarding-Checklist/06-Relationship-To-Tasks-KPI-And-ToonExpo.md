# Relationship To Tasks KPI And ToonExpo

## Relationship To Tasks

Checklist is not the Tasks module.

Tasks are broader execution items with:

- workspace;
- assignee;
- board/list views;
- deadlines;
- comments;
- process templates.

Checklist items are deal-specific onboarding requirements.

V1 rule:

- use checklist for the standard 20-40 participant onboarding items;
- use Tasks for work that is broader than one deal or needs normal task board management.

## Optional Task Link

Later, checklist item can optionally create/link a task.

Examples:

- complex media collection;
- legal review;
- special booth preparation;
- custom partner issue.

This is optional and should not be required for basic checklist completion.

## Relationship To KPI

Checklist can feed KPI/reporting:

- items completed by manager;
- onboarding completion percent;
- blocked items count;
- average time to complete onboarding;
- overdue onboarding items if due dates exist.

KPI should read checklist data. Checklist should not become a separate KPI module.

## Relationship To ToonExpo Provisioning

One checklist item can represent ToonExpo account creation.

Typical flow:

1. Deal becomes approved participant.
2. Checklist item "ToonExpo account created" becomes relevant.
3. BOS creates provisioning request or admin creates account manually.
4. Provisioning result updates deal/provisioning status.
5. Checklist item can be marked done manually or automatically if implemented.

Actual builder public data, projects, apartments, readiness and Constructor CRM are managed in ToonExpo, not inside BOS checklist.

## Relationship To Readiness

Checklist can include "readiness started" or "readiness reviewed" as a coordination item.

The actual readiness scoring belongs to ToonExpo.

Do not duplicate readiness scoring in BOS.

