# BOS Entity Model

## Purpose

This is a conceptual data model for BigProjects BOS.

It is the accepted conceptual model. The implementation-level logical baseline is maintained in the development-start database document.

## Core Entities

```text
Organization
Contact
EventCycle
CycleEngagement
BuilderDeal
PartnerParticipation
VenuePlan
VenuePlanRevision
VenuePlanCell
VenueLandmark
SpaceArea
SpaceAreaCell
SpaceAllocation
VenueMapPublication
StaffUser
Note
Attachment
ToonExpoProvisioningRequest
AuditLog
```

## Relationships

```text
Organization 1..n Contacts
Organization 1..n CycleEngagements
EventCycle 1..n CycleEngagements
CycleEngagement 1..1 BuilderDeal XOR PartnerParticipation
EventCycle 0..1 VenuePlan in Release 1
VenuePlan 1..n VenuePlanRevisions
VenuePlanRevision 1..n VenuePlanCells
VenuePlanRevision 0..n VenueLandmarks
VenuePlanRevision 1..n SpaceAreas
SpaceArea 1..n SpaceAreaCells
CycleEngagement 0..n SpaceAllocations
SpaceArea 0..n historical SpaceAllocations
StaffUser 1..n AssignedCycleEngagements
VenuePlan 0..n VenueMapPublications
CycleEngagement 0..n ToonExpoProvisioningRequests
```

One Organization may have at most one CycleEngagement per EventCycle and engagement kind. This permits one builder engagement and one partner engagement in the same cycle while keeping the pipelines separate.

## Event Cycle Rule

Organization and Contact records can live across many cycles.

CycleEngagement, BuilderDeal, PartnerParticipation, VenuePlan and SpaceAllocation belong to a specific EventCycle.

## Attachment Rule

Files/documents are not a separate module in Release 1.

They are attached to:

- organization;
- contact;
- builder deal;
- partner participation;
- venue plan;
- space area;
- space allocation.

Provisioning requests may also own attachments. Notes are limited to Organization, Contact, BuilderDeal and PartnerParticipation. CycleEngagement does not duplicate subtype notes/attachments.

The API exposes a common entity attachment route. Persistence uses explicit target foreign keys with an exactly-one-target database check; it does not store an unconstrained polymorphic id.

## Source Of Truth

BOS owns organizations, builder deals, partner participations, venue-map authoring, allocations and publication state.

ToonExpo owns ToonExpo public/builder/CRM/readiness data.
