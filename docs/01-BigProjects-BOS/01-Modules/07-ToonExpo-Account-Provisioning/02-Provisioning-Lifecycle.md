# Provisioning Lifecycle

## Trigger

Provisioning becomes available when a BOS record moves to:

```text
won BuilderDeal or confirmed PartnerParticipation
```

Release 1 always starts provisioning through an explicit action by Admin or the assigned Staff user. A stage transition never creates an external account automatically.

## Lifecycle Statuses

CycleEngagement summary statuses:

```text
not_started
pending
success
failed
linked_existing
needs_review
cancelled
```

`not_started` is a derived engagement summary before a request exists. A persisted request starts as `pending` and then becomes `success`, `linked_existing`, `needs_review`, `failed` or `cancelled`.

## Flow

```text
Business record reaches its successful stage
  -> Create provisioning request
  -> Validate payload
  -> Send to ToonExpo
  -> ToonExpo creates or links company/account
  -> ToonExpo returns result
  -> BOS stores status and ToonExpo ids
  -> ToonExpo sends the participant setup/access email
```

## Existing ToonExpo Account

If company already exists in ToonExpo:

- do not duplicate;
- link BOS Organization/CycleEngagement to ToonExpo company id;
- update access/modules only if needed;
- store `linked_existing` or success with existing flag.

## Failed Request

Failure should store:

- error code;
- error message;
- validation details if available;
- retry count;
- last attempted at.

Transient failures retry the same immutable request. If company/contact/module data must change after the first send, BOS cancels/supersedes the failed request and creates a new request id/payload.

## Completion Rule

`success` or `linked_existing` is complete only after ToonExpo returns company/user ids. Email delivery state is an optional response summary and does not change provisioning success; delivery support remains owned by ToonExpo.
