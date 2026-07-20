# Idempotency Errors And Retry

## Purpose

Provisioning must be safe to retry.

Network failures or repeated clicks must not create duplicate ToonExpo companies/users.

## Idempotency Keys

Canonical resolution order:

1. request id;
2. existing ToonExpo company id already linked to the BOS Organization;
3. BOS Organization external id already registered in ToonExpo;
4. exact company registration/tax identifier when available;
5. normalized primary contact email for User matching only.

## Duplicate Prevention

Before creating new ToonExpo company/account, ToonExpo should check whether:

- request id was already processed;
- BOS Organization id is already linked;
- exact registration/tax identifier is already linked;
- User with the same normalized email exists;
- admin selected an existing ToonExpo company to link.

Company display name or primary contact email alone must not silently merge organizations. Ambiguous candidates return `needs_review` for explicit Admin resolution.

## Retry Rules

Retry should:

- reuse same request id when retrying same request;
- keep retry count;
- update last attempted at;
- preserve previous error history;
- not create duplicate accounts.

## Error Categories

Canonical categories:

- validation_error;
- duplicate_detected;
- needs_review;
- toonexpo_unavailable;
- permission_error;
- unknown_error.

## Manual Resolution

BOS Admin can:

- create a corrected replacement request with a new id and supersede the old request;
- retry the same immutable request for transient failures;
- cancel request;
- link an existing ToonExpo company after explicit candidate review;
- create a new ToonExpo company after rejecting all candidates.

## Audit

Log:

- request created;
- request sent;
- success;
- failure;
- retry;
- cancelled;
- linked existing company.
- candidate review and resolution.
