# Entity Fields

## ToonExpoProvisioningRequest

Recommended fields:

- id;
- request_id;
- bos_organization_id;
- bos_cycle_engagement_id;
- bos_builder_deal_id optional;
- bos_partner_participation_id optional;
- event_cycle_id;
- participant_type;
- company_display_name;
- primary_contact_name;
- primary_contact_email;
- primary_contact_phone;
- preferred_language;
- modules_to_enable;
- status;
- toonexpo_company_id;
- toonexpo_primary_user_id;
- error_code;
- error_message;
- match_candidate_ids;
- retry_count;
- last_attempted_at;
- created_by_user_id;
- created_at;
- updated_at.

## ProvisioningAuditEvent

Recommended fields:

- id;
- provisioning_request_id;
- actor_user_id;
- event_type;
- message;
- metadata;
- created_at.

## CycleEngagement Fields

CycleEngagement can store:

- provisioning_status;
- toonexpo_company_id;
- latest_provisioning_request_id.

## Organization Fields

Organization can store:

- toonexpo_company_id;
- toonexpo_linked_at;
