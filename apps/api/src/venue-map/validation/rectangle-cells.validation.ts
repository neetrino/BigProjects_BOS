import { BadRequestException } from '@nestjs/common';
import { SpaceAreaCellDto } from '../dto/space-area-cell.dto';

export const CELLS_EMPTY_MESSAGE = 'An area must contain at least one cell.';
export const CELLS_DUPLICATE_MESSAGE = 'Cell coordinates must be unique.';
export const CELLS_NOT_RECTANGLE_MESSAGE =
  'Cells must form a single filled rectangle with no gaps.';

const cellKey = (x: number, y: number): string => `${x},${y}`;

/**
 * Validates that `cells` are unique and form a single filled rectangle (no gaps, no
 * non-rectangular shapes). Throws a `BadRequestException` with a readable message otherwise.
 */
export function assertCellsFormFilledRectangle(cells: SpaceAreaCellDto[]): void {
  if (cells.length === 0) {
    throw new BadRequestException(CELLS_EMPTY_MESSAGE);
  }

  const seen = new Set<string>();
  for (const cell of cells) {
    const key = cellKey(cell.x, cell.y);
    if (seen.has(key)) {
      throw new BadRequestException(CELLS_DUPLICATE_MESSAGE);
    }
    seen.add(key);
  }

  const xs = cells.map((cell) => cell.x);
  const ys = cells.map((cell) => cell.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  if (width * height !== cells.length) {
    throw new BadRequestException(CELLS_NOT_RECTANGLE_MESSAGE);
  }

  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      if (!seen.has(cellKey(x, y))) {
        throw new BadRequestException(CELLS_NOT_RECTANGLE_MESSAGE);
      }
    }
  }
}
