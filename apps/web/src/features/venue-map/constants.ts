export const MAX_PLAN_IMAGE_BYTES = 25 * 1024 * 1024;

export const ACCEPTED_PLAN_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

/** Match Event cycle SelectInput height (`py-2.5` field control). */
export const TOOLBAR_CONTROL_CLASS = 'h-auto py-2.5';

export { FREE_AREA_MAP_COLORS, SELECTED_AREA_MAP_COLORS } from '@/lib/stage-colors';

export const BOOTH_NAVY = '#192643';
export const BOOTH_SEA = '#027691';
export const BOOTH_OCCUPIED_FILL = '#c4c8cd';
export const BOOTH_OPEN_FILL = '#d7dadd';
export const BOOTH_HOVER_FILL = '#9cc0ca';
export const BOOTH_SELECTED_FILL = '#027691';
export const BOOTH_SQM_MUTED = '#8b95a8';
export const BOOTH_SQM_ON_SELECTED = '#7fd0e3';
export const BOOTH_LABEL_ON_SELECTED = '#ffffff';

export const SELECTION_FILL = 'rgba(2, 118, 145, 0.28)';
export const SELECTION_STROKE = '#027691';
export const CALIBRATION_POINT_FILL = '#9a7b4f';
export const CALIBRATION_LINE_STROKE = '#9a7b4f';

export type BoothVisual = {
  fill: string;
  stroke: string;
  label: string;
  sqm: string;
};

export function boothVisual(occupied: boolean, selected: boolean, hovered: boolean): BoothVisual {
  if (selected) {
    return {
      fill: BOOTH_SELECTED_FILL,
      stroke: BOOTH_NAVY,
      label: BOOTH_LABEL_ON_SELECTED,
      sqm: BOOTH_SQM_ON_SELECTED,
    };
  }
  if (hovered) {
    return {
      fill: BOOTH_HOVER_FILL,
      stroke: BOOTH_NAVY,
      label: BOOTH_NAVY,
      sqm: BOOTH_SEA,
    };
  }
  if (occupied) {
    return {
      fill: BOOTH_OCCUPIED_FILL,
      stroke: BOOTH_NAVY,
      label: BOOTH_NAVY,
      sqm: BOOTH_SEA,
    };
  }
  return {
    fill: BOOTH_OPEN_FILL,
    stroke: BOOTH_NAVY,
    label: BOOTH_SQM_MUTED,
    sqm: BOOTH_SQM_MUTED,
  };
}

export const LABEL_BASE_FONT_SIZE = 12;
export const LABEL_MIN_SCREEN_SIZE = 9;
export const LABEL_MAX_SCREEN_SIZE = 16;

/** Distinct area fills so neighboring blocks are easy to tell apart. */
export const AREA_COLOR_PALETTE = [
  { fill: 'rgba(40, 57, 148, 0.28)', stroke: 'rgba(40, 57, 148, 0.95)' },
  { fill: 'rgba(2, 132, 199, 0.28)', stroke: 'rgba(2, 132, 199, 0.95)' },
  { fill: 'rgba(13, 148, 136, 0.28)', stroke: 'rgba(13, 148, 136, 0.95)' },
  { fill: 'rgba(217, 119, 6, 0.28)', stroke: 'rgba(217, 119, 6, 0.95)' },
  { fill: 'rgba(154, 123, 79, 0.30)', stroke: 'rgba(154, 123, 79, 0.95)' },
  { fill: 'rgba(225, 29, 72, 0.26)', stroke: 'rgba(225, 29, 72, 0.95)' },
  { fill: 'rgba(124, 58, 237, 0.28)', stroke: 'rgba(124, 58, 237, 0.95)' },
  { fill: 'rgba(5, 150, 105, 0.28)', stroke: 'rgba(5, 150, 105, 0.95)' },
  { fill: 'rgba(234, 88, 12, 0.28)', stroke: 'rgba(234, 88, 12, 0.95)' },
  { fill: 'rgba(8, 145, 178, 0.28)', stroke: 'rgba(8, 145, 178, 0.95)' },
  { fill: 'rgba(190, 24, 93, 0.26)', stroke: 'rgba(190, 24, 93, 0.95)' },
  { fill: 'rgba(67, 56, 202, 0.28)', stroke: 'rgba(67, 56, 202, 0.95)' },
] as const;

/** Spreads hues evenly so generated colors rarely look alike. */
const GOLDEN_ANGLE_DEG = 137.508;
const GENERATED_SATURATION_PCT = 62;
const GENERATED_LIGHTNESS_PCT = 42;
const AREA_FILL_ALPHA = 0.28;
const AREA_STROKE_ALPHA = 0.95;
const SELECTED_AREA_FILL_ALPHA = 0.42;

function generatedAreaColors(index: number, fillAlpha: number): { fill: string; stroke: string } {
  const hue = Math.round((index * GOLDEN_ANGLE_DEG) % 360);
  const base = `${hue} ${GENERATED_SATURATION_PCT}% ${GENERATED_LIGHTNESS_PCT}%`;
  return {
    fill: `hsla(${base} / ${fillAlpha})`,
    stroke: `hsla(${base} / ${AREA_STROKE_ALPHA})`,
  };
}

function withFillAlpha(fill: string, alpha: number): string {
  if (fill.includes(' / ')) {
    return fill.replace(/\/ [\d.]+\)$/, `/ ${alpha})`);
  }
  return fill.replace(/[\d.]+\)$/, `${alpha})`);
}

/**
 * Color for the N-th area (0-based list/creation order).
 * Uses the fixed palette first, then generates a new distinct hue each time.
 */
export function areaMapColors(index: number, selected = false): { fill: string; stroke: string } {
  const safeIndex = Math.max(0, Math.floor(index));
  const fillAlpha = selected ? SELECTED_AREA_FILL_ALPHA : AREA_FILL_ALPHA;

  if (safeIndex < AREA_COLOR_PALETTE.length) {
    const base = AREA_COLOR_PALETTE[safeIndex];
    return {
      fill: withFillAlpha(base.fill, fillAlpha),
      stroke: base.stroke,
    };
  }

  return generatedAreaColors(safeIndex, fillAlpha);
}
