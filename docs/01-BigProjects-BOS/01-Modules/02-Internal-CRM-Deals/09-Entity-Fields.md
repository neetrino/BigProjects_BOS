# Entity Fields

These are the Release 1 logical fields. All mutable aggregates also carry `version`, `created_at` and `updated_at`.

## Organization

- id;
- name;
- normalized_name;
- registration_or_tax_id optional;
- lifecycle_status: active | archived;
- source optional;
- responsible_user_id;
- primary_contact_id optional;
- toonexpo_company_id optional;
- archived_at optional;
- created_at;
- updated_at.

## Contact

- id;
- organization_id;
- name;
- phone optional;
- normalized_email optional;
- position optional;
- lifecycle_status: active | archived;
- archived_at optional;
- created_at;
- updated_at.

## CycleEngagement

- id;
- organization_id;
- event_cycle_id;
- kind: builder_sale | partner;
- responsible_user_id;
- primary_contact_id;
- provisioning_status summary;
- latest_provisioning_request_id optional;
- created_at;
- updated_at.

Unique key: organization + event cycle + kind. A BuilderDeal or PartnerParticipation subtype is created atomically with the engagement and must match `kind`.

## BuilderDeal

- id;
- cycle_engagement_id unique;
- title;
- stage;
- amount optional;
- currency required when amount exists;
- contract_status;
- payment_status;
- expected_close_date optional;
- won_at optional;
- lost_reason required in `lost`;
- cancelled_reason required in `cancelled`;
- created_at;
- updated_at.

Responsibility and primary contact live on CycleEngagement and are not duplicated on BuilderDeal. SpaceAllocation is owned by Venue Sales Map and links through `cycle_engagement_id`.

## Note

- id;
- exactly one supported target foreign key;
- author_user_id;
- body;
- archived_at optional;
- archived_by_user_id optional;
- created_at;
- updated_at.

## Attachment

- id;
- exactly one supported target foreign key;
- original_file_name;
- r2_object_key;
- detected_mime_type;
- byte_size;
- checksum;
- upload_status;
- scan_status;
- uploaded_by_user_id;
- archived_at optional;
- archived_by_user_id optional;
- created_at;
- updated_at.

## Activity / Audit Projection

- id;
- subject_type;
- subject_id;
- actor_user_id optional for system events;
- action;
- request_id;
- redacted metadata/before/after;
- created_at.

The activity timeline is a read projection from immutable audit events; it is not a second editable event store.
