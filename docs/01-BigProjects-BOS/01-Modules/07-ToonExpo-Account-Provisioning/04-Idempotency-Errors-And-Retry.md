# Idempotency Errors And Retry

## Purpose

Provisioning must be safe to retry.

Network failures or repeated clicks must not create duplicate ToonExpo companies/users.

## Idempotency Keys

Recommended matching order:

1. request id;
2. BOS company id;
3. primary contact email;
4. existing ToonExpo company id if already linked.

## Duplicate Prevention

Before creating new ToonExpo company/account, ToonExpo should check whether:

- request id was already processed;
- BOS company id is already linked;
- company with same primary email exists;
- admin selected an existing ToonExpo company to link.

## Retry Rules

Retry should:

- reuse same request id when retrying same request;
- keep retry count;
- update last attempted at;
- preserve previous error history;
- not create duplicate accounts.

## Error Categories

Recommended categories:

- validation_error;
- duplicate_detected;
- toonexpo_unavailable;
- permission_error;
- unknown_error.

## Manual Resolution

BOS Admin can:

- edit/correct request data;
- retry;
- cancel request;
- link existing ToonExpo company manually if needed.

## Audit

Log:

- request created;
- request sent;
- success;
- failure;
- retry;
- cancelled;
- linked existing company.

