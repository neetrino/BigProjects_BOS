# Checklist UX In Deal Sheet

## Purpose

Checklist should be visible and fast inside the deal sheet.

It should not force managers to leave CRM.

## Placement

Deal sheet should include an Onboarding section or tab.

Recommended:

- progress summary near top of deal sheet;
- detailed checklist in a collapsible section or tab;
- item rows grouped by category.

## Progress Summary

Show:

- completed / total;
- percent;
- blocked count;
- last updated;
- template version if useful.

Example:

```text
Onboarding: 18 / 30 done, 2 blocked
```

## Item Row

Each row should show:

- checkbox/status;
- item title;
- category;
- responsible user if set;
- due date if set;
- small note/attachment indicators;
- quick menu for blocked/not applicable/archive if needed.

Clicking an item can expand inline or open a small side sheet if item details become larger.

## Editing

Recommended v1 actions:

- check/uncheck item;
- change status;
- add note;
- add attachment;
- assign responsible user;
- set blocked reason;
- mark not applicable.

Keep it lightweight.

## Deal Board Card

Deal card can show checklist progress:

```text
Onboarding 18/30
```

If blocked items exist, show a small risk marker.

## Template Update UX

In deal sheet, show update prompt only when:

- deal uses older template version;
- latest active template exists;
- deal status is eligible.

Action:

```text
Update from latest template
```

Then open preview dialog/sheet before applying.

## No Separate Onboarding Board In v1

Do not create a separate onboarding board as a main module in v1.

If managers need a global view, use CRM filters/reports:

- deals with incomplete onboarding;
- deals with blocked checklist items;
- onboarding progress by responsible manager;
- onboarding progress by event cycle.

