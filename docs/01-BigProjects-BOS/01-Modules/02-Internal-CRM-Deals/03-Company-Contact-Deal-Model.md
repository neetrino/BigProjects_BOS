# Organization Contact BuilderDeal Model

## Core Model

```text
Organization
  -> Contacts
  -> CycleEngagements
       -> BuilderDeal
       -> Event Cycle
       -> Space Allocations
       -> ToonExpo Provisioning Request
  -> BuilderDeal / Contact / Organization Notes And Attachments
```

## Organization

Organization is long-lived and neutral.

Builder Sales uses it only for builder organizations. Partner organizations use the separate PartnerParticipation process.

Organization can participate in multiple cycles and does not itself contain pipeline status.

## Contact

Contact is a person connected to an Organization.

An Organization can have multiple contacts.

Organization stores one optional `primary_contact_id`; the primary marker shown on Contact UI is derived from that relation.

## BuilderDeal

BuilderDeal is a cycle-specific commercial attempt to sell exhibition space to a builder.

Examples:

- ABC Builder wants to participate in ToonExpo 2026-1;
- same ABC Builder later joins ToonExpo 2026-2 as a separate deal.

BuilderDeal contains sales stage, commercial state and its required link to one or more venue areas.

## Why BuilderDeal Is Separate From Organization

If company and deal are mixed, cycle history becomes messy.

Correct structure:

- Organization stores stable identity and contacts;
- CycleEngagement stores shared per-cycle context;
- BuilderDeal stores builder sales rules;
- PartnerParticipation stores a separate partner process;
- EventCycle groups both engagement kinds by ToonExpo iteration.

## Duplicate Prevention

When creating Organization/BuilderDeal:

- search existing Organization first;
- warn if an Organization with the same registration identifier, normalized name, phone or email exists;
- allow a new BuilderDeal on an existing Organization;
- reject a duplicate BuilderDeal for the same Organization and EventCycle.

The database allows at most one BuilderDeal engagement for an Organization/EventCycle. The same Organization may also have one separate PartnerParticipation engagement in that cycle.

## Engagement Kind

BuilderDeal and PartnerParticipation are separate subtype records under CycleEngagement. A `deal_type` flag must not be used to combine them into one table.

## Attachments

Attachments can be related to:

- organization;
- contact;
- builder deal;
- venue plan/area/allocation and provisioning request when owned by those modules.

Do not create a separate document management module in v1.
