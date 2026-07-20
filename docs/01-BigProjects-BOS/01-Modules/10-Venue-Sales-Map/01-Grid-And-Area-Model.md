# Grid And Area Model

## Venue Plan

`VenuePlan` belongs to one EventCycle and owns content/publication version state. Its `VenuePlanRevision` stores:

- normalized background asset;
- source width and height;
- grid origin and rotation;
- pixels per meter calibration;
- logical row/column bounds;
- draft and published version metadata.

Release 1 supports one plan/hall per cycle and one active authoring revision. Replacing a source/calibration after areas exist creates a new revision; superseded revisions retain their cells, areas, allocations, assets and publication references.

## Cell Classification

Every cell used by the venue plan has one classification:

```text
sellable
walkable
blocked
fixed_object
unknown
```

`unknown` is an authoring state and is forbidden in a published navigation-ready snapshot. Routing is not implemented in Release 1, but preserving these classifications prevents a future route engine from crossing walls or stands.

A cell with active SpaceArea membership cannot change away from `sellable`. Admin/Staff must first archive/repartition the free area; allocated area membership must first be released according to allocation invariants.

## Sellable Area

`SpaceArea` is a named contiguous set of sellable grid cells inside one VenuePlanRevision.

Required behavior:

- area size is derived from the number of cells;
- cells cannot overlap another active area;
- irregular connected shapes are allowed;
- disconnected selections must be saved as separate areas;
- a free area may be archived and its cells repartitioned into new areas;
- historical sold/assigned areas are archived, not hard-deleted.

The database keeps explicit cell coordinates or an equivalent lossless cell-run representation. Render polygons are derived projections, not the source of truth.

## Landmarks

The plan may include public landmarks such as entrance, exit, WC, stairs, info desk and named zones. Landmarks help visitors orient themselves without route generation.
