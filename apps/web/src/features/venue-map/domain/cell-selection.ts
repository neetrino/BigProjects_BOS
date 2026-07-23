import type { GridCell } from './grid-transform';
import { cellKey, isWithinBounds, type GridBounds } from './grid-transform';

/** Inclusive rectangular range of cells between two corners. */
export function cellsInRectangle(start: GridCell, end: GridCell): GridCell[] {
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minColumn = Math.min(start.column, end.column);
  const maxColumn = Math.max(start.column, end.column);
  const cells: GridCell[] = [];
  for (let row = minRow; row <= maxRow; row += 1) {
    for (let column = minColumn; column <= maxColumn; column += 1) {
      cells.push({ row, column });
    }
  }
  return cells;
}

/** Keep only free cells inside bounds (exclude occupied keys). */
export function filterFreeCells(
  cells: readonly GridCell[],
  occupied: ReadonlySet<string>,
  bounds: GridBounds,
): GridCell[] {
  return cells.filter(
    (cell) =>
      isWithinBounds(cell.row, cell.column, bounds) &&
      !occupied.has(cellKey(cell.row, cell.column)),
  );
}

/** Axis-aligned bounding box of cells in image pixels. */
export function cellsBoundingRect(
  cells: readonly GridCell[],
  pixelsPerMeter: number,
  gridOriginXPx: number,
  gridOriginYPx: number,
): { x: number; y: number; width: number; height: number } | null {
  if (cells.length === 0) {
    return null;
  }
  let minRow = cells[0].row;
  let maxRow = cells[0].row;
  let minColumn = cells[0].column;
  let maxColumn = cells[0].column;
  for (const cell of cells) {
    minRow = Math.min(minRow, cell.row);
    maxRow = Math.max(maxRow, cell.row);
    minColumn = Math.min(minColumn, cell.column);
    maxColumn = Math.max(maxColumn, cell.column);
  }
  return {
    x: gridOriginXPx + minColumn * pixelsPerMeter,
    y: gridOriginYPx + minRow * pixelsPerMeter,
    width: (maxColumn - minColumn + 1) * pixelsPerMeter,
    height: (maxRow - minRow + 1) * pixelsPerMeter,
  };
}

/** True when cells form a filled rectangle with no holes. */
export function isFilledRectangle(cells: readonly GridCell[]): boolean {
  if (cells.length === 0) {
    return false;
  }
  let minRow = cells[0].row;
  let maxRow = cells[0].row;
  let minColumn = cells[0].column;
  let maxColumn = cells[0].column;
  const keys = new Set<string>();
  for (const cell of cells) {
    minRow = Math.min(minRow, cell.row);
    maxRow = Math.max(maxRow, cell.row);
    minColumn = Math.min(minColumn, cell.column);
    maxColumn = Math.max(maxColumn, cell.column);
    keys.add(cellKey(cell.row, cell.column));
  }
  const expected = (maxRow - minRow + 1) * (maxColumn - minColumn + 1);
  if (keys.size !== expected) {
    return false;
  }
  for (let row = minRow; row <= maxRow; row += 1) {
    for (let column = minColumn; column <= maxColumn; column += 1) {
      if (!keys.has(cellKey(row, column))) {
        return false;
      }
    }
  }
  return true;
}
