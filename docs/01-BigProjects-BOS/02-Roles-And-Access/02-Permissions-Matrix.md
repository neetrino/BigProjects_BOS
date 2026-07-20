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
| Organizations | Full | Create; edit assigned | View |
| Contacts | Full | Create; edit through assigned Organization/engagement | View |
| Builder Deals | Full | Create; edit assigned | View |
| Builder Deal status | Full | Update assigned | View |
| Partner Participations | Full | Create; edit assigned | View |
| Partner stage | Full | Update assigned | View |
| Sellable areas | Full | Create/Edit free areas | View |
| Space allocations | Full | Assign/release for assigned engagement | View |
| Map source/calibration | Full | View | View |
| Publish map to ToonExpo | Full | No | View status |
| ToonExpo provisioning | Full including match resolution | Start/retry assigned; view all | View |
| Settings | Full | No | No |

## v1 Rule

Do not overbuild permission levels in v1.

If one of these roles is not enough later, split it in v2.

All three roles can view Release 1 operational records. Assignment restricts Staff mutations, not visibility. New engagements are assigned to their Staff creator; only Admin reassigns to another user. The full security rule is [Authentication And Security](../../00-Development-Start/07-Authentication-And-Security.md).
