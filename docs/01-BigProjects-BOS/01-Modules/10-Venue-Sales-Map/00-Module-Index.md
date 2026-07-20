# Venue Sales Map - Module Index

## Purpose

Venue Sales Map is the internal BOS workspace for defining and selling physical exhibition space on a calibrated 1 m x 1 m grid.

It is part of Release 1 and is directly integrated with Builder Sales and optional partner placement.

## Canonical Rules

- One Release 1 event cycle has one venue plan.
- A source PDF or image is used as the visual background.
- One logical grid cell represents 1 square meter.
- Staff creates named sellable areas from contiguous cells.
- One BuilderDeal may own several areas.
- A BuilderDeal cannot move to `won` without at least one active allocation.
- Partners may receive areas, but partner confirmation does not require one.
- BOS is the only map editor and publication source of truth.
- ToonExpo stores and renders a published snapshot from its own database.
- Professional visitor routing is deferred; the data model is routing-ready.

## Reading Order

1. [Grid And Area Model](./01-Grid-And-Area-Model.md)
2. [Editor UX](./02-Editor-UX.md)
3. [CRM And Partner Integration](./03-CRM-And-Partner-Integration.md)
4. [Allocation Lifecycle](./04-Allocation-Lifecycle.md)
5. [Publishing To ToonExpo](./05-Publishing-To-ToonExpo.md)
6. [Technology And Rendering](./06-Technology-And-Rendering.md)
7. [Permissions And Audit](./07-Permissions-And-Audit.md)
8. [Acceptance Criteria](./08-Acceptance-Criteria.md)

