import type { CalibrationGeometry, GridBounds } from './grid-transform';

export type ViewportState = {
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
};

export type VisibleGridRange = {
  readonly minRow: number;
  readonly maxRow: number;
  readonly minColumn: number;
  readonly maxColumn: number;
};

/**
 * Visible cell range for the current stage viewport (adapted from sipan).
 * Accounts for grid origin so culling stays correct after origin nudges.
 */
export function visibleGridRange(
  stageWidth: number,
  stageHeight: number,
  viewport: ViewportState,
  calibration: CalibrationGeometry,
): VisibleGridRange {
  const { pixelsPerMeter: cellSizePx, gridOriginXPx, gridOriginYPx, bounds } = calibration;
  const minImageX = -viewport.offsetX / viewport.scale;
  const minImageY = -viewport.offsetY / viewport.scale;
  const maxImageX = (stageWidth - viewport.offsetX) / viewport.scale;
  const maxImageY = (stageHeight - viewport.offsetY) / viewport.scale;

  const minColumn = clamp(
    Math.floor((minImageX - gridOriginXPx) / cellSizePx),
    bounds.minColumn,
    bounds.maxColumn,
  );
  const maxColumn = clamp(
    Math.ceil((maxImageX - gridOriginXPx) / cellSizePx) - 1,
    bounds.minColumn,
    bounds.maxColumn,
  );
  const minRow = clamp(
    Math.floor((minImageY - gridOriginYPx) / cellSizePx),
    bounds.minRow,
    bounds.maxRow,
  );
  const maxRow = clamp(
    Math.ceil((maxImageY - gridOriginYPx) / cellSizePx) - 1,
    bounds.minRow,
    bounds.maxRow,
  );

  return { minRow, maxRow, minColumn, maxColumn };
}

export function emptyVisibleRange(bounds: GridBounds): VisibleGridRange {
  return {
    minRow: bounds.minRow,
    maxRow: bounds.maxRow,
    minColumn: bounds.minColumn,
    maxColumn: bounds.maxColumn,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
