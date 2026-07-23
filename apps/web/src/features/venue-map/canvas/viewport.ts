export type ViewportState = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export const MIN_VIEWPORT_SCALE = 0.25;
export const MAX_VIEWPORT_SCALE = 8;
export const ZOOM_IN_FACTOR = 1.08;
export const ZOOM_OUT_FACTOR = 0.92;

/** Convert stage (screen) coordinates to image coordinates. */
export function stageToImagePoint(
  viewport: ViewportState,
  stagePoint: { x: number; y: number },
): { x: number; y: number } {
  return {
    x: (stagePoint.x - viewport.offsetX) / viewport.scale,
    y: (stagePoint.y - viewport.offsetY) / viewport.scale,
  };
}

/** Zoom toward a stage-space cursor anchor (adapted from sipan editor-store-helpers). */
export function zoomAtAnchor(
  viewport: ViewportState,
  nextScale: number,
  anchorX: number,
  anchorY: number,
): ViewportState {
  const clamped = Math.min(Math.max(nextScale, MIN_VIEWPORT_SCALE), MAX_VIEWPORT_SCALE);
  const ratio = clamped / viewport.scale;
  return {
    scale: clamped,
    offsetX: anchorX - (anchorX - viewport.offsetX) * ratio,
    offsetY: anchorY - (anchorY - viewport.offsetY) * ratio,
  };
}

export function panBy(viewport: ViewportState, deltaX: number, deltaY: number): ViewportState {
  return {
    ...viewport,
    offsetX: viewport.offsetX + deltaX,
    offsetY: viewport.offsetY + deltaY,
  };
}

/** Fit an image into the stage with padding; centers the image. */
export function fitViewportToImage(
  stageWidth: number,
  stageHeight: number,
  imageWidth: number,
  imageHeight: number,
  padding = 24,
): ViewportState {
  if (stageWidth <= 0 || stageHeight <= 0 || imageWidth <= 0 || imageHeight <= 0) {
    return { scale: 1, offsetX: 0, offsetY: 0 };
  }
  const availableW = Math.max(stageWidth - padding * 2, 1);
  const availableH = Math.max(stageHeight - padding * 2, 1);
  const scale = Math.min(
    availableW / imageWidth,
    availableH / imageHeight,
    MAX_VIEWPORT_SCALE,
  );
  const clamped = Math.max(scale, MIN_VIEWPORT_SCALE);
  return {
    scale: clamped,
    offsetX: (stageWidth - imageWidth * clamped) / 2,
    offsetY: (stageHeight - imageHeight * clamped) / 2,
  };
}
