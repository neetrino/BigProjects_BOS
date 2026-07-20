# Entity Fields

## Organization

Recommended fields:

- id;
- name;
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

## CycleEngagement

Recommended fields:

- id;
- organization_id;
- event_cycle_id;
- kind: builder_sale;
- responsible_user_id;
- primary_contact_id;
- created_at;
- updated_at.

## BuilderDeal

Recommended fields:

- id;
- cycle_engagement_id;
- title;
- stage;
- value;
- contract_status;
- payment_status;
- responsible_user_id;
- primary_contact_id;
- expected_close_date;
- won_at;
- lost_reason;
- cancelled_reason;
- provisioning_status;
- created_at;
- updated_at.

SpaceAllocation fields are owned by Venue Sales Map and linked through `cycle_engagement_id`.

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
