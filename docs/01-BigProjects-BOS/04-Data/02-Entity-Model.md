# BOS Entity Model

## Purpose

This is a conceptual data model for BigProjects BOS.

It is not a final SQL schema yet.

## Core Entities

```text
Organization
Contact
EventCycle
CycleEngagement
BuilderDeal
PartnerParticipation
VenuePlan
VenuePlanCell
SpaceArea
SpaceAreaCell
SpaceAllocation
VenueMapPublication
StaffUser
Note
Attachment
ToonExpoProvisioningRequest
```

## Relationships

```text
Organization 1..n Contacts
Organization 1..n CycleEngagements
EventCycle 1..n CycleEngagements
CycleEngagement 1..1 BuilderDeal or PartnerParticipation
EventCycle 1..1 VenuePlan in Release 1
VenuePlan 1..n VenuePlanCells
VenuePlan 1..n SpaceAreas
SpaceArea 1..n SpaceAreaCells
CycleEngagement 0..n SpaceAllocations
SpaceArea 0..n historical SpaceAllocations
StaffUser 1..n AssignedCycleEngagements
CycleEngagement 0..n Notes
CycleEngagement 0..n Attachments
VenuePlan 0..n VenueMapPublications
```

## Event Cycle Rule

Organization and Contact records can live across many cycles.

CycleEngagement, BuilderDeal, PartnerParticipation, VenuePlan and SpaceAllocation belong to a specific EventCycle.

## Attachment Rule

Files/documents are not a separate module in v1.

They are attached to:

- organization;
- contact;
- cycle engagement;
- builder deal;
- partner participation;
- venue plan;
- space area;
- space allocation.

## Source Of Truth

BOS owns organizations, builder deals, partner participations, venue-map authoring, allocations and publication state.

ToonExpo owns ToonExpo public/builder/CRM/readiness data.
