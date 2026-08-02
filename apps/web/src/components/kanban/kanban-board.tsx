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
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { KanbanScrollButtons } from '@/components/kanban/kanban-scroll-buttons';
import type { KanbanColumnDef, KanbanColumnTone } from '@/components/kanban/types';

const CLICK_MAX_DISTANCE_PX = 6;
/** Terminal group uses `p-2.5` (0.625rem); nested column radius stays concentric. */
const TERMINAL_COLUMN_RADIUS_CLASS = 'rounded-[calc(var(--radius-panel)-0.625rem)]';

const TONE_HEADER_CLASS: Record<KanbanColumnTone, string> = {
  default: '',
  positive: 'text-[var(--color-success)]',
  negative: 'text-[var(--color-danger)]',
};

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
          className="no-scrollbar absolute inset-0 flex gap-4 overflow-x-auto pb-1"
        >
          <div className="flex min-h-0 min-w-max gap-3">
            {activeColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                items={grouped.get(column.id) ?? []}
                terminal={false}
                onOpen={onOpen}
                renderCard={renderCard}
              />
            ))}
          </div>

          <div
            aria-hidden
            className="mx-1 w-px shrink-0 self-stretch bg-gradient-to-b from-transparent via-[var(--color-border)] to-transparent"
          />

          <div className="flex min-h-0 min-w-max gap-3 rounded-[var(--radius-panel)] border border-white/70 bg-[linear-gradient(180deg,rgb(255_255_255/0.72),rgb(247_243_238/0.55))] p-2.5 outline outline-1 outline-[var(--color-border)]">
            {terminalColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                items={grouped.get(column.id) ?? []}
                terminal
                onOpen={onOpen}
                renderCard={renderCard}
              />
            ))}
          </div>
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

type KanbanColumnProps<TItem extends { id: string }, TStage extends string> = {
  column: KanbanColumnDef<TStage>;
  items: TItem[];
  terminal: boolean;
  onOpen: (id: string) => void;
  renderCard: (item: TItem, options: { isDragging: boolean }) => ReactNode;
};

function KanbanColumn<TItem extends { id: string }, TStage extends string>({
  column,
  items,
  terminal,
  onOpen,
  renderCard,
}: KanbanColumnProps<TItem, TStage>) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const tone = column.tone ?? 'default';

  return (
    <section
      ref={setNodeRef}
      className={clsx(
        'relative flex w-72 shrink-0 flex-col overflow-hidden border transition-all duration-200',
        terminal
          ? clsx(
              TERMINAL_COLUMN_RADIUS_CLASS,
              'border-dashed border-[var(--color-border-strong)] bg-[#ffffff]',
            )
          : 'rounded-[var(--radius-panel)] border-white/80 bg-[#ffffff] outline outline-1 outline-[var(--color-border)]',
      )}
    >
      {isOver ? (
        <div
          aria-hidden
          className={clsx(
            'pointer-events-none absolute inset-0 z-20 ring-2 ring-inset ring-[var(--color-accent)]/50',
            terminal ? TERMINAL_COLUMN_RADIUS_CLASS : 'rounded-[var(--radius-panel)]',
          )}
        />
      ) : null}
      <header
        className={clsx(
          'flex items-center justify-between gap-2 border-b px-3.5 py-3',
          terminal
            ? 'border-[var(--color-border)]/70 bg-[var(--color-brass-soft)]/50'
            : 'border-[var(--color-border)] bg-[var(--color-bg-warm)]/60',
          TONE_HEADER_CLASS[tone],
        )}
      >
        <h3 className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)]">
          {column.title}
        </h3>
        <span className="rounded-lg bg-white px-2 py-0.5 text-[11.5px] font-semibold text-[var(--color-muted)]">
          {items.length}
        </span>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-2.5">
        {items.map((item) => (
          <DraggableKanbanCard key={item.id} item={item} onOpen={onOpen} renderCard={renderCard} />
        ))}
      </div>
    </section>
  );
}

type DraggableKanbanCardProps<TItem extends { id: string }> = {
  item: TItem;
  onOpen: (id: string) => void;
  renderCard: (item: TItem, options: { isDragging: boolean }) => ReactNode;
};

function DraggableKanbanCard<TItem extends { id: string }>({
  item,
  onOpen,
  renderCard,
}: DraggableKanbanCardProps<TItem>) {
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
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
        onOpen(item.id);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(item.id);
        }
      }}
    >
      {renderCard(item, { isDragging })}
    </div>
  );
}
