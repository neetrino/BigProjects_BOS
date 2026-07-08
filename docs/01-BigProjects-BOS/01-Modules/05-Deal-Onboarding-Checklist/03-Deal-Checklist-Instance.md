# Deal Checklist Instance

## Definition

Deal checklist instance is the actual checklist attached to one deal.

It is created by copying items from the active template at deal creation time or at the moment onboarding is started for that deal.

## Item Statuses

Recommended simple statuses:

```text
open
done
blocked
not_applicable
archived
```

## Status Meanings

### open

Item still needs work.

### done

Item is completed. Store completed by and completed at.

### blocked

Item cannot be completed because something is missing.

Blocked item should optionally have a short reason/note.

### not_applicable

Item does not apply to this specific deal.

Example: a document is not required for a particular partner type.

### archived

Item came from an older template and is no longer part of the current checklist structure.

Archived items stay visible in history but should not count as open work.

## Completion Rule

The main v1 action is a checkbox:

```text
unchecked -> open
checked   -> done
```

Additional statuses such as blocked/not_applicable can be available through a small item menu if needed.

## Progress Calculation

Show:

- completed count;
- total active required count;
- optional percent;
- blocked count.

Archived items should not count as active required work.

Not applicable items should not block completion.

## Notes And Attachments

Each item can optionally contain:

- short note;
- attachment(s);
- updated by;
- updated at.

Attachments stay attached to the checklist item/deal. There is no separate files module.

## Responsible User

Responsible user is optional but useful.

If set, show it on the item row and allow filtering by responsible manager later.

Do not build a complex task assignment system inside the checklist in v1.

