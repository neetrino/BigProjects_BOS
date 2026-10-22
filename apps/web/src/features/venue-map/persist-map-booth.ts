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

function sameCells(
  left: readonly { x: number; y: number }[],
  right: readonly { x: number; y: number }[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }
  const keys = new Set(left.map((cell) => cellKey(cell)));
  return right.every((cell) => keys.has(cellKey(cell)));
}

/** Row used to lift booths off the hall before writing their new cells. */
const PARKED_CELL_ROW = 100_000;

function cellsOverlap(
  cells: readonly { x: number; y: number }[],
  occupied: ReadonlySet<string>,
): boolean {
  return cells.some((cell) => occupied.has(cellKey(cell)));
}

/**
 * Creates a space area for every floor-plan booth that is not already on the plan.
 * Booths that move into a neighbour's old cells are parked off the hall first, so the
 * write does not collide with the previous layout.
 */
export async function persistMissingMapBooths(
  planId: string,
  booths: readonly MapBoothPick[],
  areas: readonly VenueSpaceArea[],
): Promise<{ created: number; updated: number; failed: number }> {
  const catalogCodes = new Set(booths.map((booth) => booth.code));
  const occupied = new Set<string>();
  for (const area of areas) {
    if (area.code && catalogCodes.has(area.code)) {
      continue;
    }
    for (const cell of area.cells) {
      occupied.add(cellKey(cell));
    }
  }

  const claimed = new Set<string>();
  let created = 0;
  let updated = 0;
  let failed = 0;
  const moves: { id: string; cells: { x: number; y: number }[] }[] = [];
  const creates: MapBoothPick[] = [];

  for (const booth of booths) {
    if (booth.cells.length === 0 || cellsOverlap(booth.cells, occupied)) {
      if (booth.cells.length > 0) {
        failed += 1;
      }
      continue;
    }
    if (cellsOverlap(booth.cells, claimed)) {
      failed += 1;
      continue;
    }
    for (const cell of booth.cells) {
      claimed.add(cellKey(cell));
    }
    const existing = areas.find((area) => area.code === booth.code);
    if (!existing) {
      creates.push(booth);
      continue;
    }
    if (!sameCells(existing.cells, booth.cells)) {
      moves.push({ id: existing.id, cells: booth.cells });
    }
  }

  for (let index = 0; index < moves.length; index += 1) {
    await updateSpaceArea(moves[index].id, {
      cells: [{ x: index, y: PARKED_CELL_ROW }],
    });
  }

  for (const move of moves) {
    try {
      await updateSpaceArea(move.id, { cells: move.cells });
      updated += 1;
    } catch {
      failed += 1;
    }
  }

  for (const booth of creates) {
    try {
      await createSpaceArea(planId, {
        name: booth.name,
        code: booth.code,
        cells: booth.cells,
      });
      created += 1;
    } catch {
      failed += 1;
    }
  }

  return { created, updated, failed };
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
