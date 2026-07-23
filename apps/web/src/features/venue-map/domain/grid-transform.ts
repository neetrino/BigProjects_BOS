/** Axis-aligned grid bounds in cell coordinates (inclusive). */
export type GridBounds = {
  readonly minRow: number;
  readonly maxRow: number;
  readonly minColumn: number;
  readonly maxColumn: number;
};

/**
 * Calibration for a metric grid: 1 cell = 1 m × 1 m.
 * Rotation is intentionally unsupported in Release 1.
 */
export type CalibrationGeometry = {
  readonly pixelsPerMeter: number;
  readonly gridOriginXPx: number;
  readonly gridOriginYPx: number;
  readonly bounds: GridBounds;
};

export type ImagePoint = { readonly x: number; readonly y: number };

export type GridCell = { readonly row: number; readonly column: number };

/** Build bounds covering the image at the given pixels-per-meter scale. */
export function gridBoundsFromImage(
  imageWidth: number,
  imageHeight: number,
  pixelsPerMeter: number,
): GridBounds | null {
  if (!Number.isFinite(pixelsPerMeter) || pixelsPerMeter <= 0) {
    return null;
  }
  const columns = Math.floor(imageWidth / pixelsPerMeter);
  const rows = Math.floor(imageHeight / pixelsPerMeter);
  if (columns < 1 || rows < 1) {
    return null;
  }
  return {
    minRow: 0,
    maxRow: rows - 1,
    minColumn: 0,
    maxColumn: columns - 1,
  };
}

export function buildCalibration(
  pixelsPerMeter: number,
  gridOriginXPx: number,
  gridOriginYPx: number,
  imageWidth: number,
  imageHeight: number,
): CalibrationGeometry | null {
  const bounds = gridBoundsFromImage(imageWidth, imageHeight, pixelsPerMeter);
  if (bounds === null) {
    return null;
  }
  return {
    pixelsPerMeter,
    gridOriginXPx,
    gridOriginYPx,
    bounds,
  };
}

export function cellTopLeftPx(
  row: number,
  column: number,
  calibration: CalibrationGeometry,
): ImagePoint {
  return {
    x: calibration.gridOriginXPx + column * calibration.pixelsPerMeter,
    y: calibration.gridOriginYPx + row * calibration.pixelsPerMeter,
  };
}

export function cellRectPx(
  row: number,
  column: number,
  calibration: CalibrationGeometry,
): { x: number; y: number; width: number; height: number } {
  const topLeft = cellTopLeftPx(row, column, calibration);
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: calibration.pixelsPerMeter,
    height: calibration.pixelsPerMeter,
  };
}

export function imagePxToGridCell(
  x: number,
  y: number,
  calibration: CalibrationGeometry,
): GridCell | null {
  const localX = x - calibration.gridOriginXPx;
  const localY = y - calibration.gridOriginYPx;
  const column = Math.floor(localX / calibration.pixelsPerMeter);
  const row = Math.floor(localY / calibration.pixelsPerMeter);
  if (!isWithinBounds(row, column, calibration.bounds)) {
    return null;
  }
  return { row, column };
}

/** Pixel distance between two image points divided by real meters. */
export function computePixelsPerMeter(
  pointA: ImagePoint,
  pointB: ImagePoint,
  distanceMeters: number,
): number | null {
  if (!Number.isFinite(distanceMeters) || distanceMeters <= 0) {
    return null;
  }
  const pixelDistance = Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
  if (pixelDistance <= 0) {
    return null;
  }
  return pixelDistance / distanceMeters;
}

export function isWithinBounds(row: number, column: number, bounds: GridBounds): boolean {
  return (
    row >= bounds.minRow &&
    row <= bounds.maxRow &&
    column >= bounds.minColumn &&
    column <= bounds.maxColumn
  );
}

/** Encode a grid cell as `column,row` (x,y). */
export function cellKey(row: number, column: number): string {
  return `${column},${row}`;
}

export function parseCellKey(key: string): GridCell | null {
  const [columnRaw, rowRaw] = key.split(',');
  const column = Number(columnRaw);
  const row = Number(rowRaw);
  if (!Number.isInteger(column) || !Number.isInteger(row)) {
    return null;
  }
  return { row, column };
}
