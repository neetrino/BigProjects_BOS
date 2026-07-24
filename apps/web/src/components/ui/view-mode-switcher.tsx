'use client';

import { clsx } from 'clsx';
import { Columns3, LayoutGrid, List } from 'lucide-react';
import type { BoardViewMode } from '@/components/kanban';

type BoardIconVariant = 'columns' | 'grid';

type ViewModeSwitcherProps = {
  value: BoardViewMode;
  onChange: (view: BoardViewMode) => void;
  ariaLabel?: string;
  kanbanLabel: string;
  listLabel: string;
  /** `columns` for kanban boards; `grid` for flat card grids (e.g. Organizations). */
  boardIcon?: BoardIconVariant;
  className?: string;
};

const MODES: readonly BoardViewMode[] = ['kanban', 'list'];

export function ViewModeSwitcher({
  value,
  onChange,
  ariaLabel,
  kanbanLabel,
  listLabel,
  boardIcon = 'columns',
  className,
}: ViewModeSwitcherProps) {
  const activeIndex = MODES.indexOf(value);
  const BoardIcon = boardIcon === 'grid' ? LayoutGrid : Columns3;

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={clsx(
        'relative inline-grid h-9 shrink-0 grid-cols-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-bg)]/80 p-0.5',
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-[10px] bg-[var(--color-surface)] shadow-sm transition-transform duration-300 ease-[var(--ease-out-premium)]"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />

      <button
        type="button"
        aria-label={kanbanLabel}
        aria-pressed={value === 'kanban'}
        onClick={() => onChange('kanban')}
        className={clsx(
          'relative z-[1] flex h-full items-center justify-center rounded-[10px] px-2.5 transition-colors duration-200',
          value === 'kanban'
            ? 'text-[var(--color-brand)]'
            : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]',
        )}
      >
        <BoardIcon className="size-4" aria-hidden />
      </button>

      <button
        type="button"
        aria-label={listLabel}
        aria-pressed={value === 'list'}
        onClick={() => onChange('list')}
        className={clsx(
          'relative z-[1] flex h-full items-center justify-center rounded-[10px] px-2.5 transition-colors duration-200',
          value === 'list'
            ? 'text-[var(--color-brand)]'
            : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]',
        )}
      >
        <List className="size-4" aria-hidden />
      </button>
    </div>
  );
}
