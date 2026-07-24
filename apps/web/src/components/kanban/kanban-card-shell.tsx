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
        'w-full rounded-[0.875rem] border bg-[var(--color-surface)] p-3.5 text-left transition-all duration-150',
        isDragging
          ? 'border-[var(--color-accent)] shadow-[var(--shadow-lift)] opacity-95'
          : 'border-[var(--color-border)] shadow-[var(--shadow-soft)] hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-lift)]',
      )}
    >
      {children}
    </article>
  );
}
