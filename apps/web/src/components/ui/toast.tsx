'use client';

import { clsx } from 'clsx';
import { useSyncExternalStore } from 'react';

type ToastTone = 'error' | 'info' | 'success';

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

const TOAST_DURATION_MS = 4500;
const EMPTY_TOASTS: ToastItem[] = [];

let nextId = 1;
let toasts: ToastItem[] = [];
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ToastItem[] {
  return toasts;
}

function getServerSnapshot(): ToastItem[] {
  return EMPTY_TOASTS;
}

function dismissToast(id: number): void {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

/** Shows a short-lived toast near the top of the viewport. */
export function showToast(message: string, tone: ToastTone = 'error'): void {
  const id = nextId;
  nextId += 1;
  toasts = [...toasts, { id, message, tone }];
  emit();
  window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
}

const TONE_CLASS: Record<ToastTone, string> = {
  error: 'border-red-200 bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  info: 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg)]',
  success: 'border-emerald-200 bg-[var(--color-success-soft)] text-[var(--color-success)]',
};

export function ToastHost() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4"
    >
      {items.map((item) => (
        <div
          key={item.id}
          role="status"
          className={clsx(
            'pointer-events-auto max-w-md rounded-[var(--radius-control)] border px-4 py-2.5 text-sm shadow-[var(--shadow-lift)] backdrop-blur-sm',
            TONE_CLASS[item.tone],
          )}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}
