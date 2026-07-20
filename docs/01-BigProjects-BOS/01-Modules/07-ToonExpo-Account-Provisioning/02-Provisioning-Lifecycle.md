# Provisioning Lifecycle

## Trigger

Provisioning usually starts when a BOS deal moves to:

```text
won BuilderDeal or confirmed PartnerParticipation
```

It can be:

- manual action by BOS Admin/Staff;
- automatic request creation after approval if implementation chooses.

Manual confirmation is recommended in v1 to avoid accidental account creation.

## Lifecycle Statuses

Recommended statuses:

```text
not_started
pending
success
failed
linked_existing
cancelled
```

## Flow

```text
Business record reaches its successful stage
  -> Create provisioning request
  -> Validate payload
  -> Send to ToonExpo
  -> ToonExpo creates or links company/account
  -> ToonExpo returns result
  -> BOS stores status and ToonExpo ids
  -> Access delivery email is sent by ToonExpo or requested flow
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

Failed request can be retried after correction.

## Checklist Relation

Provisioning can update/check the onboarding item:

```text
ToonExpo account created
```

This can happen automatically after success or manually by manager. Either approach is acceptable in v1 if documented in implementation.
