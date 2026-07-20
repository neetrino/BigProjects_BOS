# Technology And Rendering

## Frontend Technology

Use stable `konva` 10.x with a compatible stable `react-konva` release inside a Next.js Client Component.

Konva is a renderer and interaction layer only. It does not own persistence or business rules.

## Layers

Recommended canvas layers:

```text
background
metric grid
system classifications
sellable areas
labels and status projection
active selection/tools
```

The metric grid should be drawn as a custom canvas shape or batched layer, not thousands of React components. Non-interactive layers disable hit listening. Public and editor performance must be verified on representative desktop and mobile devices.

## Backend Boundary

```text
Browser -> Next.js map UI -> NestJS REST API -> Prisma -> PostgreSQL
```

- Next.js converts pointer coordinates and renders previews.
- NestJS validates permissions, cells, connectivity, overlaps, transitions and publication.
- PostgreSQL stores canonical map records.
- Cloudflare R2 stores source/normalized plan assets.
- Konva scene JSON is never the database source of truth.

## Source Asset

PDF/image upload is normalized to a web image with known dimensions. Calibration stores the image-to-meter transform. The original source may be retained as an attachment; the normalized asset is used for rendering and publication.

## Future Routing

Route calculation is not part of Release 1. The plan still preserves walkable/blocked classifications and destination access points so a later ToonExpo route engine can use professional pathfinding without redesigning the map.

