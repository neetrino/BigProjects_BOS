import type { DealStage } from '@/lib/api/types';
import type { StatusTone } from '@/components/ui/status-badge';
import type { BoardViewMode } from '@/components/kanban';

export type { BoardViewMode };

export const BUILDER_DEAL_OWNER = 'BUILDER_DEAL' as const;

export const ACTIVE_STAGES: DealStage[] = ['NEW', 'CONTACTED', 'NEGOTIATION'];
export const TERMINAL_STAGES: DealStage[] = ['WON', 'LOST'];
export const ALL_STAGES: DealStage[] = [...ACTIVE_STAGES, ...TERMINAL_STAGES];

export function stageTone(stage: DealStage): StatusTone {
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

/** Stages a deal can move to from the current stage (UI affordances). */
export function allowedNextStages(stage: DealStage): DealStage[] {
  switch (stage) {
    case 'NEW':
      return ['CONTACTED', 'LOST'];
    case 'CONTACTED':
      return ['NEW', 'NEGOTIATION', 'LOST'];
    case 'NEGOTIATION':
      return ['CONTACTED', 'WON', 'LOST'];
    case 'LOST':
      return ['NEW', 'CONTACTED', 'NEGOTIATION'];
    case 'WON':
      return ['NEGOTIATION', 'LOST'];
  }
}

export function isTerminalStage(stage: DealStage): boolean {
  return stage === 'WON' || stage === 'LOST';
}
