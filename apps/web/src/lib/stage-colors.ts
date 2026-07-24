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

const SLATE = '#64748b';
const OCEAN = '#0284c7';
const AMBER = '#d97706';
const TEAL = '#1a6b72';
const ROSE = '#e11d48';
const BRASS = '#9a7b4f';

export const DEAL_STAGE_COLORS: Record<DealStage, StageColorTokens> = {
  NEW: {
    badgeClass: 'bg-slate-100 text-slate-700',
    fillRgba: rgba(SLATE, MAP_FILL_ALPHA),
    strokeRgba: rgba(SLATE, MAP_STROKE_ALPHA),
  },
  CONTACTED: {
    badgeClass: 'bg-sky-50 text-sky-800',
    fillRgba: rgba(OCEAN, MAP_FILL_ALPHA),
    strokeRgba: rgba(OCEAN, MAP_STROKE_ALPHA),
  },
  NEGOTIATION: {
    badgeClass: 'bg-amber-50 text-amber-900',
    fillRgba: rgba(AMBER, MAP_FILL_ALPHA),
    strokeRgba: rgba(AMBER, MAP_STROKE_ALPHA),
  },
  WON: {
    badgeClass: 'bg-teal-50 text-teal-900',
    fillRgba: rgba(TEAL, MAP_FILL_ALPHA),
    strokeRgba: rgba(TEAL, MAP_STROKE_ALPHA),
  },
  LOST: {
    badgeClass: 'bg-rose-50 text-rose-800',
    fillRgba: rgba(ROSE, MAP_FILL_ALPHA),
    strokeRgba: rgba(ROSE, MAP_STROKE_ALPHA),
  },
};

export const PARTNER_STAGE_COLORS: Record<PartnerStage, StageColorTokens> = {
  NEW: {
    badgeClass: 'bg-slate-100 text-slate-700',
    fillRgba: rgba(SLATE, MAP_FILL_ALPHA),
    strokeRgba: rgba(SLATE, MAP_STROKE_ALPHA),
  },
  CONTACTED: {
    badgeClass: 'bg-sky-50 text-sky-800',
    fillRgba: rgba(OCEAN, MAP_FILL_ALPHA),
    strokeRgba: rgba(OCEAN, MAP_STROKE_ALPHA),
  },
  CONFIRMED: {
    badgeClass: 'bg-[var(--color-brass-soft)] text-[#7a6239]',
    fillRgba: rgba(BRASS, MAP_FILL_ALPHA),
    strokeRgba: rgba(BRASS, MAP_STROKE_ALPHA),
  },
  DECLINED: {
    badgeClass: 'bg-rose-50 text-rose-800',
    fillRgba: rgba(ROSE, MAP_FILL_ALPHA),
    strokeRgba: rgba(ROSE, MAP_STROKE_ALPHA),
  },
};

export const FREE_AREA_MAP_COLORS = {
  fillRgba: 'rgba(26, 107, 114, 0.18)',
  strokeRgba: 'rgba(26, 107, 114, 0.75)',
} as const;

export const SELECTED_AREA_MAP_COLORS = {
  fillRgba: 'rgba(26, 107, 114, 0.35)',
  strokeRgba: '#1a6b72',
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
