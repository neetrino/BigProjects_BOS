'use client';

import { Group, Line, Rect, Text } from 'react-konva';
import type { VenueSpaceArea } from '@/lib/api/venue-map';
import {
  dealStageMapColors,
  FREE_AREA_MAP_COLORS,
  partnerStageMapColors,
  SELECTED_AREA_MAP_COLORS,
} from '@/lib/stage-colors';
import {
  LABEL_BASE_FONT_SIZE,
  LABEL_MAX_SCREEN_SIZE,
  LABEL_MIN_SCREEN_SIZE,
} from '../constants';
import { cellsBoundingRect } from '../domain/cell-selection';
import type { CalibrationGeometry } from '../domain/grid-transform';

type AreasLayerProps = {
  areas: readonly VenueSpaceArea[];
  calibration: CalibrationGeometry;
  selectedAreaId: string | null;
  scale: number;
  onSelectArea: (areaId: string) => void;
};

function resolveAreaColors(
  area: VenueSpaceArea,
  selected: boolean,
): { fill: string; stroke: string } {
  if (selected) {
    return {
      fill: SELECTED_AREA_MAP_COLORS.fillRgba,
      stroke: SELECTED_AREA_MAP_COLORS.strokeRgba,
    };
  }

  const allocation = area.allocation;
  if (!allocation) {
    return {
      fill: FREE_AREA_MAP_COLORS.fillRgba,
      stroke: FREE_AREA_MAP_COLORS.strokeRgba,
    };
  }

  if (allocation.kind === 'BUILDER' && allocation.deal) {
    return dealStageMapColors(allocation.deal.stage);
  }

  if (allocation.kind === 'PARTNER' && allocation.partner) {
    return partnerStageMapColors(allocation.partner.stage);
  }

  return {
    fill: FREE_AREA_MAP_COLORS.fillRgba,
    stroke: FREE_AREA_MAP_COLORS.strokeRgba,
  };
}

function labelFontSize(scale: number): number {
  const screen = LABEL_BASE_FONT_SIZE;
  const unscaled = screen / scale;
  return Math.min(Math.max(unscaled, LABEL_MIN_SCREEN_SIZE / scale), LABEL_MAX_SCREEN_SIZE / scale);
}

export function AreasLayer({
  areas,
  calibration,
  selectedAreaId,
  scale,
  onSelectArea,
}: AreasLayerProps) {
  const fontSize = labelFontSize(scale);

  return (
    <Group>
      {areas.map((area) => {
        const cells = area.cells.map((cell) => ({ row: cell.y, column: cell.x }));
        const rect = cellsBoundingRect(
          cells,
          calibration.pixelsPerMeter,
          calibration.gridOriginXPx,
          calibration.gridOriginYPx,
        );
        if (!rect) {
          return null;
        }
        const selected = area.id === selectedAreaId;
        const colors = resolveAreaColors(area, selected);
        const org = area.allocation?.organizationName;
        const label = org
          ? `${area.name} · ${area.squareMeters} m² · ${org}`
          : `${area.name} · ${area.squareMeters} m²`;

        return (
          <Group
            key={area.id}
            onClick={() => onSelectArea(area.id)}
            onTap={() => onSelectArea(area.id)}
          >
            <Rect
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth={selected ? 2.5 / scale : 1.5 / scale}
            />
            <Text
              x={rect.x + 4 / scale}
              y={rect.y + 4 / scale}
              width={Math.max(rect.width - 8 / scale, 1)}
              text={label}
              fontSize={fontSize}
              fill="#1a2420"
              listening={false}
              wrap="none"
              ellipsis
            />
          </Group>
        );
      })}
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
