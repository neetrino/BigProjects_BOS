# Entity Fields

## Task

Recommended fields:

- id;
- title;
- description;
- status;
- priority;
- assignee_user_id;
- created_by_user_id;
- workspace_id;
- event_cycle_id;
- related_entity_type;
- related_entity_id;
- process_instance_id;
- due_at;
- completed_at;
- completed_by_user_id;
- blocked_reason;
- cancelled_reason;
- created_at;
- updated_at.

## WorkSpace

Recommended fields:

- id;
- name;
- description;
- status;
- color;
- icon;
- owner_user_id;
- created_by_user_id;
- created_at;
- updated_at;
- archived_at.

## ProcessTemplate

Recommended fields:

- id;
- name;
- description;
- category;
- status;
- default_workspace_id;
- created_by_user_id;
- created_at;
- updated_at.

## ProcessTemplateTask

Recommended fields:

- id;
- process_template_id;
- title;
- description;
- sort_order;
- default_assignee_role;
- default_workspace_id;
- default_due_offset_days;
- priority;
- active.

## ProcessInstance

Recommended fields:

- id;
- process_template_id;
- name;
- status;
- event_cycle_id;
- related_entity_type;
- related_entity_id;
- started_by_user_id;
- started_at;
- completed_at;
- created_at;
- updated_at.

## TaskComment

Recommended fields:

- id;
- task_id;
- author_user_id;
- body;
- created_at;
- updated_at.

