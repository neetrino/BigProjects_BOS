# Processes And Templates

## Purpose

Processes represent repeatable task sets.

They help BigProjects start recurring internal workflows without manually creating every task.

## Process Template

Process template is a reusable definition.

Examples:

- prepare marketing package;
- collect technical materials;
- legal document review;
- event booth preparation;
- post-event reporting.

## Process Instance

Process instance is the real started process for a context.

Examples:

- Marketing package for ToonExpo 2026-1;
- Technical materials for ABC Builder deal;
- Booth preparation for current cycle.

## Template Should Be Configurable

Do not hard-code every old process name from client screenshots.

Admin should be able to create/update templates:

- template name;
- category;
- default workspace;
- list of task templates;
- default assignee/role optional;
- default due offsets optional.

## Process Task Creation

Starting a process can create tasks from template.

Each generated task can inherit:

- process instance id;
- workspace;
- event cycle;
- related deal/company if started from that context;
- default assignee;
- due date based on offset.

## v1 Simplicity

Processes can be simple in v1.

Minimum useful version:

- process templates;
- start process;
- generated tasks;
- process instance progress.

Advanced automation, conditional branches and approvals are later.

