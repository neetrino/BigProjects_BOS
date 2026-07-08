# BOS Permissions Matrix

## v1 Role Model

Keep v1 simple.

Roles:

- BOS Admin;
- BOS Staff;
- BOS Viewer.

More detailed roles can be added in v2.

## Permissions

| Area | BOS Admin | BOS Staff | BOS Viewer |
|---|---:|---:|---:|
| Dashboard | View | View | View |
| Internal companies | Full | Create/Edit assigned | View |
| Contacts | Full | Create/Edit assigned | View |
| Deals | Full | Create/Edit assigned | View |
| Deal status | Full | Update assigned | View |
| Tasks | Full | Create/Edit assigned | View |
| Process templates | Full | View/use | View |
| Staff KPI | Full | View own/team if allowed | View summary |
| Participant onboarding | Full | Update assigned | View |
| Reports | Full | View allowed | View allowed |
| ToonExpo summary | View | View | View |
| Settings | Full | No | No |

## v1 Rule

Do not overbuild permission levels in v1.

If one of these roles is not enough later, split it in v2.

