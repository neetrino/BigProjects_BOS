# Entity Fields

## EventCycle

Recommended fields:

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

## Deal Cycle Fields

Deal should include:

- event_cycle_id;
- company_id;
- responsible_user_id;
- status;
- approved_at;
- lost_reason;
- cancelled_reason.

## Task Cycle Fields

Task can include:

- event_cycle_id optional;
- workspace_id optional;
- related_entity_type optional;
- related_entity_id optional.

## Reporting Snapshot Fields

Cycle reporting can be calculated live in v1.

If snapshots are needed later, a CycleReportSnapshot can include:

- id;
- event_cycle_id;
- snapshot_date;
- deals_total;
- deals_active;
- deals_approved;
- deals_lost;
- participants_approved;
- onboarding_items_total;
- onboarding_items_completed;
- onboarding_completion_percent;
- provisioned_accounts_count;
- created_at.

## Notes

- `is_current` should be controlled carefully. Prefer one current active cycle, but avoid hard database assumptions that make overlapping cycles impossible.
- Do not delete cycles with historical deals.
- Use cycle id for filtering, not cycle name.

