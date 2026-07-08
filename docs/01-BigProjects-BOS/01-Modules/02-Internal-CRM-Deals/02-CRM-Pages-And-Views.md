# CRM Pages And Views

## Main CRM Workspaces

Recommended v1 pages:

- Deals Board;
- Deals List;
- Companies List;
- Contacts List;
- Reports/Analytics links;
- Settings links for checklist template if admin.

Company, contact and deal details open in side sheets.

## Deals Board

Deals Board is the main operational CRM view.

Recommended controls:

- event cycle selector;
- scope filter: Active / Closed / All;
- board/list switch;
- responsible manager filter;
- company type/status filter;
- search.

## Active Board

Active board shows working deal stages.

Recommended columns:

```text
new
contacted
negotiation
contract_pending
approved_participant
```

`approved_participant` remains visible because work continues through onboarding and ToonExpo provisioning.

## Closed Scope

Closed scope shows terminal outcomes:

```text
lost
cancelled
```

If later a separate completed/finished lifecycle is introduced, it can be added deliberately. In v1, approved participant is not hidden from operations because onboarding may still be active.

## Deals List

List view should show:

- deal title;
- company;
- event cycle;
- status;
- responsible manager;
- primary contact;
- contract status;
- payment status;
- onboarding progress;
- provisioning status;
- created date;
- last activity.

## Companies List

Companies list shows stable company records:

- company name;
- type;
- status;
- primary contact;
- responsible manager;
- active/open deals count;
- last cycle participated;
- notes/flags.

Click opens company sheet.

## Contacts List

Contacts list shows people connected to companies:

- name;
- phone;
- email;
- position;
- company;
- primary flag.

Click opens contact sheet.

## Cards

Deal card should show:

- company/deal title;
- event cycle when board is multi-cycle;
- status/stage;
- responsible manager;
- primary contact;
- contract/payment marker if tracked;
- onboarding progress;
- risk/blocker marker if checklist has blocked items.

Keep cards dense and scan-friendly.

