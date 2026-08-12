'use client';

import { clsx } from 'clsx';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type AnimationEvent,
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
const DROPDOWN_OUT_ANIMATION_NAME = 'dropdown-panel-out';
const DROPDOWN_EXIT_FALLBACK_MS = 180;

type MenuPhase = 'closed' | 'open' | 'exiting';

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

function filterOptions(options: SelectOption[], query: string): SelectOption[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return options;
  }
  return options.filter((option) => option.label.toLowerCase().includes(normalized));
}

function orderOptionsForMenu(
  options: SelectOption[],
  selectedValue: string | undefined,
  pinSelectedToTop: boolean,
): SelectOption[] {
  if (!pinSelectedToTop || !selectedValue) {
    return options;
  }
  const selected = options.filter((option) => option.value === selectedValue);
  if (selected.length === 0) {
    return options;
  }
  const rest = options.filter((option) => option.value !== selectedValue);
  return [...selected, ...rest];
}

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  /** Shrink trigger to the selected label width (toolbar filters). */
  fitContent?: boolean;
  /** Light field (default) or frosted control on brand surfaces. */
  variant?: 'default' | 'onBrand';
  /** Keep the open menu the same width as the trigger (no overflow). */
  menuMatchTriggerWidth?: boolean;
  /** Move the currently selected option to the top of the open menu. */
  pinSelectedToTop?: boolean;
  /** Show a search field at the top of the open menu. */
  searchable?: boolean;
  /** Placeholder for the menu search field. */
  searchPlaceholder?: string;
  /** Empty-state text when search has no matches. */
  searchEmptyLabel?: string;
};

