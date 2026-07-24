'use client';

import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

type SheetProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  widthClassName?: string;
};

const PANEL_EXIT_MS = 300;

export function Sheet({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  headerActions,
  widthClassName = 'w-full sm:w-[min(100%,34rem)]',
}: SheetProps) {
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setEntered(true));
      });
      return () => window.cancelAnimationFrame(frame);
    }

    setEntered(false);
    const timer = window.setTimeout(() => setMounted(false), PANEL_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mounted, onClose]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[130] flex justify-end">
      <button
        type="button"
        aria-label="Dismiss overlay"
        className={clsx(
          'absolute inset-0 border-0 bg-[#0e0f14]/40 transition-opacity',
          'duration-[var(--side-sheet-backdrop-ms)] ease-[var(--ease-out-premium)]',
          entered ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />

      {/* Width = sheet only, so close btn sits on the panel's left edge (ToonExpo admin). */}
      <div
        className={clsx(
          'relative z-10 flex h-full min-h-0',
          'transition-transform duration-[var(--side-sheet-panel-ms)] ease-[var(--ease-out-premium)]',
          'will-change-transform',
          entered ? 'translate-x-0' : 'translate-x-full',
          widthClassName,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={clsx(
            'absolute top-6 z-20 hidden h-10 w-11 items-center justify-center sm:inline-flex',
            '-left-11 rounded-l-full bg-[var(--color-brand)] text-white',
            'transition-colors duration-150 hover:bg-[var(--color-brand-mid)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
          )}
        >
          <X className="size-4 stroke-[2.5]" aria-hidden />
        </button>

        <aside
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={clsx(
            'flex h-full min-h-0 w-full flex-col overflow-hidden bg-white',
            'rounded-l-[28px] border-l border-[var(--color-border)]',
            'shadow-[var(--shadow-sheet)]',
          )}
        >
          <header className="flex shrink-0 items-start justify-between gap-4 px-7 pb-4 pt-6">
            <div className="min-w-0">
              <h2 className="truncate text-[1.5rem] font-bold leading-tight tracking-tight text-[var(--color-fg)]">
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {headerActions}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={clsx(
                  'inline-flex size-10 items-center justify-center rounded-full sm:hidden',
                  'bg-[var(--color-brand)] text-white',
                  'shadow-[0_4px_16px_rgb(40_57_148/0.35)]',
                )}
              >
                <X className="size-4 stroke-[2.5]" aria-hidden />
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-6 pt-2">{children}</div>

          {footer ? (
            <footer className="shrink-0 border-t border-[var(--color-border)] bg-white px-7 py-4">
              {footer}
            </footer>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
