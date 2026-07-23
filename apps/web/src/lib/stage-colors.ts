import type { DealStage, PartnerStage } from '@/lib/api/types';
import type { StatusTone } from '@/components/ui/status-badge';

type StageColorTokens = {
  badgeClass: string;
  fillRgba: string;
  strokeRgba: string;
};

const MAP_FILL_ALPHA = 0.28;
const MAP_STROKE_ALPHA = 0.9;

function rgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const GREY = '#71717a';
const BLUE = '#2563eb';
const AMBER = '#d97706';
const GREEN = '#2e7d50';
const RED = '#e11d48';
const VIOLET = '#7c3aed';

export const DEAL_STAGE_COLORS: Record<DealStage, StageColorTokens> = {
  NEW: {
    badgeClass: 'bg-zinc-100 text-zinc-700',
    fillRgba: rgba(GREY, MAP_FILL_ALPHA),
    strokeRgba: rgba(GREY, MAP_STROKE_ALPHA),
  },
  CONTACTED: {
    badgeClass: 'bg-sky-50 text-sky-800',
    fillRgba: rgba(BLUE, MAP_FILL_ALPHA),
    strokeRgba: rgba(BLUE, MAP_STROKE_ALPHA),
  },
  NEGOTIATION: {
    badgeClass: 'bg-amber-50 text-amber-900',
    fillRgba: rgba(AMBER, MAP_FILL_ALPHA),
    strokeRgba: rgba(AMBER, MAP_STROKE_ALPHA),
  },
  WON: {
    badgeClass: 'bg-emerald-100 text-emerald-900',
    fillRgba: rgba(GREEN, MAP_FILL_ALPHA),
    strokeRgba: rgba(GREEN, MAP_STROKE_ALPHA),
  },
  LOST: {
    badgeClass: 'bg-rose-50 text-rose-800',
    fillRgba: rgba(RED, MAP_FILL_ALPHA),
    strokeRgba: rgba(RED, MAP_STROKE_ALPHA),
  },
};

export const PARTNER_STAGE_COLORS: Record<PartnerStage, StageColorTokens> = {
  NEW: {
    badgeClass: 'bg-zinc-100 text-zinc-700',
    fillRgba: rgba(GREY, MAP_FILL_ALPHA),
    strokeRgba: rgba(GREY, MAP_STROKE_ALPHA),
  },
  CONTACTED: {
    badgeClass: 'bg-sky-50 text-sky-800',
    fillRgba: rgba(BLUE, MAP_FILL_ALPHA),
    strokeRgba: rgba(BLUE, MAP_STROKE_ALPHA),
  },
  CONFIRMED: {
    badgeClass: 'bg-violet-50 text-violet-800',
    fillRgba: rgba(VIOLET, MAP_FILL_ALPHA),
    strokeRgba: rgba(VIOLET, MAP_STROKE_ALPHA),
  },
  DECLINED: {
    badgeClass: 'bg-rose-50 text-rose-800',
    fillRgba: rgba(RED, MAP_FILL_ALPHA),
    strokeRgba: rgba(RED, MAP_STROKE_ALPHA),
  },
};

export const FREE_AREA_MAP_COLORS = {
  fillRgba: 'rgba(46, 125, 80, 0.18)',
  strokeRgba: 'rgba(46, 125, 80, 0.75)',
} as const;

export const SELECTED_AREA_MAP_COLORS = {
  fillRgba: 'rgba(47, 111, 78, 0.35)',
  strokeRgba: '#2f6f4e',
} as const;

/** Tailwind badge classes for a builder deal stage. */
export function dealStageBadgeClass(stage: DealStage): string {
  return DEAL_STAGE_COLORS[stage].badgeClass;
}

/** Tailwind badge classes for a partner stage. */
export function partnerStageBadgeClass(stage: PartnerStage): string {
  return PARTNER_STAGE_COLORS[stage].badgeClass;
}

/** Konva fill/stroke colors for a builder deal stage. */
export function dealStageMapColors(stage: DealStage): { fill: string; stroke: string } {
  const tokens = DEAL_STAGE_COLORS[stage];
  return { fill: tokens.fillRgba, stroke: tokens.strokeRgba };
}

/** Konva fill/stroke colors for a partner stage. */
export function partnerStageMapColors(stage: PartnerStage): { fill: string; stroke: string } {
  const tokens = PARTNER_STAGE_COLORS[stage];
  return { fill: tokens.fillRgba, stroke: tokens.strokeRgba };
}

/** Maps a builder deal stage to a StatusBadge tone (shared palette). */
export function dealStageTone(stage: DealStage): StatusTone {
  switch (stage) {
    case 'NEW':
      return 'draft';
    case 'CONTACTED':
      return 'contacted';
    case 'NEGOTIATION':
      return 'negotiation';
    case 'WON':
      return 'won';
    case 'LOST':
      return 'lost';
  }
}

/** Maps a partner stage to a StatusBadge tone (shared palette). */
export function partnerStageTone(stage: PartnerStage): StatusTone {
  switch (stage) {
    case 'NEW':
      return 'draft';
    case 'CONTACTED':
      return 'contacted';
    case 'CONFIRMED':
      return 'confirmed';
    case 'DECLINED':
      return 'lost';
  }
}

/** StatusBadge tone classes sourced from the shared stage palette. */
export const STAGE_BADGE_TONE_CLASS: Partial<Record<StatusTone, string>> = {
  draft: DEAL_STAGE_COLORS.NEW.badgeClass,
  contacted: DEAL_STAGE_COLORS.CONTACTED.badgeClass,
  negotiation: DEAL_STAGE_COLORS.NEGOTIATION.badgeClass,
  won: DEAL_STAGE_COLORS.WON.badgeClass,
  lost: DEAL_STAGE_COLORS.LOST.badgeClass,
  confirmed: PARTNER_STAGE_COLORS.CONFIRMED.badgeClass,
};
