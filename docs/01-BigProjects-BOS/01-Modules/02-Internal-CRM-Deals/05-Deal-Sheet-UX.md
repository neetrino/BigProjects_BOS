# Deal Sheet UX

## Purpose

Deal sheet is the main detail surface for CRM work.

Managers should be able to open a deal from board/list, update it, allocate venue space and return to the same CRM context.

## Opening Rule

```text
Deal card/row click -> Deal side sheet
```

Do not navigate to a separate page just to inspect or edit a deal.

## Release 1 Sections

Deal sheet should contain:

1. header/status/actions;
2. company and primary contact;
3. event cycle;
4. responsible manager;
5. deal details;
6. contract/payment fields;
7. assigned venue areas and map picker;
8. pricing summary;
9. ToonExpo provisioning status;
10. notes;
11. attachments;
12. activity history.

## Header

Header should show:

- deal title/company;
- current status;
- event cycle;
- responsible manager;
- main actions.

## Venue Space In Sheet

Show assigned areas and total square meters in the deal sheet.

Example:

```text
Venue space: A-24 (25 m2), A-25 (10 m2) - 35 m2 total
```

The section opens an area picker over the current sheet. Selecting an area can open its map preview without leaving Builder Sales.

## Linked Entity Sheets

Inside deal sheet:

- clicking company opens company sheet stacked above;
- clicking contact opens contact sheet stacked above;
- clicking assigned area opens the map/area sheet stacked above.

Closing the child sheet returns to deal sheet.

## Quick Dialogs

Use quick dialogs for:

- lost reason;
- cancellation reason;
- quick note;
- upload attachment;
- confirm `won`;
- choose release/keep areas for `lost` or `cancelled`;
- create ToonExpo provisioning request.

## Save Behavior

Inline editing can use draft/save behavior:

- user edits fields;
- Save/Cancel appears when dirty;
- save sends one update;
- lifecycle actions such as approve/lost/cancel are separate from normal field save.
