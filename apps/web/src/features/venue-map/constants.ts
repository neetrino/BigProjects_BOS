export const MAX_PLAN_IMAGE_BYTES = 25 * 1024 * 1024;

export const ACCEPTED_PLAN_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

/** Match Event cycle SelectInput height (`py-2.5` field control). */
export const TOOLBAR_CONTROL_CLASS = 'h-auto py-2.5';

export { FREE_AREA_MAP_COLORS, SELECTED_AREA_MAP_COLORS } from '@/lib/stage-colors';

export const SELECTION_FILL = 'rgba(26, 107, 114, 0.28)';
export const SELECTION_STROKE = '#1a6b72';
export const CALIBRATION_POINT_FILL = '#9a7b4f';
export const CALIBRATION_LINE_STROKE = '#9a7b4f';

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

function generatedAreaColors(
  index: number,
  fillAlpha: number,
): { fill: string; stroke: string } {
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
export function areaMapColors(
  index: number,
  selected = false,
): { fill: string; stroke: string } {
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
