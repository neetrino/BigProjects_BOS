# Cycle Onboarding And Provisioning Flow

## Full Flow

```text
Create/find company
  -> add contact
  -> create deal for event cycle
  -> move through CRM statuses
  -> approved_participant
  -> onboarding checklist continues
  -> ToonExpo account provisioning
  -> participant works inside ToonExpo
```

## Cycle Rule

Every deal must belong to an event cycle.

When creating a deal:

- use current active cycle by default;
- require cycle selection if no active cycle exists;
- warn if user selects completed/archived/cancelled cycle.

## Onboarding Rule

Every participant deal can receive checklist items from the active onboarding checklist template.

Checklist progress stays inside deal sheet.

The checklist belongs to the deal and is therefore cycle-specific.

## Provisioning Rule

When deal becomes approved_participant, BOS can prepare or create a ToonExpo provisioning request.

The provisioning request should include only necessary account/company data:

- BOS company id;
- BOS deal id;
- event cycle id/code;
- participant type;
- company display name;
- primary contact name;
- primary contact email;
- primary contact phone optional;
- modules to enable.

ToonExpo owns the created account/company after provisioning.

## No Broad Sync

BOS CRM should not receive full ToonExpo data in v1:

- no full apartment inventory sync;
- no Constructor CRM sales pipeline sync;
- no buyer request history sync;
- no readiness detail sync;
- no public content/media sync.

BigProjects Admin can log into ToonExpo directly when they need to manage or review ToonExpo-side data.

## Repeated Participation

If company participates again in a later cycle:

- reuse company/contact record;
- create new deal for new cycle;
- create new onboarding checklist for that deal;
- provisioning may reuse existing ToonExpo account/company if already exists.

