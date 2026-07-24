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
        'w-full rounded-[1rem] border bg-[linear-gradient(180deg,#ffffff,#fffcf8)] p-3.5 text-left transition-all duration-200',
        isDragging
          ? 'scale-[1.02] border-[var(--color-accent)] shadow-[var(--shadow-lift)] opacity-95'
          : 'border-[var(--color-border)] shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-lift)]',
      )}
    >
      {children}
    </article>
  );
}
