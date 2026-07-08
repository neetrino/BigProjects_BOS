# ToonExpo Account Provisioning - Module Index

## Purpose

ToonExpo Account Provisioning is the BOS-side module for creating or linking participant accounts in ToonExpo after a company becomes an approved ToonExpo participant.

## Core v1 Rules

- Provisioning is the main v1 integration from BOS to ToonExpo.
- BOS sends minimal account/company creation data.
- ToonExpo owns the created account/company after provisioning.
- BOS does not sync full ToonExpo operational data.
- Provisioning must be idempotent.
- Failed requests can be retried safely.
- Existing ToonExpo company/account can be linked instead of duplicated.

## Reading Order

1. [Definition And Boundaries](./01-Definition-And-Boundaries.md)
2. [Provisioning Lifecycle](./02-Provisioning-Lifecycle.md)
3. [Payload And Module Keys](./03-Payload-And-Module-Keys.md)
4. [Idempotency Errors And Retry](./04-Idempotency-Errors-And-Retry.md)
5. [Provisioning UI](./05-Provisioning-UI.md)
6. [Access Delivery](./06-Access-Delivery.md)
7. [Entity Fields](./07-Entity-Fields.md)
8. [Acceptance Criteria](./08-Acceptance-Criteria.md)

## Related Modules

- Internal CRM / Deals
- Deal Onboarding Checklist
- Event Cycles
- Integrations With ToonExpo
- ToonExpo Account & Access

