'use client';

import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { Button } from './button';

type SheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
};

export function Sheet({
  open,
  title,
  onClose,
  children,
  footer,
  widthClassName = 'w-full max-w-md',
}: SheetProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={clsx(
          'relative z-10 flex h-full flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl',
          widthClassName,
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-base font-semibold text-[var(--color-fg)]">{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close" className="px-2">
            <X className="size-4" />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer ? (
          <footer className="border-t border-[var(--color-border)] px-4 py-3">{footer}</footer>
        ) : null}
      </aside>
    </div>
  );
}
