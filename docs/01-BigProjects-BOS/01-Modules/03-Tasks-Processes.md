# BOS Module: Tasks & Processes

## Status

Later-phase concept — not in Release 1

Any `v1` wording in linked legacy concept files means the first delivery of this future module, not the current BOS Release 1.

## Documentation

This overview is intentionally short. Full module documentation is split into focused files:

1. [Module Index](./03-Tasks-Processes/00-Module-Index.md)
2. [Definition And Boundaries](./03-Tasks-Processes/01-Definition-And-Boundaries.md)
3. [Global Tasks Area](./03-Tasks-Processes/02-Global-Tasks-Area.md)
4. [Work Spaces](./03-Tasks-Processes/03-Work-Spaces.md)
5. [Task Model And Statuses](./03-Tasks-Processes/04-Task-Model-And-Statuses.md)
6. [Processes And Templates](./03-Tasks-Processes/05-Processes-And-Templates.md)
7. [Links To Cycles Deals And Onboarding](./03-Tasks-Processes/06-Links-To-Cycles-Deals-And-Onboarding.md)
8. [Task UX Cards Sheets And Views](./03-Tasks-Processes/07-Task-UX-Cards-Sheets-And-Views.md)
9. [Permissions](./03-Tasks-Processes/08-Permissions.md)
10. [Entity Fields](./03-Tasks-Processes/09-Entity-Fields.md)
11. [Acceptance Criteria](./03-Tasks-Processes/10-Acceptance-Criteria.md)

## Purpose

Tasks & Processes manages BigProjects internal execution.

This module also covers event preparation work in v1, so we do not create a separate Expo Operations module yet.

The task system has two layers:

```text
1. Global Tasks area
2. Work Spaces by direction/topic
```

Work Spaces are visual/organizational containers such as Marketing, Legal, Booth, SMM, or Technical Data. Tasks still remain normal task entities.

## In Scope

- tasks;
- work spaces;
- process templates;
- task statuses;
- deadlines;
- responsible staff;
- comments/notes inside tasks;
- attachments inside tasks;
- process categories such as legal, SMM, booth, questionnaire, certificates, reporting, technical materials.

## Work Spaces

Work Space examples:

- Marketing;
- Legal;
- Booth Design;
- Technical Materials;
- SMM;
- Certificates;
- Internal Operations.

Rules:

- a task can belong to a workspace;
- global tasks page can show all tasks across all workspaces;
- each workspace has its own task board/list;
- task cards show workspace label;
- workspaces are configurable;
- departments can have one or more workspaces.

## Views

Global task area:

```text
All Tasks
My Tasks
Board
List
Blocked
```

Workspace area:

```text
Workspace Dashboard
Workspace Board
Workspace List
Workspace Settings
```

## Statuses

Recommended first statuses:

```text
todo
in_progress
blocked
done
cancelled
```

## Out Of Scope

- separate internal chat/messenger;
- separate files/documents module;
- advanced automation in first version.

## Important Rule

Processes should be configurable. Do not hard-code every process name from old client screenshots.
