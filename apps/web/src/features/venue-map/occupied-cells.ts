import type { VenueSpaceArea } from '@/lib/api/venue-map';
import { cellKey } from './domain/grid-transform';

export function occupiedCellKeys(areas: readonly VenueSpaceArea[]): Set<string> {
  const keys = new Set<string>();
  for (const area of areas) {
    for (const cell of area.cells) {
      keys.add(cellKey(cell.y, cell.x));
    }
  }
  return keys;
}
