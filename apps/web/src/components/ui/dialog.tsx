'use client';

import { useState, type ReactNode } from 'react';
import { Button } from './button';
import { ModalFrame } from './modal-frame';

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

type DialogSnapshot = {
  title: string;
  description: string | undefined;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant: 'primary' | 'danger';
  children: ReactNode | undefined;
};

/**
 * Centered confirm/create dialog. Stays mounted through close so exit motion can play.
 */
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
  const live: DialogSnapshot = {
    title,
    description,
    confirmLabel,
    cancelLabel,
    confirmVariant,
    children,
  };
  const [snapshot, setSnapshot] = useState<DialogSnapshot>(live);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSnapshot(live);
    }
  } else if (open) {
    if (
      snapshot.title !== title ||
      snapshot.description !== description ||
      snapshot.confirmLabel !== confirmLabel ||
      snapshot.cancelLabel !== cancelLabel ||
      snapshot.confirmVariant !== confirmVariant ||
      snapshot.children !== children
    ) {
      setSnapshot(live);
    }
  }

  const shown = open ? live : snapshot;
  const actionsDisabled = busy || !open;

  return (
    <ModalFrame
      open={open}
      onClose={onCancel}
      busy={actionsDisabled}
      role="alertdialog"
      labelledBy="dialog-title"
      panelClassName="max-w-sm rounded-[1.25rem] border border-white/80 bg-[linear-gradient(180deg,#fffcf8,#ffffff)] p-6 shadow-[var(--shadow-lift)] outline outline-1 outline-[var(--color-border)]"
    >
      <h2
        id="dialog-title"
        className="font-[family-name:var(--font-display)] text-xl font-medium tracking-tight text-[var(--color-fg)]"
      >
        {shown.title}
      </h2>
      {shown.description ? (
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{shown.description}</p>
      ) : null}
      {shown.children}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={actionsDisabled}>
          {shown.cancelLabel}
        </Button>
        <Button variant={shown.confirmVariant} onClick={onConfirm} disabled={actionsDisabled}>
          {shown.confirmLabel}
        </Button>
      </div>
    </ModalFrame>
  );
}
