'use client';

import { clsx } from 'clsx';
import { Check, ChevronDown } from 'lucide-react';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type SelectHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';

type SelectOption = {
  value: string;
  label: string;
  disabled: boolean;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
  openUpward: boolean;
};

const MENU_MAX_HEIGHT_PX = 280;
const MENU_GAP_PX = 8;

function readOptions(select: HTMLSelectElement | null): SelectOption[] {
  if (!select) {
    return [];
  }

  return Array.from(select.options).map((option) => ({
    value: option.value,
    label: option.label || option.text,
    disabled: option.disabled,
  }));
}

export function SelectInput({
  children,
  className,
  value,
  defaultValue,
  onChange,
  disabled = false,
  id,
  name,
  required,
  'aria-label': ariaLabel,
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [options, setOptions] = useState<SelectOption[]>([]);

  const selectedValue = value == null ? undefined : String(value);
  const selectedLabel =
    options.find((option) => option.value === (selectedValue ?? selectRef.current?.value))?.label ??
    '';

  function syncOptions(): void {
    setOptions(readOptions(selectRef.current));
  }

  function updateMenuPosition(): void {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP_PX;
    const openUpward = spaceBelow < Math.min(MENU_MAX_HEIGHT_PX, 160) && rect.top > spaceBelow;

    setMenuPosition({
      top: openUpward ? rect.top - MENU_GAP_PX : rect.bottom + MENU_GAP_PX,
      left: rect.left,
      width: rect.width,
      openUpward,
    });
  }

  useLayoutEffect(() => {
    syncOptions();
  }, [children, value]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    syncOptions();
    updateMenuPosition();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent): void {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handleReposition(): void {
      updateMenuPosition();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open]);

  function handleSelect(nextValue: string): void {
    const select = selectRef.current;
    if (select) {
      select.value = nextValue;
    }

    onChange?.({
      target: { value: nextValue, name: name ?? '' },
      currentTarget: { value: nextValue, name: name ?? '' },
    } as ChangeEvent<HTMLSelectElement>);
    setOpen(false);
    triggerRef.current?.focus();
  }

  const menuStyle: CSSProperties | undefined = menuPosition
    ? {
        position: 'fixed',
        zIndex: 1000,
        left: menuPosition.left,
        width: Math.max(menuPosition.width, 160),
        maxHeight: MENU_MAX_HEIGHT_PX,
        ...(menuPosition.openUpward
          ? { bottom: window.innerHeight - menuPosition.top }
          : { top: menuPosition.top }),
      }
    : undefined;

  return (
    <div ref={rootRef} className={clsx('relative min-w-0', className)}>
      <select
        ref={selectRef}
        id={id ? `${id}-native` : undefined}
        name={name}
        required={required}
        disabled={disabled}
        aria-hidden
        tabIndex={-1}
        onChange={onChange}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        {...(value !== undefined ? { value: String(value) } : { defaultValue })}
      >
        {children}
      </select>

      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => {
          if (disabled) {
            return;
          }
          if (open) {
            setOpen(false);
            return;
          }
          syncOptions();
          updateMenuPosition();
          setOpen(true);
        }}
        className={clsx(
          'relative z-[1] flex w-full min-w-0 items-center justify-between gap-2 rounded-xl',
          'border border-[var(--color-border)] bg-[#f3f2ee] px-3.5 py-2.5 text-left text-sm font-medium',
          'text-[var(--color-fg)] outline-none transition-colors duration-150',
          'hover:border-[var(--color-border-strong)]',
          'focus-visible:border-[var(--color-brand)] focus-visible:bg-white',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <span className="min-w-0 truncate">{selectedLabel || '\u00A0'}</span>
        <ChevronDown
          className={clsx(
            'size-4 shrink-0 text-[var(--color-muted)] transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {open && menuPosition && typeof document !== 'undefined'
        ? createPortal(
            <ul
              ref={menuRef}
              id={listboxId}
              role="listbox"
              aria-label={ariaLabel}
              style={menuStyle}
              className={clsx(
                'overflow-y-auto rounded-[12px] border border-[var(--color-border)]',
                'bg-[var(--color-surface-elevated)] py-1.5 text-[var(--color-fg)] shadow-md',
                'dropdown-panel-in',
              )}
            >
              {options.length === 0 ? (
                <li className="px-3 py-2.5 text-sm text-[var(--color-muted)]">—</li>
              ) : (
                options.map((option) => {
                  const isSelected = option.value === (selectedValue ?? selectRef.current?.value);

                  return (
                    <li key={`${option.value}::${option.label}`} role="none">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={option.disabled}
                        onClick={() => {
                          if (!option.disabled) {
                            handleSelect(option.value);
                          }
                        }}
                        className={clsx(
                          'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm',
                          'whitespace-nowrap transition-colors duration-150',
                          'disabled:cursor-not-allowed disabled:opacity-40',
                          isSelected
                            ? 'bg-[var(--color-accent-soft)] font-semibold text-[var(--color-brand)]'
                            : 'font-medium text-[var(--color-fg)] hover:bg-[var(--color-bg)]',
                        )}
                      >
                        <span>{option.label}</span>
                        {isSelected ? (
                          <Check className="size-3.5 shrink-0 text-[var(--color-brand)]" aria-hidden />
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>,
            document.body,
          )
        : null}
    </div>
  );
}
