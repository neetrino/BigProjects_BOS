# Acceptance Criteria

## Global Tasks

- [ ] User can view global tasks.
- [ ] User can switch between board and list view.
- [ ] User can filter by status, assignee, workspace, cycle and related entity.
- [ ] Task opens in side sheet from card/row.
- [ ] Active and closed scopes use the same visual model.

## Work Spaces

- [ ] User can create/manage workspaces according to permissions.
- [ ] Workspace has its own board/list views.
- [ ] Task card shows workspace label in global view.
- [ ] A task can belong to a workspace and still appear in global tasks.
- [ ] Workspace can be archived without deleting task history.

## Task Model

- [ ] Task supports todo, in_progress, blocked, done and cancelled.
- [ ] Task can have assignee, due date, priority and description.
- [ ] Task can link to event cycle, company, deal or onboarding item.
- [ ] Task supports comments/notes and attachments.

## Processes

- [ ] Admin can create configurable process templates.
- [ ] Starting a process creates linked tasks.
- [ ] Process instance can link to cycle/deal/company context.
- [ ] Processes do not require complex automation in v1.

## Boundaries

- [ ] Event preparation work is handled through tasks/workspaces.
- [ ] This later module does not absorb Venue Sales Map ownership.
- [ ] Deal onboarding checklist remains inside deal sheet.
- [ ] Checklist items can link to tasks only when needed.
- [ ] Attachments are task/entity attachments, not a separate files module.
