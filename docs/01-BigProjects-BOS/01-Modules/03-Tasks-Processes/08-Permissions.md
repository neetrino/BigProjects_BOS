# Permissions

## Roles

Recommended v1 roles:

- BOS Admin;
- BOS Staff;
- BOS Viewer.

## Permissions

| Action | BOS Admin | BOS Staff | BOS Viewer |
|---|---:|---:|---:|
| View tasks | Yes | Assigned/allowed | Yes |
| Create task | Yes | Yes | No |
| Edit own/assigned task | Yes | Yes | No |
| Edit any task | Yes | Allowed if configured | No |
| Change task status | Yes | Assigned/allowed | No |
| Create workspace | Yes | Yes or Admin only | No |
| Edit workspace settings | Yes | Workspace owner/allowed | No |
| Archive workspace | Yes | Allowed if configured | No |
| Create process template | Yes | No or allowed | No |
| Start process | Yes | Yes | No |
| Delete critical records | Yes | No | No |

## Simple v1 Rule

Keep permissions practical:

- staff can work their tasks;
- staff can view relevant team/workspace tasks;
- admin can manage all;
- viewer is read-only.

More detailed department-level permission can be added later.

## Audit

Audit:

- status changes;
- assignee changes;
- workspace archive/delete;
- process start;
- attachment upload/delete/archive;
- due date changes if needed.

