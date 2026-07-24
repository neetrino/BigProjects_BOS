'use client';

import { useEffect, type ReactNode } from 'react';
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
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) {
        onCancel();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, busy, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-[#122033]/32 backdrop-blur-[3px]"
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
        className="relative z-10 w-full max-w-sm rounded-[1.25rem] border border-white/80 bg-[linear-gradient(180deg,#fffcf8,#ffffff)] p-6 shadow-[var(--shadow-lift)] outline outline-1 outline-[var(--color-border)]"
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
    </div>
  );
}
