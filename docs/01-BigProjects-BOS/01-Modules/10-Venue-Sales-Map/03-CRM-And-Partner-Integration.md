# CRM And Partner Integration

## Shared Engagement Root

```text
CycleEngagement
|- BuilderDeal
`- PartnerParticipation

CycleEngagement 1..n SpaceAllocations
SpaceAllocation n..1 SpaceArea
```

This shared link avoids a polymorphic identifier without foreign-key integrity and avoids creating fake BuilderDeal records for partners.

## Builder Flow

From BuilderDeal sheet:

```text
Open area picker
-> filter available areas in the same EventCycle
-> select one or several areas
-> validate non-overlap
-> save allocation and activity
```

From map:

```text
Select available area
-> assign to an existing BuilderDeal in the same cycle
-> save allocation and activity
```

The NestJS transition service must reject `BuilderDeal -> won` when no active allocation exists.

## Partner Flow

PartnerParticipation uses the same picker and map assignment mechanics. Its `confirmed` transition remains valid without an allocation.

## Internal Display

The BOS map can display organization, responsible staff, internal stage, area, negotiated amount and operational statuses. Internal business data is never copied wholesale to the public snapshot.

