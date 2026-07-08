# Entity Fields

## Company

Recommended fields:

- id;
- name;
- type;
- status;
- source;
- responsible_user_id;
- primary_contact_id;
- notes_summary;
- created_at;
- updated_at.

## Contact

Recommended fields:

- id;
- company_id;
- name;
- phone;
- email;
- position;
- is_primary;
- created_at;
- updated_at.

## Deal

Recommended fields:

- id;
- company_id;
- event_cycle_id;
- title;
- status;
- value;
- contract_status;
- payment_status;
- responsible_user_id;
- primary_contact_id;
- expected_close_date;
- approved_at;
- lost_reason;
- cancelled_reason;
- onboarding_template_id;
- onboarding_template_version;
- provisioning_status;
- created_at;
- updated_at.

## Note

Recommended fields:

- id;
- related_entity_type;
- related_entity_id;
- author_user_id;
- body;
- created_at;
- updated_at.

## Attachment

Recommended fields:

- id;
- related_entity_type;
- related_entity_id;
- file_name;
- file_url;
- file_type;
- status;
- uploaded_by_user_id;
- created_at;
- updated_at.

## Activity

Recommended fields:

- id;
- related_entity_type;
- related_entity_id;
- actor_user_id;
- activity_type;
- summary;
- metadata;
- created_at.

