import type { CalibrationGeometry } from '../domain/grid-transform';
import { cellRectPx } from '../domain/grid-transform';
import type { VisibleGridRange } from '../domain/viewport-bounds';

type DrawContext = {
  beginPath: () => void;
  moveTo: (x: number, y: number) => void;
  lineTo: (x: number, y: number) => void;
  stroke: () => void;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
};

/**
 * Draw metric grid lines for the visible range as a single path
 * (sipan canvas-draw performance pattern).
 */
export function drawGridLines(
  context: DrawContext,
  calibration: CalibrationGeometry,
  range: VisibleGridRange,
): void {
  context.beginPath();
  context.strokeStyle = 'rgba(148, 163, 184, 0.4)';
  context.lineWidth = 1;
  for (let column = range.minColumn; column <= range.maxColumn + 1; column += 1) {
    const top = cellRectPx(range.minRow, column, calibration);
    const bottom = cellRectPx(range.maxRow, column, calibration);
    context.moveTo(top.x, top.y);
    context.lineTo(bottom.x, bottom.y + calibration.pixelsPerMeter);
  }
  for (let row = range.minRow; row <= range.maxRow + 1; row += 1) {
    const left = cellRectPx(row, range.minColumn, calibration);
    const right = cellRectPx(row, range.maxColumn, calibration);
    context.moveTo(left.x, left.y);
    context.lineTo(right.x + calibration.pixelsPerMeter, right.y);
  }
  context.stroke();
}
