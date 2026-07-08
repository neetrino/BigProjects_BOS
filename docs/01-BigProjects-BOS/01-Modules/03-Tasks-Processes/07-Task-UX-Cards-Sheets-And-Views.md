# Task UX Cards Sheets And Views

## Core Pattern

```text
Global/Workspace board or list -> task card/row -> task side sheet
```

Do not navigate away from the current board/list for normal task inspection/editing.

## Task Card

Task card should show:

- title;
- status;
- assignee;
- due date;
- priority;
- workspace label when outside workspace context;
- related entity label if useful;
- blocked marker when blocked.

Keep cards dense and operational.

## Task Sheet

Task sheet should show:

- title;
- status;
- description;
- assignee;
- workspace;
- event cycle;
- related entity;
- due date;
- priority;
- comments/notes;
- attachments;
- activity.

## Stacked Sheets

From task sheet:

- clicking deal opens deal sheet;
- clicking company opens company sheet;
- clicking cycle opens cycle detail sheet/workspace;
- clicking onboarding item opens item sheet if implemented.

Closing child sheet returns to task sheet.

## Quick Dialogs

Use quick dialogs for:

- quick create task;
- mark blocked reason;
- cancel reason;
- upload one attachment;
- create workspace;
- start process from template.

## Board/List Scope

Use the same pattern:

```text
Scope: Active | Closed | All
View: Board | List
```

Active statuses:

```text
todo
in_progress
blocked
```

Closed statuses:

```text
done
cancelled
```

