'use client';

import { clsx } from 'clsx';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';

type DialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: 'primary' | 'danger';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

const DIALOG_EXIT_MS = 200;

export function Dialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'primary',
  busy = false,
  onConfirm,
  onCancel,
  children,
}: DialogProps) {
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
    const timer = window.setTimeout(() => setMounted(false), DIALOG_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) {
        onCancel();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mounted, busy, onCancel]);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      data-portal
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Dismiss overlay"
        className={clsx(
          'absolute inset-0 border-0 bg-[#0e0f14]/55',
          'transition-opacity duration-200 ease-[var(--ease-out-premium)]',
          entered ? 'opacity-100' : 'opacity-0',
        )}
        onClick={() => {
          if (!busy) {
            onCancel();
          }
        }}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={clsx(
          'relative z-10 w-full max-w-sm rounded-[1.25rem] border border-white/80',
          'bg-[linear-gradient(180deg,#fffcf8,#ffffff)] p-6 shadow-[var(--shadow-lift)]',
          'outline outline-1 outline-[var(--color-border)]',
          'transition-[opacity,transform] duration-200 ease-[var(--ease-out-premium)]',
          'will-change-transform',
          entered ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-[0.96] opacity-0',
        )}
      >
        <h2
          id="dialog-title"
          className="font-[family-name:var(--font-display)] text-xl font-medium tracking-tight text-[var(--color-fg)]"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{description}</p>
        ) : null}
        {children}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
