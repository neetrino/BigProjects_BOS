# Domain Model And Boundaries

## Domain Decision

Builder sales and partner participation have different lifecycles. They must not share one generic `Deal` table with a type flag and many conditional fields.

The canonical model is:

```text
Organization
EventCycle
CycleEngagement
|- BuilderDeal
`- PartnerParticipation
```

`CycleEngagement` is an internal shared root for one organization's involvement in one event cycle. It is not a user-facing module or a third pipeline.

## Shared Infrastructure

`CycleEngagement` owns only cross-cutting context:

- organization;
- event cycle;
- responsible BOS user;
- venue space allocations;
- ToonExpo provisioning references.

Notes and attachments attach directly to PartnerParticipation (or another explicit owning entity), while activity is projected from audit events.

## Partner-Owned Rules

`PartnerParticipation` owns:

- partner-specific stage;
- partner category;
- participation conditions;
- optional contribution or fee information;
- optional venue space;
- confirmation or decline outcome.

## Explicit Boundaries

- A partner is not a `BuilderDeal`.
- A partner does not enter Builder Sales board/list/search unless a user explicitly searches the global Organization directory.
- Builder `won` validation does not apply to partners.
- Partner `confirmed` does not require venue space.
- A single Organization may participate through one builder and one partner engagement in the same or different cycles without duplicating its master identity.
