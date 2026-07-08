# Acceptance Criteria

## Request Creation

- [ ] Approved participant deal can create ToonExpo provisioning request.
- [ ] Request contains required company/contact/module data.
- [ ] Request includes BOS company id, deal id and event cycle id.
- [ ] Request can be created from deal sheet or provisioning queue.

## Lifecycle

- [ ] Request supports not_started, pending, success, failed, linked_existing and cancelled states.
- [ ] BOS stores ToonExpo company/user ids after success.
- [ ] Existing ToonExpo company can be linked without duplication.
- [ ] Failed request stores error details.

## Retry And Idempotency

- [ ] Retry does not create duplicate ToonExpo accounts.
- [ ] Request id / BOS company id / primary email are used for idempotency.
- [ ] Retry count and last attempted time are stored.
- [ ] Admin can retry, cancel or link existing company.

## Boundaries

- [ ] Provisioning does not sync full ToonExpo CRM/readiness/inventory data.
- [ ] BOS does not store plain passwords.
- [ ] Access delivery is handled by ToonExpo or a documented manual fallback.
- [ ] Provisioning status can update the related onboarding checklist item if implemented.

