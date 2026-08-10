'use client';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { KanbanColumn } from '@/components/kanban/kanban-column';
import { KanbanScrollButtons } from '@/components/kanban/kanban-scroll-buttons';
import type { KanbanColumnDef } from '@/components/kanban/types';

const CLICK_MAX_DISTANCE_PX = 6;

type KanbanBoardProps<TItem extends { id: string }, TStage extends string> = {
  items: TItem[];
  getStage: (item: TItem) => TStage;
  activeColumns: readonly KanbanColumnDef<TStage>[];
  terminalColumns: readonly KanbanColumnDef<TStage>[];
  onOpen: (id: string) => void;
  onStageChange: (id: string, stage: TStage) => void | Promise<void>;
  renderCard: (item: TItem, options: { isDragging: boolean }) => ReactNode;
};

export function KanbanBoard<TItem extends { id: string }, TStage extends string>({
  items,
  getStage,
  activeColumns,
  terminalColumns,
  onOpen,
  onStageChange,
  renderCard,
}: KanbanBoardProps<TItem, TStage>) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: CLICK_MAX_DISTANCE_PX },
    }),
  );

  const stageIds = useMemo(() => {
    const ids = new Set<string>();
    for (const column of activeColumns) {
      ids.add(column.id);
    }
    for (const column of terminalColumns) {
      ids.add(column.id);
    }
    return ids;
  }, [activeColumns, terminalColumns]);

  const grouped = useMemo(() => {
    const map = new Map<TStage, TItem[]>();
    for (const column of [...activeColumns, ...terminalColumns]) {
      map.set(column.id, []);
    }
    for (const item of items) {
      const stage = getStage(item);
      const bucket = map.get(stage);
      if (bucket) {
        bucket.push(item);
      }
    }
    return map;
  }, [activeColumns, getStage, items, terminalColumns]);

  const activeItem = activeId ? (items.find((item) => item.id === activeId) ?? null) : null;
  const hasTerminalColumns = terminalColumns.length > 0;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const itemId = String(event.active.id);
    const overId = event.over?.id;
    if (!overId) {
      return;
    }

    const targetStage = String(overId) as TStage;
    if (!stageIds.has(targetStage)) {
      return;
    }

    const item = items.find((entry) => entry.id === itemId);
    if (!item || getStage(item) === targetStage) {
      return;
    }

    await onStageChange(itemId, targetStage);
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
      <div className="relative min-h-0 flex-1">
        <KanbanScrollButtons
          scrollerRef={scrollerRef}
          layoutKey={`${activeColumns.length}:${terminalColumns.length}:${items.length}`}
        />

        <div
          ref={scrollerRef}
          className="no-scrollbar absolute inset-0 flex items-stretch gap-3.5 overflow-x-auto pb-1"
        >
          {activeColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              items={grouped.get(column.id) ?? []}
              onOpen={onOpen}
              renderCard={renderCard}
            />
          ))}

          {hasTerminalColumns ? (
            <div
              aria-hidden
              className="mx-0.5 w-px shrink-0 self-stretch bg-gradient-to-b from-transparent via-[var(--color-border-strong)] to-transparent opacity-70"
            />
          ) : null}

          {terminalColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              items={grouped.get(column.id) ?? []}
              onOpen={onOpen}
              renderCard={renderCard}
            />
          ))}
        </div>
      </div>

      {typeof document !== 'undefined'
        ? createPortal(
            <DragOverlay dropAnimation={null} style={{ width: 'auto', height: 'auto' }}>
              {activeItem ? (
                <div className="desktop-drag-overlay-card cursor-grabbing">
                  {renderCard(activeItem, { isDragging: true })}
                </div>
              ) : null}
            </DragOverlay>,
            document.body,
          )
        : null}
    </DndContext>
  );
}
