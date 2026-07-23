'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { PartnerListItem, PartnerStage } from '@/lib/api/types';
import { KanbanBoard, type KanbanColumnDef } from '@/components/kanban';
import { PartnerCard } from '@/features/partners/partner-card';
import { ACTIVE_STAGES, TERMINAL_STAGES } from '@/features/partners/constants';

type PartnerKanbanProps = {
  partners: PartnerListItem[];
  onOpen: (partnerId: string) => void;
  onStageChange: (partnerId: string, stage: PartnerStage) => Promise<void>;
};

export function PartnerKanban({ partners, onOpen, onStageChange }: PartnerKanbanProps) {
  const t = useTranslations('partners');

  const activeColumns = useMemo<KanbanColumnDef<PartnerStage>[]>(
    () => ACTIVE_STAGES.map((stage) => ({ id: stage, title: t(`stages.${stage}`) })),
    [t],
  );

  const terminalColumns = useMemo<KanbanColumnDef<PartnerStage>[]>(
    () =>
      TERMINAL_STAGES.map((stage) => ({
        id: stage,
        title: t(`stages.${stage}`),
        tone: stage === 'CONFIRMED' ? 'positive' : 'negative',
      })),
    [t],
  );

  const getStage = useCallback((partner: PartnerListItem) => partner.stage, []);

  const renderCard = useCallback(
    (partner: PartnerListItem, options: { isDragging: boolean }) => (
      <PartnerCard partner={partner} isDragging={options.isDragging} />
    ),
    [],
  );

  return (
    <KanbanBoard
      items={partners}
      getStage={getStage}
      activeColumns={activeColumns}
      terminalColumns={terminalColumns}
      onOpen={onOpen}
      onStageChange={onStageChange}
      renderCard={renderCard}
    />
  );
}
