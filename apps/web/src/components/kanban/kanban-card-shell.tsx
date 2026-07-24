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
        'w-full rounded-[1rem] border border-[var(--color-border)] bg-[#ffffff] p-3.5 text-left',
        isDragging
          ? 'pointer-events-none border-[var(--color-accent)]'
          : 'transition-colors duration-200 hover:border-[var(--color-border-strong)]',
      )}
    >
      {children}
    </article>
  );
}
