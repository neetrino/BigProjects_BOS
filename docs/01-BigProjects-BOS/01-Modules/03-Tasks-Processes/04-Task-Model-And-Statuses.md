# Task Model And Statuses

## Task Definition

Task is one actionable work item.

It should be clear enough that a responsible person can understand what to do.

## Required v1 Fields

- title;
- status;
- assignee/responsible user optional;
- workspace optional;
- due date optional;
- priority optional;
- description optional;
- related entity optional.

## Statuses

Recommended v1 statuses:

```text
todo
in_progress
blocked
done
cancelled
```

## Status Meanings

### todo

Task is created but work has not started.

### in_progress

Someone is working on it.

### blocked

Task cannot move forward.

Blocked task should have a reason/comment when practical.

### done

Task is completed.

Store completed by and completed at.

### cancelled

Task is no longer needed.

Store cancellation reason if useful.

## Priority

Recommended simple priority:

```text
low
normal
high
urgent
```

## Related Entity

Task can link to:

- event cycle;
- company;
- contact;
- deal;
- onboarding checklist item;
- process instance;
- report if later needed.

This keeps tasks useful without creating separate task systems per module.

## Comments And Attachments

Task can have:

- comments/notes;
- attachments;
- activity log.

Attachments remain attached to the task.

