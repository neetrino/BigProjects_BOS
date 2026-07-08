# Entity Fields

## DashboardFilterState

Recommended fields:

- event_cycle_id;
- date_from;
- date_to;
- responsible_user_id;
- workspace_id;
- company_type;
- scope;
- updated_at.

## DashboardMetric

Recommended fields:

- id;
- key;
- title;
- value;
- comparison_value;
- status;
- source_module;
- target_url;
- filters;
- updated_at.

## DashboardRiskItem

Recommended fields:

- id;
- type;
- severity;
- title;
- description;
- source_module;
- related_entity_type;
- related_entity_id;
- target_url;
- created_at.

## Notes

Dashboard metrics can be computed live in v1.

Persisted snapshots can be added later if historical dashboard state becomes important.

