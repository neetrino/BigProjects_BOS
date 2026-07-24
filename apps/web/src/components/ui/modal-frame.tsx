'use client';

import { clsx } from 'clsx';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ModalFrameProps = {
  open: boolean;
  onClose: () => void;
  /** When true, Escape / backdrop click do not close. */
  busy?: boolean;
  children: ReactNode;
  panelClassName?: string;
  labelledBy?: string;
  role?: 'dialog' | 'alertdialog';
};

const MODAL_EXIT_MS = 200;

/**
 * Full-viewport centered modal: portals to body, dim backdrop (no blur), enter/exit motion.
 */
export function ModalFrame({
  open,
  onClose,
  busy = false,
  children,
  panelClassName,
  labelledBy,
  role = 'dialog',
}: ModalFrameProps) {
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
    const timer = window.setTimeout(() => setMounted(false), MODAL_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) {
        event.preventDefault();
        event.stopImmediatePropagation();
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [mounted, busy, onClose]);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div data-portal className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
            onClose();
          }
        }}
      />
      <div
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={clsx(
          'relative z-10 w-full',
          'transition-[opacity,transform] duration-200 ease-[var(--ease-out-premium)]',
          'will-change-transform',
          entered ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-[0.96] opacity-0',
          panelClassName,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
