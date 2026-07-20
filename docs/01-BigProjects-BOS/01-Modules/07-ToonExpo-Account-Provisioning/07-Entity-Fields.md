# Entity Fields

## ToonExpoProvisioningRequest

Release 1 fields:

- id;
- request_id;
- bos_organization_id;
- bos_cycle_engagement_id;
- bos_builder_deal_id XOR bos_partner_participation_id;
- event_cycle_id;
- participant_type;
- company_display_name;
- primary_contact_name;
- primary_contact_email;
- primary_contact_phone;
- preferred_language;
- modules_to_enable;
- payload_checksum;
- status;
- toonexpo_company_id;
- toonexpo_primary_user_id;
- error_code;
- error_message;
- match_candidate_ids;
- supersedes_request_id optional;
- superseded_by_request_id optional;
- retry_count;
- next_attempt_at optional;
- processing_locked_at/by optional;
- last_attempted_at;
- created_by_user_id;
- created_at;
- updated_at.

The request begins at `pending`; `not_started` is derived on CycleEngagement when no request exists. Payload identity and module fields are immutable after the first send. Corrections create a new request and set the old failed/review request to `cancelled` with the supersession links.

## ProvisioningAuditEvent

Audit projection fields:

- id;
- provisioning_request_id;
- actor_user_id;
- event_type;
- message;
- metadata;
- created_at.

## CycleEngagement Fields

CycleEngagement stores the denormalized summary:

- provisioning_status;
- toonexpo_company_id;
- latest_provisioning_request_id.

## Organization Fields

Organization stores the canonical external link:

- toonexpo_company_id;
- toonexpo_linked_at;
