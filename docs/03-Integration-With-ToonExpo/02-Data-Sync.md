# Cross-System Data Sync

## Status

Accepted for Release 1

## Main Integration Principle

```text
BOS and ToonExpo are separate systems.
Do not duplicate large ToonExpo data into BOS in v1.
```

BigProjects owners/admins can log into ToonExpo directly to see ToonExpo data.

## v1 Integration Directions

```text
BOS -> ToonExpo
participant/company/account creation request
versioned public venue-map snapshot

ToonExpo -> BOS
account creation and map publication result/status

```

## v1 External Sync Payloads

BOS sends:

- approved participant/company identity;
- primary contact;
- company type;
- requested ToonExpo modules;
- event cycle reference if relevant.

ToonExpo returns:

- ToonExpo company id;
- primary user id;
- provisioning status;
- error message if failed.

BOS also sends on explicit Admin publication:

- venue plan external id and EventCycle reference;
- monotonically increasing version and checksum;
- normalized public background asset;
- public area geometry and labels;
- public landmarks;
- confirmed public organization/project references;
- optional routing-ready classifications/access points;
- no deal, price, staff, note or private organization data.

ToonExpo stores this payload in its own database and media storage. It does not call BOS during public map rendering.

## Do Not Sync In v1

- full project/building/floor/apartment inventory to BOS;
- Constructor CRM deals/pipeline to BOS;
- buyer request history to BOS;
- readiness details to BOS;
- QR scan logs to BOS;
- check-in details to BOS;
- public content/media to BOS.

Do not sync venue-map drafts or every editor movement. Only explicit immutable publications cross the boundary.

## Important Rules

- BOS does not modify Constructor CRM sales data.
- Files/documents are attached to their owning entities.
- BigProjects admins can log into ToonExpo directly for ToonExpo operational data.
