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
import { FIELD_CONTROL_CLASS } from '@/components/ui/field-control';
import {
  getStageLayoutHeight,
  viewportLengthToStage,
  viewportRectToStage,
} from '@/lib/desktop-layout-scale';
import { getAppPortalRoot } from '@/lib/portal-root';

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
  maxHeight: number;
};

const MENU_MAX_HEIGHT_PX = 280;
const MENU_MIN_HEIGHT_PX = 120;
const MENU_GAP_PX = 8;
const MENU_FLIP_THRESHOLD_PX = 160;

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

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  /** Shrink trigger to the selected label width (toolbar filters). */
  fitContent?: boolean;
};

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
  fitContent = false,
  'aria-label': ariaLabel,
}: SelectInputProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [options, setOptions] = useState<SelectOption[]>([]);

  const selectedValue = value == null ? undefined : String(value);
  const selectedLabel = options.find((option) => option.value === selectedValue)?.label ?? '';

  function syncOptions(): void {
    setOptions(readOptions(selectRef.current));
  }

  function updateMenuPosition(): void {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const stageRect = viewportRectToStage(rect);
    const gap = viewportLengthToStage(MENU_GAP_PX);
    const maxMenu = viewportLengthToStage(MENU_MAX_HEIGHT_PX);
    const minMenu = viewportLengthToStage(MENU_MIN_HEIGHT_PX);
    const flipAt = viewportLengthToStage(MENU_FLIP_THRESHOLD_PX);
    const stageHeight = getStageLayoutHeight();
    const spaceBelow = stageHeight - stageRect.top - stageRect.height - gap;
    const spaceAbove = stageRect.top - gap;
    const openUpward = spaceBelow < Math.min(maxMenu, flipAt) && spaceAbove > spaceBelow;
    const availableSpace = openUpward ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(minMenu, Math.min(maxMenu, Math.floor(availableSpace)));

    setMenuPosition({
      top: openUpward ? stageRect.top - gap : stageRect.top + stageRect.height + gap,
      left: stageRect.left,
      width: stageRect.width,
      openUpward,
      maxHeight,
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
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.blur();
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
        position: 'absolute',
        zIndex: 1000,
        left: menuPosition.left,
        minWidth: Math.max(menuPosition.width, viewportLengthToStage(160)),
        width: 'max-content',
        maxWidth: `min(24rem, calc(100% - ${viewportLengthToStage(24)}px))`,
        maxHeight: menuPosition.maxHeight,
        ...(menuPosition.openUpward
          ? { bottom: getStageLayoutHeight() - menuPosition.top }
          : { top: menuPosition.top }),
      }
    : undefined;

  return (
    <div
      ref={rootRef}
      className={clsx(
        'relative min-w-0',
        fitContent ? 'inline-flex w-fit shrink-0' : 'w-full',
        className,
      )}
    >
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
          FIELD_CONTROL_CLASS,
          'relative z-[1] flex items-center justify-between gap-2 text-left',
          fitContent ? 'w-auto' : 'min-w-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <span className={clsx(fitContent ? 'whitespace-nowrap' : 'min-w-0 truncate')}>
          {selectedLabel || '\u00A0'}
        </span>
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
              data-portal
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
                  const isSelected = option.value === selectedValue;

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
                          <Check
                            className="size-3.5 shrink-0 text-[var(--color-brand)]"
                            aria-hidden
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>,
            getAppPortalRoot(),
          )
        : null}
    </div>
  );
}
