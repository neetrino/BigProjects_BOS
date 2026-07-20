# Grid And Area Model

## Venue Plan

`VenuePlan` belongs to one EventCycle and stores:

- normalized background asset;
- source width and height;
- grid origin and rotation;
- pixels per meter calibration;
- logical row/column bounds;
- draft and published version metadata.

Release 1 supports one plan/hall per cycle. The model may allow additional plans later without changing area semantics.

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

## Sellable Area

`SpaceArea` is a named contiguous set of sellable grid cells.

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

