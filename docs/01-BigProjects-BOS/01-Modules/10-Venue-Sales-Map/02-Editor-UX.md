# Editor UX

## Workspace Layout

```text
Toolbar
Map canvas
Layer/status legend
Selection summary
Area or allocation sheet
Publish status
```

## Tools

- pan and zoom;
- rectangle select;
- paint/add cells;
- erase cells from current selection;
- classify system cells;
- create named area;
- edit free area;
- split/repartition free area;
- select and open assigned area;
- open linked BuilderDeal or PartnerParticipation.

## Selection Rules

Pointer coordinates are transformed to logical grid coordinates. The client previews the selection and derived square meters; NestJS repeats overlap, classification, connectivity and permission validation before save.

## Area Sheet

Shows:

- code and name;
- square meters;
- availability/allocation state;
- linked organization and business record;
- builder deal stage or partner stage internally;
- price fields when available;
- public display mode and label;
- activity history.

## Unsaved And Published State

The workspace must always show one of:

```text
Up to date
Unpublished changes
Publishing
Publish failed
```

It also shows active snapshot version, publication time and publisher.

