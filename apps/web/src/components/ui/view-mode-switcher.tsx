'use client';

import { clsx } from 'clsx';
import { LayoutGrid, List } from 'lucide-react';
import type { BoardViewMode } from '@/components/kanban';

type ViewModeSwitcherProps = {
  value: BoardViewMode;
  onChange: (view: BoardViewMode) => void;
  ariaLabel: string;
  kanbanLabel: string;
  listLabel: string;
  className?: string;
};

const MODES: readonly BoardViewMode[] = ['kanban', 'list'];

export function ViewModeSwitcher({
  value,
  onChange,
  ariaLabel,
  kanbanLabel,
  listLabel,
  className,
}: ViewModeSwitcherProps) {
  const activeIndex = MODES.indexOf(value);

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={clsx(
        'relative inline-grid shrink-0 grid-cols-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/80 p-0.5',
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
          'relative z-[1] flex size-9 items-center justify-center rounded-[10px] transition-colors duration-200',
          value === 'kanban'
            ? 'text-[var(--color-brand)]'
            : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]',
        )}
      >
        <LayoutGrid className="size-4" aria-hidden />
      </button>

      <button
        type="button"
        aria-label={listLabel}
        aria-pressed={value === 'list'}
        onClick={() => onChange('list')}
        className={clsx(
          'relative z-[1] flex size-9 items-center justify-center rounded-[10px] transition-colors duration-200',
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
