# Active Deal Template Updates

## Core Decision

Existing active deal checklists do not update automatically in the background.

Reason:

- managers may already be working from the old checklist;
- completed items must not disappear;
- notes/attachments/responsible users must not be lost;
- sudden hidden changes create confusion.

## Manual Action

BOS should provide a manual action for active, not-completed deals:

```text
Update checklist from latest template
```

This action is available to BOS Admin and possibly authorized staff.

## Preview Before Apply

Before applying update, show a preview:

- new items that will be added;
- template items that no longer exist;
- items that match existing ones;
- items that will stay unchanged;
- current deal checklist version;
- target template version.

## Apply Rules

When applying update:

- add new template items missing from the deal;
- keep already completed items;
- keep notes;
- keep attachments;
- keep responsible user unless admin chooses to reset;
- keep custom item statuses when practical;
- mark removed template items as archived/legacy instead of deleting;
- record audit log entry.

## Matching Rules

Best matching order:

1. template_item_id;
2. stable external key if implemented;
3. normalized title/category fallback.

Avoid matching only by title if duplicate item titles are possible.

## Deals Eligible For Update

Can update by default:

- new;
- contacted;
- negotiation;
- contract_pending;
- won;
- active onboarding deal statuses.

Should not update by default:

- lost;
- cancelled;
- completed historical deals;
- archived cycles unless admin explicitly allows correction.

## Audit Log

Store:

- deal id;
- old template version;
- new template version;
- user id;
- timestamp;
- added item count;
- archived item count;
- changed metadata count if any.
