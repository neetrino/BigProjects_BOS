# Acceptance Criteria

## Cycle Management

- [ ] BOS Admin can create an event cycle.
- [ ] BOS Admin can edit cycle name, dates, sequence and description.
- [ ] BOS Admin can change cycle status using allowed transitions.
- [ ] Completed/archived cycles are not deleted when no longer active.
- [ ] Cancelled cycles store cancellation reason.

## Current Cycle

- [ ] BOS can identify current active cycle.
- [ ] Dashboard defaults to current active cycle.
- [ ] CRM board/list defaults to current active cycle.
- [ ] Reports can filter by current cycle or selected cycle.

## Deals

- [ ] New deal receives current active cycle by default.
- [ ] User must select cycle if no active cycle exists.
- [ ] Same company can have deals in multiple cycles.
- [ ] Deal sheet/card shows cycle context when needed.
- [ ] Onboarding checklist progress is separated per deal/cycle.

## Tasks And Reports

- [ ] Tasks can be linked to a cycle when event-specific.
- [ ] Task workspace remains separate from cycle.
- [ ] Reports can show deals and approved participants by cycle.
- [ ] Reports can compare completed cycles.
- [ ] Archived cycles remain available for history.

## Integration Boundary

- [ ] Approved participant deal can trigger ToonExpo account provisioning.
- [ ] ToonExpo account can include BOS cycle context for audit/reporting.
- [ ] BOS does not require full ToonExpo platform data sync to make cycle reports useful in v1.

