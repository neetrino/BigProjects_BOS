# BOS And ToonExpo Boundary

## Main Rule

BigProjects BOS and ToonExpo Ecosystem are two different systems.

## BOS Owns

- Builder Sales and BuilderDeal lifecycle;
- Partner Relations and PartnerParticipation lifecycle;
- venue plan authoring, metric grid and sellable areas;
- internal space allocations and commercial data;
- public venue-map publication decision and version creation;
- internal notes;
- internal attachments.

## ToonExpo Owns

- public platform;
- buyer/visitor accounts;
- builder portal;
- projects/buildings/floors/apartments;
- visual map/hotspots;
- QR system;
- requests/leads;
- constructor CRM;
- builder readiness;
- partners/participants;
- exhibition check-in;
- public venue-map snapshot storage and rendering;
- public content/settings;
- analytics events/reporting views.

## Integration Rule

BOS integration remains narrow and explicit in Release 1.

BOS sends:

- won-builder/confirmed-partner account provisioning requests;
- immutable public `VenueMapSnapshotV1` publications.

ToonExpo can return account creation result/status.

BigProjects admins can open ToonExpo directly when they need ToonExpo product data.

ToonExpo remains the source of truth for its public read model. BOS remains the source of truth for map authoring and internal allocations.

## v1 Non-Goals

- no broad ToonExpo data duplication into BOS;
- no direct BOS editing of Constructor CRM sales data;
- no full readiness/check-in/public content sync back into BOS;
- no shared database between systems.
- no public request that queries BOS live;
- no editing the venue geometry inside ToonExpo.
