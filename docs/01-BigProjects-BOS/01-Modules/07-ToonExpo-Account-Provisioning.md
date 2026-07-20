# BOS Module: ToonExpo Account Provisioning Summary

## Status

v1

## Documentation

This overview is intentionally short. Full module documentation is split into focused files:

1. [Module Index](./07-ToonExpo-Account-Provisioning/00-Module-Index.md)
2. [Definition And Boundaries](./07-ToonExpo-Account-Provisioning/01-Definition-And-Boundaries.md)
3. [Provisioning Lifecycle](./07-ToonExpo-Account-Provisioning/02-Provisioning-Lifecycle.md)
4. [Payload And Module Keys](./07-ToonExpo-Account-Provisioning/03-Payload-And-Module-Keys.md)
5. [Idempotency Errors And Retry](./07-ToonExpo-Account-Provisioning/04-Idempotency-Errors-And-Retry.md)
6. [Provisioning UI](./07-ToonExpo-Account-Provisioning/05-Provisioning-UI.md)
7. [Access Delivery](./07-ToonExpo-Account-Provisioning/06-Access-Delivery.md)
8. [Entity Fields](./07-ToonExpo-Account-Provisioning/07-Entity-Fields.md)
9. [Acceptance Criteria](./07-ToonExpo-Account-Provisioning/08-Acceptance-Criteria.md)

## Purpose

ToonExpo Account Provisioning Summary shows the minimal integration state between BOS and ToonExpo.

It should not duplicate full ToonExpo analytics or operational data in v1.

## In Scope

- account creation request status;
- company linked/unlinked state;
- ToonExpo company id if created;
- primary user/account status;
- failed provisioning requests;
- retry action if needed.
- immutable request id for retry idempotency, BOS company id for company linking and normalized email for User matching only.

## Out Of Scope

- full ToonExpo CRM/lead dashboards;
- full readiness dashboards;
- QR/check-in analytics;
- public platform content management.

## Rule

BOS sends minimal account provisioning requests.

ToonExpo remains the source system for ToonExpo product data.

## Module Keys

Use ToonExpo module keys:

```text
builder_portal
constructor_crm
readiness
partner_profile
bank_offers
analytics
```
