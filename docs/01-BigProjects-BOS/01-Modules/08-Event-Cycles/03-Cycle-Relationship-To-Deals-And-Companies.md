# Cycle Relationship To Organizations And Engagements

## Stable And Cycle-Specific Data

```text
Organization (long-lived)
  -> Contact (long-lived)
  -> CycleEngagement for ToonExpo 2026-1
       -> BuilderDeal or PartnerParticipation
       -> SpaceAllocations
       -> ProvisioningRequest
  -> CycleEngagement for ToonExpo 2026-2
       -> BuilderDeal or PartnerParticipation
```

Organization identity and contacts are reused. Commercial/partner stages, responsible staff, allocations and cycle outcome are new for every cycle.

## Subtype Rule

Every CycleEngagement has exactly one business subtype:

- BuilderDeal for a builder space sale;
- PartnerParticipation for the separate partner process.

The subtypes are not values in one generic Deal table.

## Venue Plan Rule

Release 1 allows one VenuePlan per EventCycle. All SpaceAreas and SpaceAllocations for the cycle belong to that plan.

## Repeated Participation

When an Organization returns in a later cycle:

- reuse Organization and Contact;
- create a new CycleEngagement;
- create the correct new business subtype;
- create new allocations from the later cycle's VenuePlan;
- reuse/link existing ToonExpo company access when appropriate.

## Lifecycle Independence

EventCycle status and business stage are independent. Completing a cycle does not rewrite historical BuilderDeal or PartnerParticipation stages.

