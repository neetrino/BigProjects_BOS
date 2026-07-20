# Permissions And Audit

## BOS Admin

- upload and calibrate plan;
- edit every cell classification;
- create/edit/repartition areas;
- assign/release areas;
- publish/archive map versions;
- retry failed publication.

Admin can create a replacement revision only after all allocations on the active revision are released. Source/calibration edits in place stop after the first area exists.

## BOS Staff

- view the plan;
- create/edit/repartition free sellable areas;
- assign available areas to allowed BuilderDeal/PartnerParticipation records;
- release allocations through permitted business actions;
- set public display mode and label;
- cannot publish, replace source plan or change global calibration.

## BOS Viewer

- read-only map and linked sheets.

## Audit Events

Audit at minimum:

- plan created/calibrated;
- classification changed;
- area created/edited/archived;
- allocation created/released;
- public display changed;
- publication requested/succeeded/failed;
- published version activated.
