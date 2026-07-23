# Release 1 Acceptance Criteria

## Access

- [ ] Admin and Staff can log in with email and password.
- [ ] Disabled users cannot log in.
- [ ] Staff cannot manage users or publish the map.
- [ ] UI works in Armenian, Russian and English.

## Core Records

- [ ] Admin can create, activate and close an event cycle.
- [ ] Staff can create and edit organizations.
- [ ] An organization can have several contacts.
- [ ] The same organization can participate in several event cycles.

## Builder Sales

- [ ] Builder Sales has Kanban and list views.
- [ ] A deal belongs to one cycle and one organization.
- [ ] Card click opens a side sheet.
- [ ] Staff can change deal stage and responsible employee.
- [ ] Notes and attachments work inside the deal sheet.
- [ ] A deal cannot move to `won` without an active map allocation.

## Partners

- [ ] Partners use a separate Kanban and list.
- [ ] Partner stages are independent from Builder Sales stages.
- [ ] Partner sheet supports contacts, notes and attachments.
- [ ] A partner may receive an area, but `confirmed` does not require one.

## Venue Map

- [ ] Admin can upload a PNG, JPG or WebP venue image.
- [ ] Admin can calibrate pixels per meter.
- [ ] Staff can select rectangular grid cells and create a named area.
- [ ] Area square meters equal the selected 1 m x 1 m cell count.
- [ ] Active areas cannot overlap.
- [ ] A free area can be edited or deleted.
- [ ] An assigned area must be released before deletion.
- [ ] Areas can be assigned, released and replaced from the map or business sheet.
- [ ] One deal may have multiple areas.
- [ ] Public display modes work without leaking hidden organization identity.

## ToonExpo Integration

- [ ] Eligible builder or partner sheet can request a ToonExpo account.
- [ ] Repeating the request does not create a duplicate company.
- [ ] Success stores the ToonExpo ids.
- [ ] Failure shows a readable error and manual Retry.
- [ ] Admin can publish the current public map.
- [ ] ToonExpo rejects an older map version.
- [ ] Failed publication does not remove the previously active ToonExpo map.

## Quality

- [ ] NestJS owns all product API and database access.
- [ ] Next.js contains no Prisma imports or product API routes.
- [ ] Critical stage/allocation rules have tests.
- [ ] Login, deal creation and map assignment have a browser smoke flow.
- [ ] Lint, typecheck, tests and production builds pass.

## Release Stop

When these criteria pass, Release 1 development stops. New ideas go to Future Scope and require owner approval before implementation.
