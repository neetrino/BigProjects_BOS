# Deal Sheet UX

## Purpose

Deal sheet is the main detail surface for CRM work.

Managers should be able to open a deal from board/list, update it, check onboarding progress and return to the same CRM context.

## Opening Rule

```text
Deal card/row click -> Deal side sheet
```

Do not navigate to a separate page just to inspect or edit a deal.

## Recommended Sections

Deal sheet should contain:

1. header/status/actions;
2. company and primary contact;
3. event cycle;
4. responsible manager;
5. deal details;
6. contract/payment fields if used;
7. onboarding checklist;
8. ToonExpo provisioning status;
9. tasks/linked work if any;
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

## Onboarding In Sheet

Show onboarding progress in the deal sheet, not as a separate main product.

Example:

```text
Onboarding: 18 / 30 done, 2 blocked
```

Clicking the onboarding section expands the checklist.

## Linked Entity Sheets

Inside deal sheet:

- clicking company opens company sheet stacked above;
- clicking contact opens contact sheet stacked above;
- clicking linked task opens task sheet stacked above;
- clicking onboarding checklist item can open item detail sheet if needed.

Closing the child sheet returns to deal sheet.

## Quick Dialogs

Use quick dialogs for:

- lost reason;
- cancellation reason;
- quick note;
- upload attachment;
- confirm approval;
- create ToonExpo provisioning request.

## Save Behavior

Inline editing can use draft/save behavior:

- user edits fields;
- Save/Cancel appears when dirty;
- save sends one update;
- lifecycle actions such as approve/lost/cancel are separate from normal field save.

