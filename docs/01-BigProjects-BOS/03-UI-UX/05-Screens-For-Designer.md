# Release 1 Screens For Designer

## Status And Scope

Accepted Release 1 designer brief. Dashboard, Tasks, Onboarding, KPI and Analytics/Reports are intentionally excluded. This brief covers BOS internal UI only and does not define ToonExpo public or participant screens.

## Experience Principles

- dense, operational and fast to scan;
- desktop-first, usable from 1280 px upward; core list/sheet actions remain usable on tablet;
- full pages for workspaces, side sheets for entity detail, stacked sheets for linked entities;
- consistent status colors, keyboard focus, error states and destructive confirmations;
- no marketing hero layouts or decorative charts;
- permissions are visible in disabled/hidden actions but always enforced by the API.
- all system UI/copy supports Armenian, Russian and English; user-entered content is not auto-translated.

## Primary Navigation

```text
Event Cycles
Builder Sales
Partnerships
Venue Map
ToonExpo Provisioning
Settings
```

The shell includes current-cycle selection, global organization/contact search, signed-in user menu and environment label outside production. There is no Release 1 Dashboard route; `/` redirects to Builder Sales.

## Core Flows

### Builder Sale

```text
Builder Sales -> create/find Organization -> add Contact -> create BuilderDeal
-> progress stage -> select Venue Map areas -> move to won
-> explicitly create ToonExpo provisioning request
```

### Partner Participation

```text
Partnerships -> create/find Organization -> create PartnerParticipation
-> progress stage -> optional area allocation -> confirm
-> explicitly create ToonExpo provisioning request
```

### Venue Map Publication

```text
Venue Map -> upload/normalize source -> calibrate 1 m grid
-> classify cells -> create/repartition areas -> allocate
-> review public labels/privacy -> Admin publishes immutable version
```

## Screen 01 - Login And MFA

- email/password form;
- error/cooldown state;
- forgot-password entry;
- TOTP challenge when required;
- no public registration.

## Screen 02 - Event Cycles

- searchable/filterable list with name/code, date range, status and current marker;
- operational counts for builder/partner engagements, allocated area, provisioning and map publication;
- Admin create dialog and status transition actions;
- cycle detail in a side sheet;
- explicit `Make current` action for an active cycle.

## Screen 03 - Builder Sales Board/List

- cycle selector and board/list toggle;
- stage, manager, provisioning and search filters;
- canonical stage columns;
- compact cards with Organization, contact, manager, area and commercial/provisioning state;
- terminal records in a Closed scope;
- clear empty/loading/error states.

## Screen 04 - BuilderDeal Sheet

- Organization/Contact links;
- cycle, stage, responsible user;
- amount/currency, contract and payment status;
- assigned areas and total square meters;
- map picker/deep link;
- notes, private attachments and activity;
- provisioning summary/action;
- required reason and allocation release/keep confirmation for lost/cancelled;
- highlighted invariant error when `won` has no active allocation.

## Screen 05 - Organizations And Contacts

- Organization and Contact list pages;
- organization/contact side sheets;
- duplicate warnings without silent merge;
- long-lived history across cycles;
- archive action for Admin, never hard-delete UI;
- stacked navigation back to the originating board/sheet.

## Screen 06 - Partner Relations Board/List

- separate pipeline, queries and totals from Builder Sales;
- cycle, stage, category, manager, area and provisioning filters;
- partner-specific cards and stage columns;
- partner sheet with conditions/contribution, optional allocations, notes/attachments/activity and provisioning.

## Screen 07 - Venue Sales Map Editor

- source/calibration toolbar for Admin;
- pan/zoom, rectangle select, paint/erase/classify tools;
- background, metric grid, classifications, areas, labels and selection layers;
- area/allocation side sheet;
- visible square meters, availability, linked engagement and internal/public label states;
- persistent `Up to date`, `Unpublished changes`, `Publishing` or `Publish failed` indicator;
- version/history and Admin publish action.

## Screen 08 - Area Picker

- opens from assigned BuilderDeal/PartnerParticipation sheet;
- displays only available same-cycle areas;
- multi-select with total square meters;
- validates stale/conflicting allocation on save;
- returns to the originating sheet without losing context.

## Screen 09 - Provisioning Worklist

- tabs/filters for pending, needs review, failed and successful/linked requests;
- Organization, engagement kind, cycle, email, status, retry count and error summary;
- request side sheet with immutable payload/module snapshot and audit history;
- retry/cancel actions by permission;
- Admin-only candidate link/create resolution;
- ToonExpo access-delivery status when returned.

## Screen 10 - Publication History

- venue plan, version, checksum, publisher, timestamp and status;
- validation/rejection detail;
- retry failed publication with the same immutable version/checksum;
- link back to Venue Map;
- no edit action for historical payloads.

## Screen 11 - Settings And Users

- Admin-only user invitations, role/status and session revoke actions;
- MFA state/reset with strong confirmation;
- integration/provider health summaries without secret display;
- allowed module-key/default mapping display;
- Viewer/Staff cannot enter privileged settings.

## Shared Components And States

- app shell/navigation/current-cycle selector;
- board, data table, filters and cursor pagination;
- side sheet/stacked sheet/dialog;
- status badge, actor/time audit row and operational counter;
- notes and private attachment block with upload/scan/rejected states;
- confirmation with required reason;
- optimistic-concurrency conflict state with reload/reapply guidance;
- skeleton, empty, validation, unauthorized, forbidden, not-found and retryable-error states.

## Accessibility And Responsive Acceptance

- WCAG 2.2 AA target for contrast, focus, labels and keyboard interaction;
- board actions have a non-drag keyboard/menu alternative;
- color never carries status alone;
- sheets trap/restore focus and close predictably;
- map toolbar and selected-area operations are keyboard reachable, while pointer editing remains desktop-first;
- no horizontal clipping of critical actions at supported desktop/tablet widths.

## Explicitly Not Designed For Release 1

- full Dashboard;
- Tasks/Work Spaces;
- Deal Onboarding Checklist;
- Staff/Team KPI;
- Analytics/Report catalog;
- ToonExpo public map rendering, builder portal, Constructor CRM, readiness, buyer or QR/check-in screens.
