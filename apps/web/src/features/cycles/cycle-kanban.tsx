'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { EventCycle, EventCycleStatus } from '@/lib/api/types';
import { KanbanBoard, type KanbanColumnDef } from '@/components/kanban';
import {
  TERMINAL_STATUSES,
  WORKFLOW_STATUSES,
  terminalColumnTone,
} from '@/features/cycles/constants';
import { CycleCard } from '@/features/cycles/cycle-card';

type CycleKanbanProps = {
  cycles: EventCycle[];
  onOpen: (cycleId: string) => void;
  onStatusChange: (cycleId: string, status: EventCycleStatus) => void;
};

export function CycleKanban({ cycles, onOpen, onStatusChange }: CycleKanbanProps) {
  const t = useTranslations('cycles');

  const activeColumns = useMemo<KanbanColumnDef<EventCycleStatus>[]>(
    () =>
      WORKFLOW_STATUSES.map((status) => ({
        id: status,
        title: t(`status.${status}`),
        tone: status === 'ACTIVE' ? 'positive' : 'default',
      })),
    [t],
  );

  const terminalColumns = useMemo<KanbanColumnDef<EventCycleStatus>[]>(
    () =>
      TERMINAL_STATUSES.map((status) => ({
        id: status,
        title: t(`status.${status}`),
        tone: terminalColumnTone(status),
      })),
    [t],
  );

  const getStage = useCallback((cycle: EventCycle) => cycle.status, []);

  const renderCard = useCallback(
    (cycle: EventCycle, options: { isDragging: boolean }) => (
      <CycleCard cycle={cycle} isDragging={options.isDragging} />
    ),
    [],
  );

  return (
    <KanbanBoard
      items={cycles}
      getStage={getStage}
      activeColumns={activeColumns}
      terminalColumns={terminalColumns}
      onOpen={onOpen}
      onStageChange={onStatusChange}
      renderCard={renderCard}
    />
  );
}
