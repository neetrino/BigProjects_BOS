# BOS Module: Internal CRM / Deals

## Status

v1

## Documentation

This overview is intentionally short. Full module documentation is split into focused files:

1. [Module Index](./02-Internal-CRM-Deals/00-Module-Index.md)
2. [Definition And Boundaries](./02-Internal-CRM-Deals/01-Definition-And-Boundaries.md)
3. [CRM Pages And Views](./02-Internal-CRM-Deals/02-CRM-Pages-And-Views.md)
4. [Company Contact Deal Model](./02-Internal-CRM-Deals/03-Company-Contact-Deal-Model.md)
5. [Deal Pipeline And Statuses](./02-Internal-CRM-Deals/04-Deal-Pipeline-And-Statuses.md)
6. [Deal Sheet UX](./02-Internal-CRM-Deals/05-Deal-Sheet-UX.md)
7. [Cycle Onboarding And Provisioning Flow](./02-Internal-CRM-Deals/06-Cycle-Onboarding-And-Provisioning-Flow.md)
8. [Notes Attachments And Activity](./02-Internal-CRM-Deals/07-Notes-Attachments-And-Activity.md)
9. [Permissions](./02-Internal-CRM-Deals/08-Permissions.md)
10. [Entity Fields](./02-Internal-CRM-Deals/09-Entity-Fields.md)
11. [Acceptance Criteria](./02-Internal-CRM-Deals/10-Acceptance-Criteria.md)

## 1. Purpose

Internal CRM / Deals manages BigProjects business relationships with potential and approved ToonExpo participants.

This module is not Constructor CRM.

Constructor CRM belongs to ToonExpo and is used by builders for their own sales.

## 2. Users

- BOS Admin;
- BOS Staff;
- BOS Viewer.

## 3. In Scope

- company cards;
- potential participants;
- active participant deals;
- event cycle relation;
- contact persons;
- deal stages;
- onboarding checklist progress;
- contract/payment status if needed;
- internal notes;
- attached documents inside company/deal cards;
- responsible manager;
- handoff to participant onboarding;
- ToonExpo account creation signal after approval if needed.

## 4. Out Of Scope

- apartment sales pipeline;
- builder client management;
- builder apartment status editing;
- public ToonExpo profile editing;
- readiness scoring.

## 5. Main Flows

### New Potential Participant

```text
BOS Staff creates company card
↓
Adds contact person
↓
Creates deal
↓
Assigns responsible manager
↓
Tracks deal status
```

### Deal Becomes Approved Participant

```text
Deal moves to approved_participant
↓
Deal onboarding checklist continues / becomes active
↓
ToonExpo access/account creation signal is prepared if needed
↓
Builder data/media/project collection begins
```

### Deal Is Lost

```text
Deal moves to lost/cancelled
↓
Reason is recorded
↓
No ToonExpo onboarding is started
```

## 6. Pages / Screens

- CRM dashboard;
- event cycle deal board;
- companies list;
- company detail card;
- contacts list/detail;
- deals list;
- deal detail card;
- deal tasks;
- deal notes/attachments;
- deal status pipeline.
- onboarding checklist inside deal sheet.
- onboarding checklist template management.

## 7. Data Entities

### Company

- id;
- name;
- type;
- status;
- source;
- responsible_user_id;
- notes;
- created_at;
- updated_at.

### Contact

- id;
- company_id;
- name;
- phone;
- email;
- position;
- is_primary;

### Deal

- id;
- company_id;
- event_cycle_id;
- title;
- status;
- value optional;
- contract_status optional;
- payment_status optional;
- responsible_user_id;
- expected_close_date optional;
- lost_reason optional.

### OnboardingChecklistItem

- id;
- deal_id;
- event_cycle_id;
- template_item_id optional;
- template_version optional;
- title;
- category;
- status;
- responsible_user_id;
- completed_at optional;
- completed_by_user_id optional.
- archived_from_template optional.

### OnboardingChecklistTemplate

- id;
- name;
- version;
- status;
- created_by_user_id;
- activated_at optional;
- created_at;
- updated_at.

### OnboardingChecklistTemplateItem

- id;
- template_id;
- title;
- category;
- sort_order;
- default_responsible_role optional;
- is_required;
- active.

### Note

- id;
- related_entity_type;
- related_entity_id;
- author_user_id;
- body;
- created_at.

### Attachment

- id;
- related_entity_type;
- related_entity_id;
- file_name;
- file_url;
- uploaded_by_user_id;
- created_at.

## 8. Permissions

| Action | BOS Admin | BOS Staff | BOS Viewer |
|---|---:|---:|---:|
| View companies/deals | Yes | Assigned/allowed | Yes |
| Create company | Yes | Yes | No |
| Edit company | Yes | Assigned/allowed | No |
| Create deal | Yes | Yes | No |
| Edit deal | Yes | Assigned/allowed | No |
| Change deal status | Yes | Assigned/allowed | No |
| Add notes/attachments | Yes | Assigned/allowed | No |
| Check onboarding item | Yes | Assigned/allowed | View |
| Delete records | Yes | No | No |
| Manage settings | Yes | No | No |

## 9. Statuses

### Deal Status

```text
new
contacted
negotiation
contract_pending
approved_participant
lost
cancelled
```

### Contract Status

```text
not_required
not_started
sent
signed
cancelled
```

### Payment Status

```text
not_required
pending
paid
partial
overdue
cancelled
```

## 10. Integrations

- Deal onboarding checklist is part of the deal workflow.
- Tasks & Processes can create tasks linked to company/deal.
- ToonExpo can receive approved participant/account creation signal if needed.
- Analytics / Reports reads deal statuses and activity.

## 11. Acceptance Criteria

- BOS Staff can create company/contact/deal records.
- A deal can move through the defined statuses.
- Approved participant deals can start onboarding.
- Deal sheet shows onboarding checklist progress.
- Checklist items can be checked off by responsible users.
- Notes and attachments are stored on company/deal cards.
- BOS Viewer cannot edit data.
- Constructor CRM data is not visible/editable as BOS deal data.
- Deleting critical records is restricted to BOS Admin.

## 12. Later

- advanced sales automation;
- deal import/export;
- contract generation;
- payment integration/accounting;
- detailed commission/bonus logic.
