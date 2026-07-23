'use client';

import type Konva from 'konva';
import { Shape } from 'react-konva';
import { drawGridLines } from '../canvas/canvas-draw';
import type { CalibrationGeometry } from '../domain/grid-transform';
import { visibleGridRange } from '../domain/viewport-bounds';
import type { ViewportState } from '../canvas/viewport';

type GridLayerProps = {
  calibration: CalibrationGeometry;
  viewport: ViewportState;
  stageWidth: number;
  stageHeight: number;
};

export function GridLayer({
  calibration,
  viewport,
  stageWidth,
  stageHeight,
}: GridLayerProps) {
  const range = visibleGridRange(stageWidth, stageHeight, viewport, calibration);

  return (
    <Shape
      listening={false}
      sceneFunc={(context: Konva.Context, shape: Konva.Shape) => {
        drawGridLines(context, calibration, range);
        context.fillStrokeShape(shape);
      }}
    />
  );
}
