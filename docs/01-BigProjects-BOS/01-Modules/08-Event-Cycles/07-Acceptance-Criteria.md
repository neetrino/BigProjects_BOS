# Acceptance Criteria

## Cycle Management

- [ ] BOS Admin can create an event cycle.
- [ ] BOS Admin can edit cycle name, dates, sequence and description.
- [ ] BOS Admin can change cycle status using allowed transitions.
- [ ] Completed/archived cycles are not deleted when no longer active.
- [ ] Cancelled cycles store cancellation reason.
- [ ] Only planning/active cycles accept new engagements; archived/cancelled cycles are read-only.
- [ ] Only an active cycle can be current, and leaving active clears its current marker atomically.

## Current Cycle

- [ ] BOS supports zero or one current active cycle and shows a clear zero-current empty state.
- [ ] CRM board/list defaults to current active cycle.
- [ ] Partner Relations and Venue Map default to current active cycle.

## Deals

- [ ] New deal receives current active cycle by default.
- [ ] User must select cycle if no active cycle exists.
- [ ] Same company can have deals in multiple cycles.
- [ ] Deal sheet/card shows cycle context when needed.
- [ ] Builder and partner engagement history is separated per cycle.

## History

- [ ] Archived cycles remain available for history.

## Integration Boundary

- [ ] Approved participant deal can trigger ToonExpo account provisioning.
- [ ] ToonExpo account can include BOS cycle context for audit/reporting.
- [ ] BOS does not require full ToonExpo platform data sync for Release 1 operational counters or history.
