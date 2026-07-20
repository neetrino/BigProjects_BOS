# Entity Fields

## EventCycle

Release 1 fields:

- id;
- name;
- year;
- sequence;
- code;
- starts_at;
- ends_at;
- status;
- description;
- is_current;
- created_by_user_id;
- completed_at;
- archived_at;
- cancelled_at;
- cancelled_reason;
- created_at;
- updated_at.

## Engagement Cycle Fields

CycleEngagement includes:

- event_cycle_id;
- organization_id;
- kind;
- responsible_user_id;
- primary_contact_id.

## Notes

- A partial unique constraint permits at most one `is_current = true`; several rows may still have `status = active`.
- Do not delete cycles with historical deals.
- Use cycle id for filtering, not cycle name.
- `code` is unique and immutable after the cycle first becomes active.
- `starts_at` must be earlier than or equal to `ends_at`.
