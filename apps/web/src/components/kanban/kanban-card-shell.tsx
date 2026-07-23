'use client';

import { clsx } from 'clsx';
import type { ReactNode } from 'react';

type KanbanCardShellProps = {
  children: ReactNode;
  isDragging?: boolean;
};

/** Shared outer surface for Builder Sales and Partners cards. */
export function KanbanCardShell({ children, isDragging = false }: KanbanCardShellProps) {
  return (
    <article
      className={clsx(
        'w-full rounded-xl border bg-[var(--color-surface)] p-3 text-left',
        isDragging
          ? 'border-[var(--color-accent)] shadow-md opacity-95'
          : 'border-[var(--color-border)] shadow-sm transition-shadow hover:shadow-md',
      )}
    >
      {children}
    </article>
  );
}
