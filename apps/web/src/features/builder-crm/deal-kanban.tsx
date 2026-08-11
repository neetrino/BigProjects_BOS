'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { DealListItem, DealStage } from '@/lib/api/types';
import { KanbanBoard, type KanbanColumnDef } from '@/components/kanban';
import { DealCard } from '@/features/builder-crm/deal-card';
import { ACTIVE_STAGES, TERMINAL_STAGES } from '@/features/builder-crm/constants';

type DealKanbanProps = {
  deals: DealListItem[];
  onOpen: (dealId: string) => void;
  onStageChange: (dealId: string, stage: DealStage) => Promise<void>;
};

export function DealKanban({ deals, onOpen, onStageChange }: DealKanbanProps) {
  const t = useTranslations('builderSales');

  const activeColumns = useMemo<KanbanColumnDef<DealStage>[]>(
    () => ACTIVE_STAGES.map((stage) => ({ id: stage, title: t(`stages.${stage}`) })),
    [t],
  );

  const terminalColumns = useMemo<KanbanColumnDef<DealStage>[]>(
    () =>
      TERMINAL_STAGES.map((stage) => ({
        id: stage,
        title: t(`stages.${stage}`),
        tone: stage === 'WON' ? 'positive' : 'negative',
      })),
    [t],
  );

  const getStage = useCallback((deal: DealListItem) => deal.stage, []);

  const renderCard = useCallback(
    (deal: DealListItem, options: { isDragging: boolean; enterIndex: number }) => (
      <DealCard deal={deal} isDragging={options.isDragging} enterIndex={options.enterIndex} />
    ),
    [],
  );

  return (
    <KanbanBoard
      items={deals}
      getStage={getStage}
      activeColumns={activeColumns}
      terminalColumns={terminalColumns}
      onOpen={onOpen}
      onStageChange={onStageChange}
      renderCard={renderCard}
    />
  );
}
