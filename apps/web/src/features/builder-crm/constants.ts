import type { DealStage } from '@/lib/api/types';
import type { BoardViewMode } from '@/components/kanban';
import { dealStageTone } from '@/lib/stage-colors';

export type { BoardViewMode };

export const BUILDER_DEAL_OWNER = 'BUILDER_DEAL' as const;

export const ACTIVE_STAGES: DealStage[] = ['NEW', 'CONTACTED', 'NEGOTIATION'];
export const TERMINAL_STAGES: DealStage[] = ['WON', 'LOST'];
export const ALL_STAGES: DealStage[] = [...ACTIVE_STAGES, ...TERMINAL_STAGES];
/** Sheet stage switcher order: Lost before Won. */
export const STAGE_SWITCHER_ORDER: DealStage[] = ['NEW', 'CONTACTED', 'NEGOTIATION', 'LOST', 'WON'];

export { dealStageTone as stageTone };

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
