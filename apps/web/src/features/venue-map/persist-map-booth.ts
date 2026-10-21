import { createSpaceArea, updateSpaceArea, type VenueSpaceArea } from '@/lib/api/venue-map';
import type { MapBoothPick } from './toonexpo-venue-map-bridge';

function findBoothArea(
  booth: MapBoothPick,
  areas: readonly VenueSpaceArea[],
): VenueSpaceArea | undefined {
  return areas.find((area) => area.id === booth.areaId || area.code === booth.code);
}

/** Finds or creates a BOS area for a map booth so the right panel can assign it. */
export async function persistMapBooth(
  planId: string,
  booth: MapBoothPick,
  areas: readonly VenueSpaceArea[],
): Promise<string | null> {
  const existing = findBoothArea(booth, areas);
  if (existing) {
    return existing.id;
  }
  if (booth.cells.length === 0) {
    return null;
  }
  const created = await createSpaceArea(planId, {
    name: booth.name,
    code: booth.code,
    cells: booth.cells,
  });
  return created.id;
}

/** Saves a dragged/nudged booth position onto its BOS area. */
export async function persistMapBoothMove(
  planId: string,
  booth: MapBoothPick,
  areas: readonly VenueSpaceArea[],
): Promise<string | null> {
  if (booth.cells.length === 0) {
    return findBoothArea(booth, areas)?.id ?? booth.areaId;
  }
  const existing = findBoothArea(booth, areas);
  if (existing) {
    await updateSpaceArea(existing.id, { cells: booth.cells });
    return existing.id;
  }
  return persistMapBooth(planId, booth, areas);
}

function cellKey(cell: { x: number; y: number }): string {
  return `${cell.x}:${cell.y}`;
}

function boothAlreadyStored(booth: MapBoothPick, areas: readonly VenueSpaceArea[]): boolean {
  return areas.some((area) => area.code === booth.code);
}

/**
 * Creates a space area for every floor-plan booth that is not already on the plan.
 * Existing areas, including manual ones, are left unchanged.
 */
export async function persistMissingMapBooths(
  planId: string,
  booths: readonly MapBoothPick[],
  areas: readonly VenueSpaceArea[],
): Promise<{ created: number; failed: number }> {
  const occupied = new Set<string>();
  for (const area of areas) {
    for (const cell of area.cells) {
      occupied.add(cellKey(cell));
    }
  }

  let created = 0;
  let failed = 0;
  for (const booth of booths) {
    if (booth.cells.length === 0 || boothAlreadyStored(booth, areas)) {
      continue;
    }
    const overlaps = booth.cells.some((cell) => occupied.has(cellKey(cell)));
    if (overlaps) {
      failed += 1;
      continue;
    }
    try {
      await createSpaceArea(planId, {
        name: booth.name,
        code: booth.code,
        cells: booth.cells,
      });
      created += 1;
      for (const cell of booth.cells) {
        occupied.add(cellKey(cell));
      }
    } catch {
      failed += 1;
    }
  }
  return { created, failed };
}

/** Saves every booth that still has a pending layout change. */
export async function persistMapBoothLayout(
  planId: string,
  booths: readonly MapBoothPick[],
  areas: readonly VenueSpaceArea[],
): Promise<number> {
  const pending = booths.filter((booth) => booth.dirty && booth.cells.length > 0);
  let saved = 0;
  let knownAreas = areas;
  for (const booth of pending) {
    const areaId = await persistMapBoothMove(planId, booth, knownAreas);
    if (!areaId) {
      continue;
    }
    saved += 1;
    if (!knownAreas.some((area) => area.id === areaId || area.code === booth.code)) {
      knownAreas = [
        ...knownAreas,
        {
          id: areaId,
          code: booth.code,
          name: booth.name,
          squareMeters: booth.cells.length,
          publicDisplayMode: 'ORGANIZATION',
          customPublicLabel: null,
          cells: booth.cells,
          allocation: null,
          createdAt: new Date().toISOString(),
        },
      ];
    }
  }
  return saved;
}
