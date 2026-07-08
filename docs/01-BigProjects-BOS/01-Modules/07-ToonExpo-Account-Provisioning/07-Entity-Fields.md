# Entity Fields

## ToonExpoProvisioningRequest

Recommended fields:

- id;
- request_id;
- bos_company_id;
- bos_deal_id;
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

## Deal Fields

Deal can store:

- provisioning_status;
- toonexpo_company_id;
- latest_provisioning_request_id.

## Company Fields

Company can store:

- toonexpo_company_id;
- toonexpo_linked_at;

