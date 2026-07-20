# Entity Fields

## StaffUser

Recommended fields:

- id;
- name;
- email;
- phone;
- role;
- team;
- status;
- manager_user_id;
- created_at;
- updated_at;
- last_login_at.

## KpiRecord

Recommended fields:

- id;
- user_id;
- event_cycle_id;
- period_start;
- period_end;
- status;
- assigned_deals_count;
- won_builders_count;
- open_tasks_count;
- completed_tasks_count;
- overdue_tasks_count;
- blocked_tasks_count;
- assigned_onboarding_items_count;
- completed_onboarding_items_count;
- blocked_onboarding_items_count;
- provisioning_pending_count;
- calculated_at.

## KpiNote

Optional fields:

- id;
- user_id;
- event_cycle_id;
- author_user_id;
- body;
- created_at.

## Notes

KPI records can be calculated live in v1.

Persisted KpiRecord is optional unless historical snapshots are needed.
