# Venue Sales Map

## Purpose

Create sellable venue areas and connect them to Builder Deals or Partner Participations.

This is an internal sales map. ToonExpo receives only the published public representation.

## Source

Release 1 accepts:

- PNG;
- JPG;
- WebP.

PDF files are converted to an image before upload. Automatic PDF rasterization is not part of Release 1.

## Calibration And Grid

Admin sets the visual scale so one grid cell represents 1 m x 1 m.

The editor displays:

- background plan;
- metric grid;
- existing areas;
- current assignments;
- labels.

## Area Creation

1. Staff drags over a rectangular set of free cells.
2. System checks that cells do not overlap another active area.
3. Staff enters a name/code.
4. System calculates square meters from cell count.
5. Area is saved as free.

Release 1 does not require polygon tools. Non-rectangular shapes can be represented by several neighboring rectangular areas when necessary.

## Area Changes

- free area: rename, change public mode or delete;
- assigned area: release before deleting;
- repartition: release, delete old area, create new smaller areas;
- no dedicated split/merge command in Release 1.

## Allocation

Allocation may be started from:

- map area panel;
- Builder Deal sheet;
- Partner sheet.

Actions:

- assign free area;
- release area;
- replace one assigned area with another;
- assign several areas to one builder deal.

## Status Display

Area visual state is derived from the current allocation:

- free;
- builder;
- partner.

Do not duplicate a separate editable sold status that can disagree with the allocation.

## Public Display

- `organization`: publish organization identity;
- `custom_label`: publish only the entered label;
- `hidden`: publish area geometry without occupant identity.

## Not Included

- route calculation;
- live positioning;
- check-in;
- QR markers;
- polygon editing;
- automatic image optimization pipeline;
- complex publication history or background dispatch.
