# Cycle, Space Allocation And Provisioning Flow

## Full Flow

```text
Create/find Organization
  -> add contact
  -> create BuilderDeal for EventCycle
  -> move through Builder Sales stages
  -> attach one or several venue areas
  -> won
  -> ToonExpo account provisioning
  -> publish public venue map snapshot
  -> participant works inside ToonExpo
```

## Cycle Rule

Every BuilderDeal must belong to an EventCycle through CycleEngagement.

When creating a deal:

- use current active cycle by default;
- require cycle selection if no active cycle exists;
- warn if user selects completed/archived/cancelled cycle.

## Venue Space Rule

Every BuilderDeal can receive several SpaceAllocations from the VenuePlan of the same EventCycle.

`won` requires at least one active allocation. This is enforced by NestJS inside the transition transaction.

PartnerParticipation is a separate process and does not inherit this requirement.

## Provisioning Rule

When BuilderDeal becomes `won`, BOS can prepare or create a ToonExpo provisioning request.

The provisioning request should include only necessary account/company data:

- BOS Organization id;
- BOS CycleEngagement and BuilderDeal ids;
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

If an Organization participates again in a later cycle:

- reuse Organization/Contact records;
- create a new CycleEngagement and BuilderDeal for the new cycle;
- provisioning may reuse existing ToonExpo account/company if already exists.
