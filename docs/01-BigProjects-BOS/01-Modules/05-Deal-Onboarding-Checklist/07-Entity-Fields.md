# Entity Fields

## OnboardingChecklistTemplate

Recommended fields:

- id;
- name;
- version;
- status;
- description;
- created_by_user_id;
- activated_by_user_id;
- activated_at;
- archived_at;
- created_at;
- updated_at.

## OnboardingChecklistTemplateItem

Recommended fields:

- id;
- template_id;
- stable_key;
- title;
- description;
- category;
- sort_order;
- is_required;
- default_responsible_role;
- default_due_offset_days;
- active;
- created_at;
- updated_at.

## DealOnboardingChecklistItem

Recommended fields:

- id;
- deal_id;
- event_cycle_id;
- company_id;
- template_id;
- template_version;
- template_item_id;
- stable_key;
- title;
- description;
- category;
- sort_order;
- status;
- is_required;
- responsible_user_id;
- due_at;
- completed_at;
- completed_by_user_id;
- blocked_reason;
- note;
- archived_from_template;
- created_at;
- updated_at.

## DealOnboardingTemplateUpdateLog

Recommended fields:

- id;
- deal_id;
- old_template_id;
- old_template_version;
- new_template_id;
- new_template_version;
- added_items_count;
- archived_items_count;
- unchanged_items_count;
- applied_by_user_id;
- applied_at.

## Attachment Relation

Checklist item attachments can use the generic Attachment entity:

- related_entity_type = `deal_onboarding_checklist_item`;
- related_entity_id = item id.

