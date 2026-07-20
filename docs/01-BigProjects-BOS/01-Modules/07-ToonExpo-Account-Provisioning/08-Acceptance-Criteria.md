# Acceptance Criteria

## Request Creation

- [ ] Won BuilderDeal or confirmed PartnerParticipation can create a ToonExpo provisioning request.
- [ ] Request contains required company/contact/module data.
- [ ] Request includes BOS Organization, CycleEngagement and EventCycle ids.
- [ ] Request can be created from builder/partner sheet or provisioning worklist.

## Lifecycle

- [ ] Engagement summary supports `not_started`; a persisted request supports pending, success, failed, linked_existing, needs_review and cancelled states.
- [ ] BOS stores ToonExpo company/user ids after success.
- [ ] Existing ToonExpo company can be linked without duplication.
- [ ] Failed request stores error details.

## Retry And Idempotency

- [ ] Retry does not create duplicate ToonExpo accounts.
- [ ] Request id and BOS Organization external link are used for idempotency.
- [ ] User email matching does not silently merge companies.
- [ ] Ambiguous company candidates require explicit Admin resolution.
- [ ] Retry count and last attempted time are stored.
- [ ] Admin can retry, cancel or link existing company.

## Boundaries

- [ ] Provisioning does not sync full ToonExpo CRM/readiness/inventory data.
- [ ] BOS does not store plain passwords.
- [ ] ToonExpo handles participant access delivery; BOS never stores or sends ToonExpo credentials.
