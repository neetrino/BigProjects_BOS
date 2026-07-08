# Payload And Module Keys

## Minimal Payload

BOS should send only what ToonExpo needs to create/link account/company.

Recommended fields:

- request id;
- BOS company id;
- BOS deal id;
- event cycle id/code;
- participant type;
- company display name;
- primary contact name;
- primary contact email;
- primary contact phone optional;
- preferred language optional;
- modules to enable;
- notes optional internal provisioning note.

## Participant Type

Recommended values:

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

## Typical Module Sets

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
- Company display name is required.
- BOS company id is required for idempotency/linking.
- Request id is required for retries.
- Do not send buyer/visitor data.
- Do not send full project/apartment inventory.

