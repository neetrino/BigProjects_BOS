'use client';

import { clsx } from 'clsx';
import type { CSSProperties, ReactNode } from 'react';

type KanbanCardShellProps = {
  children: ReactNode;
  isDragging?: boolean;
  /** Stagger index for mount fade-in (0-based). */
  enterIndex?: number;
};

const MAX_CARD_STAGGER = 12;

/** Shared outer surface for Builder Sales and Partners cards. */
export function KanbanCardShell({
  children,
  isDragging = false,
  enterIndex,
}: KanbanCardShellProps) {
  const staggerStyle =
    enterIndex != null
      ? ({ '--card-stagger': Math.min(enterIndex, MAX_CARD_STAGGER) } as CSSProperties)
      : undefined;

  return (
    <article
      style={staggerStyle}
      className={clsx(
        'w-full rounded-[1rem] border bg-white p-3.5 text-left shadow-[var(--shadow-soft)]',
        'transition-[border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
        !isDragging && 'card-enter',
        isDragging
          ? 'pointer-events-none border-[var(--color-accent)] shadow-[var(--shadow-lift)] ring-1 ring-[var(--color-accent)]/25'
          : 'border-[var(--color-border)] hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-lift)]',
      )}
    >
      {children}
    </article>
  );
}
