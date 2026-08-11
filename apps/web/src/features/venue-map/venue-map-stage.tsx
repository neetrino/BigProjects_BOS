'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type Konva from 'konva';
import { Layer, Stage } from 'react-konva';
import type { VenuePlan } from '@/lib/api/venue-map';
import {
  CALIBRATION_LINE_STROKE,
  CALIBRATION_POINT_FILL,
  SELECTION_FILL,
  SELECTION_STROKE,
} from './constants';
import {
  fitViewportToImage,
  panBy,
  stageToImagePoint,
  zoomAtAnchor,
  ZOOM_IN_FACTOR,
  ZOOM_OUT_FACTOR,
  type ViewportState,
} from './canvas/viewport';
import { cellsInRectangle, filterFreeCells } from './domain/cell-selection';
import {
  buildCalibration,
  cellKey,
  imagePxToGridCell,
  type GridCell,
  type ImagePoint,
} from './domain/grid-transform';
import { usePlanImage } from './hooks/use-plan-image';
import { useSpacePressed, useStageSize } from './hooks/use-stage-interaction';
import {
  AreasLayer,
  CalibrationOverlay,
  SelectionPreview,
  type AreaHoverTip,
} from './layers/areas-layer';
import { BackgroundLayer } from './layers/background-layer';
import { GridLayer } from './layers/grid-layer';
import { occupiedCellKeys } from './occupied-cells';

const AREA_HOVER_TIP_OFFSET_PX = 14;
export type EditorInteractionMode = 'select' | 'calibrate' | 'pan';

export type VenueMapStageProps = {
  plan: VenuePlan;
  selectedAreaId: string | null;
  interactionMode: EditorInteractionMode;
  pendingSelection: readonly GridCell[];
  onSelectArea: (areaId: string | null) => void;
  onSelectionComplete: (cells: GridCell[]) => void;
  onCalibrationPointsChange: (points: ImagePoint[]) => void;
  calibrationPoints: ImagePoint[];
  fitRequestId: number;
};

type DragState = {
  kind: 'pan' | 'select';
  lastX: number;
  lastY: number;
  startCell: GridCell | null;
};

