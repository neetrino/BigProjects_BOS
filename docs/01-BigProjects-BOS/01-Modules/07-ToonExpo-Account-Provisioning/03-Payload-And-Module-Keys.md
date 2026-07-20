# Payload And Module Keys

## Minimal Payload

BOS should send only what ToonExpo needs to create/link account/company.

Canonical fields:

- request id;
- BOS company id;
- BOS CycleEngagement id;
- BOS BuilderDeal or PartnerParticipation id;
- event cycle id/code;
- participant type;
- company display name;
- primary contact name;
- primary contact email;
- primary contact phone optional;
- preferred language optional;
- modules to enable;

## Participant Type

Canonical values:

```text
builder
partner
bank
```

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

## Release 1 Default Module Sets

### Builder

```text
builder_portal
constructor_crm
readiness
analytics
```

### Partner

```text
partner_profile
analytics
```

### Bank

```text
partner_profile
bank_offers
analytics
```

## Payload Rules

- Email is required for primary account.
- Email is trimmed/lowercased for matching and validated without changing the original contact display value.
- Phone, when present, is normalized to E.164.
- Preferred language, when present, is `hy`, `ru` or `en`; otherwise ToonExpo applies its own default.
- Company display name is required.
- BOS company id is required for idempotency/linking.
- Request id is required for retries.
- Do not send buyer/visitor data.
- Do not send full project/apartment inventory.
- Default module sets are preselected from participant type. Admin/assigned Staff may remove or add only allowlisted keys before the first send.
- The payload snapshot and module set become immutable after the first send. Corrections create a new request id; a retry reuses the unchanged request id/payload.
- Internal notes are never sent to ToonExpo.
