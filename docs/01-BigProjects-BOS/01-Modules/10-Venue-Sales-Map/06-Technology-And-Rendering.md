# Technology And Rendering

## Frontend Technology

Use stable `konva` 10.x with a compatible stable `react-konva` release inside a Next.js Client Component.

Konva is a renderer and interaction layer only. It does not own persistence or business rules.

## Layers

Canvas layers:

```text
background
metric grid
system classifications
sellable areas
labels and status projection
active selection/tools
```

The metric grid is drawn as a custom canvas shape or batched layer, not thousands of React components. Non-interactive layers disable hit listening. The BOS editor is verified on supported desktop/tablet viewports; ToonExpo separately owns public/mobile rendering verification for the published snapshot.

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

PDF/PNG/JPEG/WebP upload is normalized to a web image with known dimensions. VenuePlanRevision stores the source asset and image-to-meter calibration. BOS retains the private original and normalized render asset for every revision; the active revision's normalized asset is used for editing and new publication.

- A multi-page PDF requires Admin to select exactly one page for the Release 1 hall plan.
- Image orientation metadata is applied and stripped; aspect ratio is preserved.
- Normalization produces deterministic lossless WebP with a maximum dimension of 8192 px and records source/normalized SHA-256.
- Calibration uses two selected image points plus a known real-world distance; the first point defines grid origin and the line defines rotation/pixels-per-meter.
- Logical bounds are capped at 500 rows x 500 columns in Release 1; larger venues require an explicit architecture/performance decision.

## Performance Acceptance

- Supported browsers are the latest two stable desktop versions of Chrome, Edge and Safari.
- The 250,000-cell logical maximum is rendered as batched/custom layers, never one React node per cell.
- On the agreed QA reference laptop, pan/zoom and selection target 30 FPS or better and pointer feedback begins within 100 ms for a representative 200 x 200 populated plan.
- Save/publication correctness is tested independently from renderer frame rate; NestJS remains authoritative.

## Future Routing

Route calculation is not part of Release 1. The plan still preserves walkable/blocked classifications and destination access points so a later ToonExpo route engine can use professional pathfinding without redesigning the map.
