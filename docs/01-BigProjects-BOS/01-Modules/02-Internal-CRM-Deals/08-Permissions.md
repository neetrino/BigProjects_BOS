# Permissions

## Roles

Release 1 roles:

- BOS Admin;
- BOS Staff;
- BOS Viewer.

## Permission Matrix

| Action | BOS Admin | BOS Staff | BOS Viewer |
|---|---:|---:|---:|
| View companies/deals | Yes | Yes | Yes |
| Create company | Yes | Yes | No |
| Edit company | Yes | Assigned | No |
| Create contact | Yes | Yes | No |
| Edit contact | Yes | Through assigned Organization/engagement | No |
| Create deal | Yes | Yes | No |
| Edit deal | Yes | Assigned | No |
| Change deal status | Yes | Assigned | No |
| Move to won | Yes | Assigned when allocation exists | No |
| Mark lost/cancelled | Yes | Assigned | No |
| Add notes/attachments | Yes | Assigned | No |
| Create provisioning request | Yes | Assigned | No |
| Archive referenced records | Yes | No | No |
| Manage CRM settings/templates | Yes | No | No |

## Staff Access

In v1, keep staff permissions simple.

Assigned means `CycleEngagement.responsible_user_id` is the current user. New Staff-created engagements are assigned to their creator. Only Admin reassigns an engagement to another user.

Do not build complex department-level permissions unless required later.

## Viewer Access

Viewer can inspect data but cannot mutate it.

Viewer should not create notes, attachments or provisioning requests.

## Audit

Audit important changes:

- deal status change;
- won transition and allocation validation;
- lost/cancelled reason;
- attachment upload/delete/archive;
- provisioning request creation;
- manager reassignment.