const ON_BRAND_CONTROL_CLASS =
  'w-full rounded-[var(--radius-control)] border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm font-medium text-white outline-none transition-colors duration-200 hover:border-white/35 hover:bg-white/15 focus:border-white/50';

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
  variant = 'default',
  menuMatchTriggerWidth = false,
  pinSelectedToTop = false,
  searchable = false,
  searchPlaceholder,
  searchEmptyLabel,
  'aria-label': ariaLabel,
}: SelectInputProps) {
  const t = useTranslations('common');
  const resolvedSearchPlaceholder = searchPlaceholder ?? t('search');
  const resolvedSearchEmptyLabel = searchEmptyLabel ?? t('noMatches');
  const listboxId = useId();
  const searchInputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<MenuPhase>('closed');
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const isOpen = phase === 'open';
  const isExiting = phase === 'exiting';
  const menuVisible = phase !== 'closed';
  const selectedValue = value == null ? undefined : String(value);
  const menuOptions = useMemo(
    () =>
      orderOptionsForMenu(
        filterOptions(options, searchable ? searchQuery : ''),
        selectedValue,
        pinSelectedToTop,
      ),
    [options, pinSelectedToTop, searchQuery, searchable, selectedValue],
  );
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

  function openMenu(): void {
    syncOptions();
    setSearchQuery('');
    updateMenuPosition();
    setPhase('open');
  }

  function closeMenu(): void {
    setPhase((current) => (current === 'closed' ? 'closed' : 'exiting'));
  }

  function finishExit(): void {
    setSearchQuery('');
    setPhase('closed');
  }

  function handleMenuAnimationEnd(event: AnimationEvent<HTMLDivElement>): void {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (!event.animationName.includes(DROPDOWN_OUT_ANIMATION_NAME)) {
      return;
    }
    finishExit();
  }

  useLayoutEffect(() => {
    syncOptions();
  }, [children, value]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }
    syncOptions();
    updateMenuPosition();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !searchable) {
      return;
    }
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isOpen, searchable]);

  useEffect(() => {
    if (!isExiting) {
      return;
    }
    const timer = window.setTimeout(finishExit, DROPDOWN_EXIT_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [isExiting]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent): void {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      closeMenu();
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
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
  }, [isOpen]);

  function handleSelect(nextValue: string): void {
    if (isExiting) {
      return;
    }

    const select = selectRef.current;
    if (select) {
      select.value = nextValue;
    }

    onChange?.({
      target: { value: nextValue, name: name ?? '' },
      currentTarget: { value: nextValue, name: name ?? '' },
    } as ChangeEvent<HTMLSelectElement>);
    closeMenu();
    triggerRef.current?.focus();
  }

  const menuStyle: CSSProperties | undefined = menuPosition
    ? {
        position: 'absolute',
        zIndex: 1000,
        left: menuPosition.left,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        transformOrigin: menuPosition.openUpward ? 'bottom center' : 'top center',
        maxHeight: menuPosition.maxHeight,
        ...(menuMatchTriggerWidth
          ? {
              width: menuPosition.width,
              minWidth: menuPosition.width,
              maxWidth: menuPosition.width,
            }
          : {
              minWidth: Math.max(menuPosition.width, viewportLengthToStage(160)),
              width: 'max-content',
              maxWidth: `min(24rem, calc(100% - ${viewportLengthToStage(24)}px))`,
            }),
        ...(menuPosition.openUpward
          ? { bottom: getStageLayoutHeight() - menuPosition.top }
          : { top: menuPosition.top }),
      }
    : undefined;

  const menuShellClass = clsx(
    'overflow-hidden will-change-transform',
    variant === 'onBrand'
      ? 'app-select-menu-on-brand'
      : 'rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-fg)] shadow-md',
    isExiting ? 'pointer-events-none dropdown-panel-out' : 'dropdown-panel-in',
  );

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
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => {
          if (disabled) {
            return;
          }
          if (isOpen) {
            closeMenu();
            return;
          }
          openMenu();
        }}
        className={clsx(
          variant === 'onBrand' ? ON_BRAND_CONTROL_CLASS : FIELD_CONTROL_CLASS,
          'relative z-[1] flex items-center justify-between gap-2 text-left',
          fitContent ? 'w-auto' : 'min-w-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <span
          className={clsx(
            fitContent
              ? 'whitespace-nowrap'
              : menuMatchTriggerWidth
                ? 'min-w-0 whitespace-normal break-words text-left leading-snug'
                : 'min-w-0 truncate',
          )}
        >
          {selectedLabel || '\u00A0'}
        </span>
        <ChevronDown
          className={clsx(
            'size-4 shrink-0 transition-transform duration-200',
            variant === 'onBrand' ? 'text-white/65' : 'text-[var(--color-muted)]',
            isOpen && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {menuVisible && menuPosition && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={menuRef}
              data-portal
              style={menuStyle}
              onAnimationEnd={handleMenuAnimationEnd}
              className={menuShellClass}
            >
              {searchable ? (
                <div className="app-select-menu-search shrink-0 border-b border-[var(--color-border)] p-2">
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--color-muted)]"
                      aria-hidden
                    />
                    <input
                      ref={searchInputRef}
                      id={searchInputId}
                      type="search"
                      value={searchQuery}
                      placeholder={resolvedSearchPlaceholder}
                      aria-label={resolvedSearchPlaceholder}
                      autoComplete="off"
                      onChange={(event) => setSearchQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                          event.preventDefault();
                          event.stopPropagation();
                          if (searchQuery) {
                            setSearchQuery('');
                            return;
                          }
                          closeMenu();
                          triggerRef.current?.focus();
                        }
                      }}
                      className={clsx(
                        'w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)]',
                        'py-2 pl-8 pr-2.5 text-sm font-medium text-[var(--color-fg)] outline-none',
                        'placeholder:text-[var(--color-muted)]/65',
                        'focus:border-[var(--color-brand)]',
                        '[&::-webkit-search-cancel-button]:appearance-none',
                        '[&::-webkit-search-decoration]:appearance-none',
                      )}
                    />
                  </div>
                </div>
              ) : null}

              <ul
                id={listboxId}
                role="listbox"
                aria-label={ariaLabel}
                className="soft-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
              >
                {menuOptions.length === 0 ? (
                  <li className="px-3 py-2.5 text-sm text-[var(--color-muted)]">
                    {searchable && searchQuery.trim() ? resolvedSearchEmptyLabel : '—'}
                  </li>
                ) : (
                  menuOptions.map((option, index) => {
                    const isSelected = option.value === selectedValue;
                    const isFirst = index === 0;
                    const isLast = index === menuOptions.length - 1;
                    const showPinDivider =
                      pinSelectedToTop &&
                      !searchQuery.trim() &&
                      isSelected &&
                      isFirst &&
                      menuOptions.length > 1;

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
                            'flex w-full gap-3 px-3 py-2.5 text-left text-sm',
                            'transition-colors duration-150',
                            menuMatchTriggerWidth
                              ? 'min-w-0 items-start'
                              : 'items-center whitespace-nowrap',
                            'disabled:cursor-not-allowed disabled:opacity-40',
                            !searchable && isFirst && 'rounded-t-[11px]',
                            isLast && !showPinDivider && 'rounded-b-[11px]',
                            isSelected
                              ? 'bg-[var(--color-accent-soft)] font-semibold text-[var(--color-brand)]'
                              : 'font-medium text-[var(--color-fg)] hover:bg-[var(--color-bg)]',
                          )}
                        >
                          <span
                            className={clsx(
                              menuMatchTriggerWidth
                                ? 'min-w-0 flex-1 whitespace-normal break-words leading-snug'
                                : undefined,
                            )}
                          >
                            {option.label}
                          </span>
                          {isSelected ? (
                            <Check
                              className="mt-0.5 size-3.5 shrink-0 text-[var(--color-brand)]"
                              aria-hidden
                            />
                          ) : null}
                        </button>
                        {showPinDivider ? (
                          <div aria-hidden className="mx-2 my-1 h-px bg-[var(--color-border)]" />
                        ) : null}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>,
            getAppPortalRoot(),
          )
        : null}
    </div>
  );
}
