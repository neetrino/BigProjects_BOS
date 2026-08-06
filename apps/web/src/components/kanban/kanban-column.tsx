'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { useRef, type ReactNode } from 'react';
import type { KanbanColumnDef, KanbanColumnTone } from '@/components/kanban/types';

const CLICK_MAX_DISTANCE_PX = 6;
/** Terminal group uses `p-2.5` (0.625rem); nested column radius stays concentric. */
const TERMINAL_COLUMN_RADIUS_CLASS = 'rounded-[calc(var(--radius-panel)-0.625rem)]';

const TONE_DOT_CLASS: Record<KanbanColumnTone, string> = {
  default: 'bg-[var(--color-accent)]',
  positive: 'bg-[var(--color-success)]',
  negative: 'bg-[var(--color-muted)]',
};

const TONE_ACCENT_CLASS: Record<KanbanColumnTone, string> = {
  default: 'from-[var(--color-accent)] to-[var(--color-accent-mid)]',
  positive: 'from-[var(--color-success)] to-[var(--color-success)]',
  negative: 'from-[var(--color-muted)] to-[var(--color-border-strong)]',
};

const TONE_HEADER_CLASS: Record<KanbanColumnTone, string> = {
  default: 'text-[var(--color-fg)]',
  positive: 'text-[var(--color-success)]',
  negative: 'text-[var(--color-muted)]',
};

const TONE_COUNT_CLASS: Record<KanbanColumnTone, string> = {
  default: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  positive: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
  negative: 'bg-[var(--color-bg)] text-[var(--color-muted)]',
};

const TONE_OVER_CLASS: Record<KanbanColumnTone, string> = {
  default: 'ring-[var(--color-accent)]/45 bg-[var(--color-accent-soft)]/35',
  positive: 'ring-[var(--color-success)]/40 bg-[var(--color-success-soft)]/45',
  negative: 'ring-[var(--color-muted)]/35 bg-[var(--color-bg)]/70',
};

type KanbanColumnProps<TItem extends { id: string }, TStage extends string> = {
  column: KanbanColumnDef<TStage>;
  items: TItem[];
  terminal: boolean;
  onOpen: (id: string) => void;
  renderCard: (item: TItem, options: { isDragging: boolean }) => ReactNode;
};

export function KanbanColumn<TItem extends { id: string }, TStage extends string>({
  column,
  items,
  terminal,
  onOpen,
  renderCard,
}: KanbanColumnProps<TItem, TStage>) {
  const t = useTranslations('common');
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const tone = column.tone ?? 'default';
  const isEmpty = items.length === 0;

  return (
    <section
      ref={setNodeRef}
      className={clsx(
        'relative flex w-[18.5rem] shrink-0 flex-col overflow-hidden border transition-[box-shadow,transform,border-color] duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
        terminal
          ? clsx(
              TERMINAL_COLUMN_RADIUS_CLASS,
              'border-dashed border-[var(--color-border-strong)] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)]',
            )
          : clsx(
              'rounded-[var(--radius-panel)] border-white/90 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]',
              'outline outline-1 outline-[var(--color-border)]',
              'shadow-[var(--shadow-soft)]',
            ),
        isOver && 'scale-[1.01]',
      )}
    >
      <div
        aria-hidden
        className={clsx('h-1 w-full bg-gradient-to-r', TONE_ACCENT_CLASS[tone])}
      />

      {isOver ? (
        <div
          aria-hidden
          className={clsx(
            'pointer-events-none absolute inset-0 z-20 ring-2 ring-inset',
            terminal ? TERMINAL_COLUMN_RADIUS_CLASS : 'rounded-[var(--radius-panel)]',
            TONE_OVER_CLASS[tone],
          )}
        />
      ) : null}

      <header
        className={clsx(
          'flex items-center justify-between gap-2 border-b px-3.5 py-3',
          terminal
            ? 'border-[var(--color-border)]/70 bg-[var(--color-brass-soft)]/40'
            : 'border-[var(--color-border)]/80 bg-white/55',
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className={clsx('size-2 shrink-0 rounded-full shadow-sm', TONE_DOT_CLASS[tone])}
          />
          <h3
            className={clsx(
              'truncate text-[11.5px] font-bold uppercase tracking-[0.14em]',
              TONE_HEADER_CLASS[tone],
            )}
          >
            {column.title}
          </h3>
        </div>
        <span
          className={clsx(
            'rounded-lg px-2 py-0.5 text-[11.5px] font-semibold tabular-nums',
            TONE_COUNT_CLASS[tone],
          )}
        >
          {items.length}
        </span>
      </header>

      <div className="soft-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-2.5">
        {isEmpty ? (
          <div
            className={clsx(
              'flex min-h-28 flex-1 flex-col items-center justify-center rounded-[0.95rem] border border-dashed px-3 text-center',
              isOver
                ? 'border-[var(--color-accent)]/50 bg-[var(--color-accent-soft)]/25'
                : 'border-[var(--color-border)] bg-white/40',
            )}
          >
            <p className="text-xs font-medium text-[var(--color-muted)]">{t('kanbanEmptyColumn')}</p>
          </div>
        ) : (
          items.map((item) => (
            <DraggableKanbanCard
              key={item.id}
              item={item}
              onOpen={onOpen}
              renderCard={renderCard}
            />
          ))
        )}
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
      className={clsx(
        'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-35',
      )}
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
