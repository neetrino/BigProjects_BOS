import type { PartnerStage } from '@/lib/api/types';
import { partnerStageTone } from '@/lib/stage-colors';

export const PARTNER_OWNER = 'PARTNER_PARTICIPATION' as const;

export const ACTIVE_STAGES: PartnerStage[] = ['NEW', 'CONTACTED'];
export const TERMINAL_STAGES: PartnerStage[] = ['CONFIRMED', 'DECLINED'];

export { partnerStageTone as stageTone };

/** Stages a partner can move to from the current stage (UI affordances). */
export function allowedNextStages(stage: PartnerStage): PartnerStage[] {
  switch (stage) {
    case 'NEW':
      return ['CONTACTED', 'DECLINED'];
    case 'CONTACTED':
      return ['NEW', 'CONFIRMED', 'DECLINED'];
    case 'CONFIRMED':
      return ['NEW', 'CONTACTED'];
    case 'DECLINED':
      return ['NEW', 'CONTACTED'];
  }
}
