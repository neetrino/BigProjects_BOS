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
        'w-full rounded-[1rem] border bg-white p-3.5 text-left shadow-[var(--shadow-soft)]',
        'transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
        isDragging
          ? 'pointer-events-none border-[var(--color-accent)] shadow-[var(--shadow-lift)] ring-1 ring-[var(--color-accent)]/25'
          : 'border-[var(--color-border)] hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-lift)]',
      )}
    >
      {children}
    </article>
  );
}
