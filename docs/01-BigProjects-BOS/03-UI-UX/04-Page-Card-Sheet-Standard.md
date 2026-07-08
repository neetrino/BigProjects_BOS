# BOS Page / Card / Sheet Standard

## Purpose

BOS should use a fast operational UI pattern similar to NBOS.

## Core Rule

```text
Board/list page -> card/row click -> side sheet
Linked entity click -> stacked side sheet
Full page -> only for real workspace or large dedicated screen
```

## Use Full Pages For

- dashboard;
- CRM / Deals board;
- Tasks global board;
- Work Space page;
- reports;
- settings.

## Use Side Sheets For

- company detail;
- contact detail;
- deal detail;
- task detail;
- process detail;
- onboarding checklist item;
- note/attachment preview if needed.

## Use Quick Dialogs For

- quick create task;
- confirm status change;
- add short note;
- upload one attachment;
- close/cancel reason.

## Stacked Sheet Rule

If a user opens a linked entity from inside a sheet, open another sheet on top of the current sheet.

Example:

```text
Deal sheet
↓
Click linked task
↓
Task sheet opens above deal sheet
↓
Close task sheet
↓
Return to deal sheet
```

Do not navigate away from the current board/list for inspect/edit flows.

