'use client';

import { clsx } from 'clsx';
import { Check, MoreVertical } from 'lucide-react';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';

export type IconMenuItem = {
  id: string;
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  tone?: 'default' | 'danger';
  /** Shown on the trailing edge (e.g. checkmark when account already linked). */
  trailing?: ReactNode;
};

type IconMenuProps = {
  label: string;
  items: IconMenuItem[];
  disabled?: boolean;
};

export function IconMenu({ label, items, disabled = false }: IconMenuProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [open]);

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={handleTriggerKeyDown}
        className={clsx(
          'inline-flex size-9 items-center justify-center rounded-full',
          'text-[var(--color-muted)] transition-colors',
          'hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-fg)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'outline-none focus-visible:outline-none',
        )}
      >
        <MoreVertical className="size-5" aria-hidden />
      </button>

      {open ? (
        <ul
          id={menuId}
          role="menu"
          aria-label={label}
          className={clsx(
            'absolute right-0 z-30 mt-1 w-max overflow-hidden rounded-[12px] border border-[var(--color-border)]',
            'bg-[var(--color-surface-elevated)] text-[var(--color-fg)] shadow-md',
          )}
        >
          {items.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === items.length - 1;

            return (
              <li key={item.id} role="presentation">
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  className={clsx(
                    'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm font-medium',
                    'whitespace-nowrap transition-colors duration-150',
                    isFirst && 'rounded-t-[11px]',
                    isLast && 'rounded-b-[11px]',
                    item.tone === 'danger'
                      ? 'text-[var(--color-danger)] hover:bg-red-50'
                      : 'text-[var(--color-fg)] hover:bg-[var(--color-bg)]',
                    'disabled:cursor-default disabled:opacity-70 disabled:hover:bg-transparent',
                  )}
                  onClick={() => {
                    if (item.disabled) {
                      return;
                    }
                    setOpen(false);
                    item.onSelect();
                  }}
                >
                  <span className="flex items-center gap-2.5">
                    {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
                    <span>{item.label}</span>
                  </span>
                  {item.trailing}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function IconMenuCheck() {
  return <Check className="size-4 shrink-0 text-[var(--color-brand)]" aria-hidden />;
}
