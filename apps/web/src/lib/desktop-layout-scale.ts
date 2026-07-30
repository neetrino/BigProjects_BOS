/** Read the live CSS zoom on the desktop fluid stage (1 when absent). */
export function getDesktopLayoutScale(): number {
  if (typeof document === 'undefined') {
    return 1;
  }
  const stage = document.querySelector('.desktop-fluid-stage');
  if (!(stage instanceof HTMLElement)) {
    return 1;
  }

  /*
   * Prefer visual/layout ratio over getComputedStyle(zoom).
   * Safari historically reports zoom inconsistently with getBoundingClientRect,
   * which mis-positions portaled dropdowns. Ratio stays correct whether gBCR
   * returns scaled or unscaled values.
   */
  const layoutWidth = stage.offsetWidth;
  if (layoutWidth > 0) {
    const visualWidth = stage.getBoundingClientRect().width;
    const ratio = visualWidth / layoutWidth;
    if (Number.isFinite(ratio) && ratio > 0) {
      return ratio;
    }
  }

  const currentCssZoom = (stage as HTMLElement & { currentCSSZoom?: number }).currentCSSZoom;
  if (typeof currentCssZoom === 'number' && Number.isFinite(currentCssZoom) && currentCssZoom > 0) {
    return currentCssZoom;
  }

  const zoom = Number.parseFloat(getComputedStyle(stage).zoom);
  return Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
}

export function getDesktopFluidStage(): HTMLElement | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const stage = document.querySelector('.desktop-fluid-stage');
  return stage instanceof HTMLElement ? stage : null;
}

export type StageBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

/** Map a viewport DOMRect into pre-zoom coordinates inside the desktop stage. */
export function viewportRectToStage(rect: DOMRectReadOnly): StageBox {
  const stage = getDesktopFluidStage();
  const zoom = getDesktopLayoutScale();
  if (!stage) {
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  }
  const stageRect = stage.getBoundingClientRect();
  return {
    top: (rect.top - stageRect.top) / zoom,
    left: (rect.left - stageRect.left) / zoom,
    width: rect.width / zoom,
    height: rect.height / zoom,
  };
}

export function viewportLengthToStage(lengthPx: number): number {
  return lengthPx / getDesktopLayoutScale();
}

export function getStageLayoutHeight(): number {
  const stage = getDesktopFluidStage();
  if (!stage) {
    return typeof window !== 'undefined' ? window.innerHeight : 0;
  }
  return stage.clientHeight;
}
