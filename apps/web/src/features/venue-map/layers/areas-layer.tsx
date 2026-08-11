'use client';

import { Group, Line, Rect, Text } from 'react-konva';
import type { VenueSpaceArea } from '@/lib/api/venue-map';
import {
  LABEL_BASE_FONT_SIZE,
  LABEL_MAX_SCREEN_SIZE,
  LABEL_MIN_SCREEN_SIZE,
  areaMapColors,
} from '../constants';
import { cellsBoundingRect } from '../domain/cell-selection';
import type { CalibrationGeometry } from '../domain/grid-transform';

export type AreaHoverTip = {
  name: string;
  squareMeters: number;
  clientX: number;
  clientY: number;
};

type AreasLayerProps = {
  areas: readonly VenueSpaceArea[];
  calibration: CalibrationGeometry;
  selectedAreaId: string | null;
  scale: number;
  onSelectArea: (areaId: string) => void;
  onHoverTipChange: (tip: AreaHoverTip | null) => void;
};

type AreaRect = {
  area: VenueSpaceArea;
  x: number;
  y: number;
  width: number;
  height: number;
  selected: boolean;
  colors: { fill: string; stroke: string };
};

/** Keep label ~constant size on screen regardless of map zoom. */
function labelFontSize(scale: number): number {
  const safeScale = scale > 0 ? scale : 1;
  const unscaled = LABEL_BASE_FONT_SIZE / safeScale;
  return Math.min(
    Math.max(unscaled, LABEL_MIN_SCREEN_SIZE / safeScale),
    LABEL_MAX_SCREEN_SIZE / safeScale,
  );
}

export function AreasLayer({
  areas,
  calibration,
  selectedAreaId,
  scale,
  onSelectArea,
  onHoverTipChange,
}: AreasLayerProps) {
  const fontSize = labelFontSize(scale);
  const pad = 4 / (scale > 0 ? scale : 1);
  const colorIndexById = new Map(areas.map((area, index) => [area.id, index]));

  const rects: AreaRect[] = [];
  for (const area of areas) {
    const cells = area.cells.map((cell) => ({ row: cell.y, column: cell.x }));
    const rect = cellsBoundingRect(
      cells,
      calibration.pixelsPerMeter,
      calibration.gridOriginXPx,
      calibration.gridOriginYPx,
    );
    if (!rect) {
      continue;
    }
    const selected = area.id === selectedAreaId;
    const colorIndex = colorIndexById.get(area.id) ?? 0;
    rects.push({
      area,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      selected,
      colors: areaMapColors(colorIndex, selected),
    });
  }

  return (
    <Group>
      {rects.map((item) => (
        <Rect
          key={`fill-${item.area.id}`}
          x={item.x}
          y={item.y}
          width={item.width}
          height={item.height}
          fill={item.colors.fill}
          stroke={item.colors.stroke}
          strokeWidth={item.selected ? 2.5 / scale : 1.5 / scale}
          onClick={() => onSelectArea(item.area.id)}
          onTap={() => onSelectArea(item.area.id)}
          onMouseEnter={(event) => {
            const stage = event.target.getStage();
            const pointer = stage?.getPointerPosition();
            if (stage) {
              stage.container().style.cursor = 'pointer';
            }
            if (pointer) {
              onHoverTipChange({
                name: item.area.name,
                squareMeters: item.area.squareMeters,
                clientX: pointer.x,
                clientY: pointer.y,
              });
            }
          }}
          onMouseMove={(event) => {
            const pointer = event.target.getStage()?.getPointerPosition();
            if (!pointer) {
              return;
            }
            onHoverTipChange({
              name: item.area.name,
              squareMeters: item.area.squareMeters,
              clientX: pointer.x,
              clientY: pointer.y,
            });
          }}
          onMouseLeave={(event) => {
            const stage = event.target.getStage();
            if (stage) {
              stage.container().style.cursor = 'default';
            }
            onHoverTipChange(null);
          }}
        />
      ))}

      {rects.map((item) => (
        <Text
          key={`label-${item.area.id}`}
          x={item.x + pad}
          y={item.y + pad}
          width={Math.max(item.width - pad * 2, 1)}
          text={item.area.name}
          fontSize={fontSize}
          fontFamily="Arial, sans-serif"
          fontStyle="bold"
          fill="#0f1a2a"
          listening={false}
          wrap="none"
          ellipsis
        />
      ))}
    </Group>
  );
}

type SelectionPreviewProps = {
  cells: readonly { row: number; column: number }[];
  calibration: CalibrationGeometry;
  fill: string;
  stroke: string;
  scale: number;
};

export function SelectionPreview({
  cells,
  calibration,
  fill,
  stroke,
  scale,
}: SelectionPreviewProps) {
  const rect = cellsBoundingRect(
    cells,
    calibration.pixelsPerMeter,
    calibration.gridOriginXPx,
    calibration.gridOriginYPx,
  );
  if (!rect) {
    return null;
  }
  return (
    <Rect
      x={rect.x}
      y={rect.y}
      width={rect.width}
      height={rect.height}
      fill={fill}
      stroke={stroke}
      strokeWidth={1.5 / scale}
      listening={false}
      dash={[6 / scale, 4 / scale]}
    />
  );
}

type CalibrationOverlayProps = {
  points: readonly { x: number; y: number }[];
  scale: number;
  pointFill: string;
  lineStroke: string;
};

export function CalibrationOverlay({
  points,
  scale,
  pointFill,
  lineStroke,
}: CalibrationOverlayProps) {
  const radius = 5 / scale;
  return (
    <Group listening={false}>
      {points.length === 2 ? (
        <Line
          points={[points[0].x, points[0].y, points[1].x, points[1].y]}
          stroke={lineStroke}
          strokeWidth={2 / scale}
          dash={[8 / scale, 4 / scale]}
        />
      ) : null}
      {points.map((point, index) => (
        <Rect
          key={`${point.x}-${point.y}-${index}`}
          x={point.x - radius}
          y={point.y - radius}
          width={radius * 2}
          height={radius * 2}
          fill={pointFill}
          cornerRadius={radius}
        />
      ))}
    </Group>
  );
}
