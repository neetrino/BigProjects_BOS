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
| Organizations | Full | Create/Edit allowed | View |
| Contacts | Full | Create/Edit assigned | View |
| Builder Deals | Full | Create/Edit assigned | View |
| Builder Deal status | Full | Update assigned | View |
| Partner Participations | Full | Create/Edit assigned | View |
| Partner stage | Full | Update assigned | View |
| Sellable areas | Full | Create/Edit free areas | View |
| Space allocations | Full | Assign/release allowed | View |
| Map source/calibration | Full | View | View |
| Publish map to ToonExpo | Full | No | View status |
| ToonExpo provisioning | Full | Start/view allowed | View |
| Settings | Full | No | No |

## v1 Rule

Do not overbuild permission levels in v1.

If one of these roles is not enough later, split it in v2.
