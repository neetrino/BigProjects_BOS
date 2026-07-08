# Entity Fields

## ReportDefinition

Recommended fields:

- id;
- key;
- title;
- description;
- category;
- source_modules;
- default_filters;
- available_filters;
- required_permission;
- export_allowed;
- created_at;
- updated_at.

## ReportRun

Recommended fields:

- id;
- report_key;
- filters;
- generated_by_user_id;
- generated_at;
- row_count;
- export_format optional;

## ReportMetric

Recommended fields:

- key;
- title;
- value;
- comparison_value;
- percent_change;
- status;
- source_module;
- target_url;

## Notes

V1 can compute reports live.

Persisted report runs are optional unless exports/audit require them.

