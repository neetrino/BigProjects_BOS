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

- event cycles;
- CRM / Deals board;
- Partner Relations board;
- Venue Sales Map;
- ToonExpo Provisioning;
- settings.

## Use Side Sheets For

- company detail;
- contact detail;
- deal detail;
- partner participation detail;
- venue area/allocation detail;
- provisioning request detail;
- note/attachment preview.

## Use Quick Dialogs For

- create cycle/contact;
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
Click linked organization
↓
Organization sheet opens above deal sheet
↓
Close organization sheet
↓
Return to deal sheet
```

Do not navigate away from the current board/list for inspect/edit flows.
