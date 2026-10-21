import type { VenueSpaceArea } from '@/lib/api/venue-map';
import type { GridCell } from './domain/grid-transform';

export const TOONEXPO_VENUE_MAP_SRC = '/toonexpo-venue-map.html?v=11';

export const BOS_MAP_MESSAGE = {
  ready: 'bos-ready',
  fit: 'bos-fit',
  mode: 'bos-mode',
  areas: 'bos-areas',
  selection: 'bos-selection',
  selectArea: 'bos-select-area',
  catalog: 'bos-catalog',
  needCatalog: 'bos-need-catalog',
  highlight: 'bos-highlight',
  moved: 'bos-moved',
  clearDirty: 'bos-clear-dirty',
} as const;

export type BosMapMode = 'select' | 'pan' | 'calibrate';

export type BosMapAreaPayload = {
  id: string;
  name: string;
  code: string | null;
  squareMeters: number;
  occupied: boolean;
  cells: { x: number; y: number }[];
};

export type MapBoothPick = {
  id: string;
  name: string;
  squareMeters: number | null;
  zone: string;
  code: string;
  areaId: string | null;
  cells: { x: number; y: number }[];
  dirty: boolean;
};

type BosMapEnvelope = {
  type: string;
};

export function isBosMapEnvelope(data: unknown): data is BosMapEnvelope {
  return (
    typeof data === 'object' && data !== null && 'type' in data && typeof data.type === 'string'
  );
}

export function isVenueMapMessage(event: MessageEvent): boolean {
  if (!isBosMapEnvelope(event.data)) {
    return false;
  }
  return event.origin === window.location.origin || event.origin === 'null' || event.origin === '';
}

export function toBosMapAreas(areas: readonly VenueSpaceArea[]): BosMapAreaPayload[] {
  return areas.map((area) => ({
    id: area.id,
    name: area.name,
    code: area.code,
    squareMeters: area.squareMeters,
    occupied: area.allocation !== null,
    cells: area.cells.map((cell) => ({ x: cell.x, y: cell.y })),
  }));
}

function parseCell(cell: unknown): { x: number; y: number } | null {
  if (
    typeof cell !== 'object' ||
    cell === null ||
    !('x' in cell) ||
    !('y' in cell) ||
    typeof cell.x !== 'number' ||
    typeof cell.y !== 'number' ||
    !Number.isInteger(cell.x) ||
    !Number.isInteger(cell.y)
  ) {
    return null;
  }
  return { x: cell.x, y: cell.y };
}

function parseBooth(value: unknown, fallbackAreaId: string | null): MapBoothPick | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('id' in value) ||
    typeof value.id !== 'string'
  ) {
    return null;
  }
  const name = 'name' in value && typeof value.name === 'string' ? value.name : value.id;
  const zone = 'zone' in value && typeof value.zone === 'string' ? value.zone : '';
  const code = 'code' in value && typeof value.code === 'string' ? value.code : value.id;
  const squareMeters =
    'sqm' in value && typeof value.sqm === 'number' && Number.isFinite(value.sqm)
      ? value.sqm
      : null;
  const areaId =
    fallbackAreaId ?? ('areaId' in value && typeof value.areaId === 'string' ? value.areaId : null);
  const cells: { x: number; y: number }[] = [];
  if ('cells' in value && Array.isArray(value.cells)) {
    for (const cell of value.cells) {
      const parsed = parseCell(cell);
      if (parsed) {
        cells.push(parsed);
      }
    }
  }
  const dirty = 'dirty' in value && value.dirty === true;
  return { id: value.id, name, squareMeters, zone, code, areaId, cells, dirty };
}

export function bosSelectionToGridCells(data: unknown): GridCell[] {
  if (!isBosMapEnvelope(data) || data.type !== BOS_MAP_MESSAGE.selection) {
    return [];
  }
  if (!('cells' in data) || !Array.isArray(data.cells)) {
    return [];
  }
  const cells: GridCell[] = [];
  for (const cell of data.cells) {
    const parsed = parseCell(cell);
    if (!parsed) {
      return [];
    }
    cells.push({ column: parsed.x, row: parsed.y });
  }
  return cells;
}

export function bosMovedBooth(data: unknown): MapBoothPick | null | undefined {
  if (!isBosMapEnvelope(data) || data.type !== BOS_MAP_MESSAGE.moved) {
    return undefined;
  }
  if (!('booth' in data) || data.booth === null) {
    return null;
  }
  const fallbackAreaId = 'areaId' in data && typeof data.areaId === 'string' ? data.areaId : null;
  return parseBooth(data.booth, fallbackAreaId);
}

export function bosSelectedBooth(data: unknown): MapBoothPick | null | undefined {
  if (!isBosMapEnvelope(data) || data.type !== BOS_MAP_MESSAGE.selectArea) {
    return undefined;
  }
  if (!('booth' in data) || data.booth === null) {
    return null;
  }
  const fallbackAreaId = 'areaId' in data && typeof data.areaId === 'string' ? data.areaId : null;
  return parseBooth(data.booth, fallbackAreaId);
}

export function bosCatalogBooths(data: unknown): MapBoothPick[] | null {
  if (!isBosMapEnvelope(data) || data.type !== BOS_MAP_MESSAGE.catalog) {
    return null;
  }
  if (!('booths' in data) || !Array.isArray(data.booths)) {
    return null;
  }
  const booths: MapBoothPick[] = [];
  for (const item of data.booths) {
    const booth = parseBooth(item, null);
    if (booth) {
      booths.push(booth);
    }
  }
  return booths;
}

export function postToVenueMap(target: Window | null, payload: object): void {
  target?.postMessage(payload, '*');
}
