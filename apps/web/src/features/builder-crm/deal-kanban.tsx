'use client';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { clsx } from 'clsx';
import { useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { DealListItem, DealStage } from '@/lib/api/types';
import { DealCard } from '@/features/builder-crm/deal-card';
import { ACTIVE_STAGES, TERMINAL_STAGES, isTerminalStage } from '@/features/builder-crm/constants';

const CLICK_MAX_DISTANCE_PX = 6;

type DealKanbanProps = {
  deals: DealListItem[];
  onOpen: (dealId: string) => void;
  onStageChange: (dealId: string, stage: DealStage) => Promise<void>;
};

function groupByStage(deals: DealListItem[]): Record<DealStage, DealListItem[]> {
  const groups: Record<DealStage, DealListItem[]> = {
    NEW: [],
    CONTACTED: [],
    NEGOTIATION: [],
    WON: [],
    LOST: [],
  };
  for (const deal of deals) {
    groups[deal.stage].push(deal);
  }
  return groups;
}

export function DealKanban({ deals, onOpen, onStageChange }: DealKanbanProps) {
  const t = useTranslations('builderSales');
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: CLICK_MAX_DISTANCE_PX },
    }),
  );

  const grouped = useMemo(() => groupByStage(deals), [deals]);
  const activeDeal = activeId ? (deals.find((deal) => deal.id === activeId) ?? null) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const dealId = String(event.active.id);
    const overId = event.over?.id;
    if (!overId) {
      return;
    }

    const targetStage = String(overId) as DealStage;
    if (!ACTIVE_STAGES.includes(targetStage) && !TERMINAL_STAGES.includes(targetStage)) {
      return;
    }

    const deal = deals.find((item) => item.id === dealId);
    if (!deal || deal.stage === targetStage) {
      return;
    }

    await onStageChange(dealId, targetStage);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={(event) => {
        void handleDragEnd(event);
      }}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-1">
        <div className="flex min-h-0 min-w-max gap-3">
          {ACTIVE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              title={t(`stages.${stage}`)}
              deals={grouped[stage]}
              onOpen={onOpen}
              terminal={false}
            />
          ))}
        </div>

        <div aria-hidden className="mx-1 w-px shrink-0 self-stretch bg-[var(--color-border)]" />

        <div className="flex min-h-0 min-w-max gap-3 rounded-xl bg-[var(--color-bg)]/80 p-2">
          {TERMINAL_STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              title={t(`stages.${stage}`)}
              deals={grouped[stage]}
              onOpen={onOpen}
              terminal
            />
          ))}
        </div>
      </div>

      <DragOverlay>{activeDeal ? <DealCard deal={activeDeal} isDragging /> : null}</DragOverlay>
    </DndContext>
  );
}

type KanbanColumnProps = {
  stage: DealStage;
  title: string;
  deals: DealListItem[];
  onOpen: (dealId: string) => void;
  terminal: boolean;
};

function KanbanColumn({ stage, title, deals, onOpen, terminal }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <section
      ref={setNodeRef}
      className={clsx(
        'flex w-72 shrink-0 flex-col rounded-xl border',
        terminal
          ? 'border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/70'
          : 'border-[var(--color-border)] bg-[var(--color-bg)]/40',
        isOver && 'ring-2 ring-[var(--color-accent)]/40',
      )}
    >
      <header
        className={clsx(
          'flex items-center justify-between gap-2 border-b px-3 py-2',
          terminal
            ? 'border-[var(--color-border)]/70 bg-[var(--color-bg)]'
            : 'border-[var(--color-border)]',
          isTerminalStage(stage) && stage === 'WON' && 'text-emerald-900',
          isTerminalStage(stage) && stage === 'LOST' && 'text-rose-900',
        )}
      >
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          {title}
        </h3>
        <span className="rounded-full bg-[var(--color-surface)] px-2 py-0.5 text-[11px] text-[var(--color-muted)]">
          {deals.length}
        </span>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
        {deals.map((deal) => (
          <DraggableDealCard key={deal.id} deal={deal} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

type DraggableDealCardProps = {
  deal: DealListItem;
  onOpen: (dealId: string) => void;
};

function DraggableDealCard({ deal, onOpen }: DraggableDealCardProps) {
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: deal.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx('cursor-grab active:cursor-grabbing', isDragging && 'opacity-40')}
      {...listeners}
      {...attributes}
      onPointerDown={(event) => {
        pointerStart.current = { x: event.clientX, y: event.clientY };
        listeners?.onPointerDown?.(event);
      }}
      onClick={(event) => {
        const start = pointerStart.current;
        if (
          start &&
          Math.hypot(event.clientX - start.x, event.clientY - start.y) > CLICK_MAX_DISTANCE_PX
        ) {
          return;
        }
        onOpen(deal.id);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(deal.id);
        }
      }}
    >
      <DealCard deal={deal} isDragging={isDragging} />
    </div>
  );
}
