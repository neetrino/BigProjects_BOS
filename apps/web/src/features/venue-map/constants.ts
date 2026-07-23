export const MAX_PLAN_IMAGE_BYTES = 25 * 1024 * 1024;

export const ACCEPTED_PLAN_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;

export type AreaVisualState = 'free' | 'builder' | 'partner' | 'selected';

export const AREA_FILL: Record<AreaVisualState, string> = {
  free: 'rgba(46, 125, 80, 0.18)',
  builder: 'rgba(37, 99, 235, 0.28)',
  partner: 'rgba(124, 58, 237, 0.28)',
  selected: 'rgba(47, 111, 78, 0.35)',
};

export const AREA_STROKE: Record<AreaVisualState, string> = {
  free: 'rgba(46, 125, 80, 0.75)',
  builder: 'rgba(37, 99, 235, 0.9)',
  partner: 'rgba(124, 58, 237, 0.9)',
  selected: '#2f6f4e',
};

export const SELECTION_FILL = 'rgba(47, 111, 78, 0.28)';
export const SELECTION_STROKE = '#2f6f4e';
export const CALIBRATION_POINT_FILL = '#c2410c';
export const CALIBRATION_LINE_STROKE = '#c2410c';

export const LABEL_BASE_FONT_SIZE = 12;
export const LABEL_MIN_SCREEN_SIZE = 9;
export const LABEL_MAX_SCREEN_SIZE = 16;
