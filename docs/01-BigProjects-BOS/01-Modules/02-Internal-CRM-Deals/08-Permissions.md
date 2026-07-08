# Permissions

## Roles

Recommended v1 roles:

- BOS Admin;
- BOS Staff;
- BOS Viewer.

## Permission Matrix

| Action | BOS Admin | BOS Staff | BOS Viewer |
|---|---:|---:|---:|
| View companies/deals | Yes | Assigned/allowed | Yes |
| Create company | Yes | Yes | No |
| Edit company | Yes | Assigned/allowed | No |
| Create contact | Yes | Yes | No |
| Edit contact | Yes | Assigned/allowed | No |
| Create deal | Yes | Yes | No |
| Edit deal | Yes | Assigned/allowed | No |
| Change deal status | Yes | Assigned/allowed | No |
| Move to approved_participant | Yes | Assigned/allowed | No |
| Mark lost/cancelled | Yes | Assigned/allowed | No |
| Add notes/attachments | Yes | Assigned/allowed | No |
| Check onboarding item | Yes | Assigned/allowed | View |
| Create provisioning request | Yes | Assigned/allowed | No |
| Delete critical records | Yes | No | No |
| Manage CRM settings/templates | Yes | No | No |

## Staff Access

In v1, keep staff permissions simple.

Assigned/allowed can mean:

- user is responsible manager;
- user belongs to allowed team;
- admin grants broad staff access.

Do not build complex department-level permissions unless required later.

## Viewer Access

Viewer can inspect data but cannot mutate it.

Viewer should not create notes, attachments or provisioning requests.

## Audit

Audit important changes:

- deal status change;
- approved_participant transition;
- lost/cancelled reason;
- onboarding checklist update;
- attachment upload/delete/archive;
- provisioning request creation;
- manager reassignment.

