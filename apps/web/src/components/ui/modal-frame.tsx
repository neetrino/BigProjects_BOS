'use client';

import { clsx } from 'clsx';
import { useEffect, useState, type AnimationEvent, type ReactNode } from 'react';
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

const PANEL_OUT_ANIMATION_NAME = 'modal-panel-out';
const EXIT_FALLBACK_MS = 320;

/**
 * Full-viewport centered modal: portals to body, dim backdrop (no blur),
 * ToonExpo-style enter/exit motion (stays mounted through exit animation).
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
  const [visible, setVisible] = useState(open);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setExiting(false);
      return;
    }
    if (visible) {
      setExiting(true);
    }
  }, [open, visible]);

  useEffect(() => {
    if (!exiting) {
      return;
    }
    const timer = window.setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, EXIT_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [exiting]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const active = document.activeElement;
        if (active instanceof HTMLElement) {
          active.blur();
        }
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
  }, [visible, busy, onClose]);

  function handlePanelAnimationEnd(event: AnimationEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (!event.animationName.includes(PANEL_OUT_ANIMATION_NAME)) {
      return;
    }
    setVisible(false);
    setExiting(false);
  }

  if (!visible || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div data-portal className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Dismiss overlay"
        className={clsx(
          'absolute inset-0 cursor-default border-0 bg-[#0e0f14]/55 outline-none',
          exiting ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in',
        )}
        disabled={busy || exiting}
        onClick={() => {
          if (!busy && !exiting) {
            onClose();
          }
        }}
      />
      <div
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={clsx(
          'relative z-10 w-full will-change-transform',
          exiting ? 'pointer-events-none animate-modal-panel-out' : 'animate-modal-panel-in',
          panelClassName,
        )}
        onAnimationEnd={handlePanelAnimationEnd}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
