# Provisioning UI

## Main Views

Recommended v1 views:

- provisioning queue/list;
- pending requests;
- failed requests;
- successful/linked requests;
- request detail sheet.

## Entry Points

Provisioning can be opened from:

- deal sheet;
- onboarding checklist item;
- provisioning queue;
- dashboard widget;
- reports.

## Deal Sheet

Deal sheet should show:

- provisioning status;
- ToonExpo company id if linked;
- primary account email;
- retry/action button if failed;
- create request button if not started and deal is approved.

## Queue Columns

Provisioning queue should show:

- company;
- deal;
- event cycle;
- participant type;
- primary contact email;
- status;
- ToonExpo company id;
- retry count;
- last attempted at;
- error summary.

## Request Detail Sheet

Request detail should show:

- payload summary;
- status;
- error details;
- result ids;
- audit/history;
- retry/cancel/link existing actions.

## Empty States

- no pending requests: show calm empty state;
- no failed requests: show success/clean state;
- no approved deals needing provisioning: link back to CRM.

