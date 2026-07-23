# ToonExpo Integration

## Boundary

BOS and ToonExpo are separate products with separate databases.

BOS sends only:

1. a manual company/account creation request;
2. a manual public venue-map update.

BOS does not receive or duplicate ToonExpo buyer, apartment, Constructor CRM, Readiness or QR data.

## Company And Account Creation

Available from an eligible Builder Deal or Partner sheet.

Request fields:

- BOS organization id;
- company name;
- company type;
- registration/tax identifier when available;
- primary contact name;
- primary contact email;
- primary contact phone optional;
- event cycle id.

ToonExpo resolution:

1. use an existing stored ToonExpo company id;
2. otherwise match the stable BOS organization id or exact tax identifier;
3. otherwise create the company;
4. match or create the primary user by normalized email.

ToonExpo returns:

- company id;
- user id;
- `created | linked | failed`;
- readable error when failed.

BOS stores the returned ids on the organization. A failed request shows a manual Retry button. There is no background retry scheduler, queue, supersede flow or dispatcher worklist.

## Public Venue Map Publication

Admin presses Publish from the Venue Map.

Payload:

- BOS event cycle id;
- map version integer;
- public background image URL or transferable object reference;
- map dimensions and calibration;
- public area cells or geometry;
- area name/code;
- public display mode;
- organization id/name only when allowed;
- custom label when selected.

Public display modes:

- `organization`: show the assigned organization;
- `custom_label`: show only the custom text;
- `hidden`: show no occupant identity.

ToonExpo stores the latest accepted map version in its own database and storage. BOS remains the editor and source of truth.

On failure:

- show the error;
- keep the previous ToonExpo map active;
- allow Admin to press Retry.

No automatic retry engine, immutable publication event store, checksum workflow or scheduler is required in Release 1.

## Duplicate Protection

Simple database constraints and stable external ids are enough:

- BOS organization id is unique in ToonExpo integration links;
- ToonExpo company id is unique in BOS;
- map version cannot move backwards.

Do not add a generic idempotency subsystem for all BOS mutations.