export function VenueMapStage({
  plan,
  selectedAreaId,
  interactionMode,
  pendingSelection,
  onSelectArea,
  onSelectionComplete,
  onCalibrationPointsChange,
  calibrationPoints,
  fitRequestId,
}: VenueMapStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useStageSize(containerRef);
  const [viewport, setViewport] = useState<ViewportState>({ scale: 1, offsetX: 0, offsetY: 0 });
  const spacePressed = useSpacePressed();
  const [previewCells, setPreviewCells] = useState<GridCell[]>([]);
  const previewRef = useRef<GridCell[]>([]);
  const dragRef = useRef<DragState | null>(null);
  const [hoverTip, setHoverTip] = useState<AreaHoverTip | null>(null);

  const image = usePlanImage(plan.imageUrl);
  const imageWidth = plan.imageWidth ?? image?.naturalWidth ?? 0;
  const imageHeight = plan.imageHeight ?? image?.naturalHeight ?? 0;

  const calibration = useMemo(() => {
    if (
      plan.pixelsPerMeter == null ||
      plan.pixelsPerMeter <= 0 ||
      imageWidth <= 0 ||
      imageHeight <= 0
    ) {
      return null;
    }
    return buildCalibration(
      plan.pixelsPerMeter,
      plan.gridOriginX,
      plan.gridOriginY,
      imageWidth,
      imageHeight,
    );
  }, [plan.pixelsPerMeter, plan.gridOriginX, plan.gridOriginY, imageWidth, imageHeight]);

  const occupied = useMemo(() => occupiedCellKeys(plan.areas), [plan.areas]);

  const fitKey = `${fitRequestId}:${size.width}x${size.height}:${imageWidth}x${imageHeight}`;
  const [appliedFitKey, setAppliedFitKey] = useState('');
  if (
    size.width > 0 &&
    size.height > 0 &&
    imageWidth > 0 &&
    imageHeight > 0 &&
    fitKey !== appliedFitKey
  ) {
    setAppliedFitKey(fitKey);
    setViewport(fitViewportToImage(size.width, size.height, imageWidth, imageHeight));
  }

  const isPanning = interactionMode === 'pan' || spacePressed;

  const handleWheel = useCallback((event: Konva.KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();
    const pointer = event.target.getStage()?.getPointerPosition();
    if (!pointer) {
      return;
    }
    const direction = event.evt.deltaY > 0 ? -1 : 1;
    setViewport((prev) =>
      zoomAtAnchor(
        prev,
        prev.scale * (direction > 0 ? ZOOM_IN_FACTOR : ZOOM_OUT_FACTOR),
        pointer.x,
        pointer.y,
      ),
    );
  }, []);

  const handlePointerDown = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const pointer = event.target.getStage()?.getPointerPosition();
      if (!pointer) {
        return;
      }
      if (isPanning) {
        dragRef.current = { kind: 'pan', lastX: pointer.x, lastY: pointer.y, startCell: null };
        return;
      }
      const imagePoint = stageToImagePoint(viewport, pointer);
      if (interactionMode === 'calibrate') {
        const next =
          calibrationPoints.length >= 2
            ? [imagePoint]
            : [...calibrationPoints, imagePoint].slice(0, 2);
        onCalibrationPointsChange(next);
        return;
      }
      if (!calibration) {
        return;
      }
      const cell = imagePxToGridCell(imagePoint.x, imagePoint.y, calibration);
      if (!cell) {
        onSelectArea(null);
        return;
      }
      if (occupied.has(cellKey(cell.row, cell.column))) {
        return;
      }
      onSelectArea(null);
      dragRef.current = { kind: 'select', lastX: pointer.x, lastY: pointer.y, startCell: cell };
      previewRef.current = [cell];
      setPreviewCells([cell]);
    },
    [
      calibration,
      calibrationPoints,
      interactionMode,
      isPanning,
      occupied,
      onCalibrationPointsChange,
      onSelectArea,
      viewport,
    ],
  );

  const handlePointerMove = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const drag = dragRef.current;
      const pointer = event.target.getStage()?.getPointerPosition();
      if (!drag || !pointer) {
        return;
      }
      if (drag.kind === 'pan') {
        const dx = pointer.x - drag.lastX;
        const dy = pointer.y - drag.lastY;
        drag.lastX = pointer.x;
        drag.lastY = pointer.y;
        setViewport((prev) => panBy(prev, dx, dy));
        return;
      }
      if (!calibration || !drag.startCell) {
        return;
      }
      const imagePoint = stageToImagePoint(viewport, pointer);
      const end = imagePxToGridCell(imagePoint.x, imagePoint.y, calibration);
      if (!end) {
        return;
      }
      const free = filterFreeCells(
        cellsInRectangle(drag.startCell, end),
        occupied,
        calibration.bounds,
      );
      previewRef.current = free;
      setPreviewCells(free);
    },
    [calibration, occupied, viewport],
  );

  const handlePointerUp = useCallback(() => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag || drag.kind !== 'select') {
      return;
    }
    const cells = previewRef.current;
    previewRef.current = [];
    setPreviewCells([]);
    if (cells.length > 0) {
      onSelectionComplete(cells);
    }
  }, [onSelectionComplete]);

  const cursor = isPanning ? 'grab' : interactionMode === 'calibrate' ? 'crosshair' : 'default';
  const selectionCells = previewCells.length > 0 ? previewCells : pendingSelection;

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-0 w-full overflow-hidden bg-[var(--color-bg)]"
    >
      {size.width > 0 && size.height > 0 ? (
        <Stage
          width={size.width}
          height={size.height}
          scaleX={viewport.scale}
          scaleY={viewport.scale}
          x={viewport.offsetX}
          y={viewport.offsetY}
          style={{ cursor }}
          onWheel={handleWheel}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          onMouseMove={handlePointerMove}
          onTouchMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchEnd={handlePointerUp}
          onMouseLeave={() => {
            handlePointerUp();
            setHoverTip(null);
          }}
        >
          <Layer>
            <BackgroundLayer image={image} width={imageWidth} height={imageHeight} />
            {calibration ? (
              <GridLayer
                calibration={calibration}
                viewport={viewport}
                stageWidth={size.width}
                stageHeight={size.height}
              />
            ) : null}
            {calibration ? (
              <AreasLayer
                areas={plan.areas}
                calibration={calibration}
                selectedAreaId={selectedAreaId}
                scale={viewport.scale}
                onSelectArea={onSelectArea}
                onHoverTipChange={setHoverTip}
              />
            ) : null}
            {calibration && selectionCells.length > 0 ? (
              <SelectionPreview
                cells={selectionCells}
                calibration={calibration}
                fill={SELECTION_FILL}
                stroke={SELECTION_STROKE}
                scale={viewport.scale}
              />
            ) : null}
            {calibrationPoints.length > 0 ? (
              <CalibrationOverlay
                points={calibrationPoints}
                scale={viewport.scale}
                pointFill={CALIBRATION_POINT_FILL}
                lineStroke={CALIBRATION_LINE_STROKE}
              />
            ) : null}
          </Layer>
        </Stage>
      ) : null}
      {hoverTip ? (
        <div
          className="pointer-events-none absolute z-10 max-w-[16rem] rounded-lg bg-[var(--color-fg)] px-2.5 py-1.5 text-xs font-semibold text-white shadow-[var(--shadow-lift)]"
          style={{
            left: hoverTip.clientX + AREA_HOVER_TIP_OFFSET_PX,
            top: hoverTip.clientY + AREA_HOVER_TIP_OFFSET_PX,
          }}
        >
          <p className="truncate">{hoverTip.name}</p>
          <p className="font-medium text-white/80">{hoverTip.squareMeters} m²</p>
        </div>
      ) : null}
    </div>
  );
}
