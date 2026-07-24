'use client';

import { clsx } from 'clsx';
import { CalendarDays, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { DateInputCalendar } from '@/components/ui/date-input-calendar';
import { isoToDisplayInput, parseIsoDate, todayIso } from '@/components/ui/date-input-utils';
import { useDateInputDraft } from '@/components/ui/use-date-input-draft';

type DateInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
  openUpward: boolean;
};

const MENU_GAP_PX = 8;
const PANEL_HEIGHT_PX = 340;
const PANEL_MIN_WIDTH_PX = 288;
const PANEL_Z_INDEX = 220;

/**
 * Site-styled date field: type manually (`YYYY-MM-DD` / `DD.MM.YYYY`) or pick from calendar.
 * Value is always `YYYY-MM-DD` or empty string.
 */
export function DateInput({
  id,
  value,
  onChange,
  disabled = false,
  className,
  'aria-label': ariaLabel,
}: DateInputProps) {
  const t = useTranslations('common.datePicker');
  const locale = useLocale();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const selected = parseIsoDate(value);
  const fallback = parseIsoDate(todayIso()) ?? { year: 2026, monthIndex: 0, day: 1 };
  const seed = selected ?? fallback;
  const [viewYear, setViewYear] = useState(seed.year);
  const [viewMonth, setViewMonth] = useState(seed.monthIndex);

  const draftApi = useDateInputDraft({
    value,
    onChange,
    onCommitView: (year, monthIndex) => {
      setViewYear(year);
      setViewMonth(monthIndex);
    },
    onClose: () => setOpen(false),
  });

  function clearValue(): void {
    draftApi.clearDraft();
    setOpen(false);
    draftApi.inputRef.current?.focus();
  }

  function updateMenuPosition(): void {
    const trigger = rootRef.current;
    if (!trigger) {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP_PX;
    const openUpward = spaceBelow < PANEL_HEIGHT_PX && rect.top > spaceBelow;
    setMenuPosition({
      top: openUpward ? rect.top - MENU_GAP_PX : rect.bottom + MENU_GAP_PX,
      left: rect.left,
      width: Math.max(rect.width, PANEL_MIN_WIDTH_PX),
      openUpward,
    });
  }

  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    updateMenuPosition();
    function handleReposition() {
      updateMenuPosition();
    }
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !selected) {
      return;
    }
    setViewYear(selected.year);
    setViewMonth(selected.monthIndex);
  }, [open, selected]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
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

  const panelStyle: CSSProperties | undefined = menuPosition
    ? {
        position: 'fixed',
        top: menuPosition.openUpward ? undefined : menuPosition.top,
        bottom: menuPosition.openUpward ? window.innerHeight - menuPosition.top : undefined,
        left: menuPosition.left,
        width: menuPosition.width,
        zIndex: PANEL_Z_INDEX,
      }
    : undefined;

  const showClear = Boolean(value || draftApi.draft);

  return (
    <div ref={rootRef} className={clsx('relative', className)}>
      <div
        className={clsx(
          'flex w-full items-center gap-1 rounded-xl border border-[var(--color-border)] bg-[#f3f2ee] px-2.5 transition-colors duration-150',
          'hover:border-[var(--color-border-strong)] focus-within:border-[var(--color-brand)] focus-within:bg-white',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <input
          ref={draftApi.inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          placeholder={t('placeholder')}
          value={draftApi.draft}
          onBeforeInput={draftApi.handleBeforeInput}
          onChange={(event) => draftApi.handleChange(event.target.value)}
          onFocus={() => draftApi.setFocused(true)}
          onBlur={draftApi.handleBlur}
          onKeyDown={draftApi.handleKeyDown}
          className="min-w-0 flex-1 bg-transparent py-2.5 pl-1 text-sm font-medium text-[var(--color-fg)] outline-none placeholder:font-medium placeholder:text-[var(--color-muted)]/60"
        />
        {showClear && !disabled ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={t('clear')}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-soft)]"
            onMouseDown={(event) => event.preventDefault()}
            onClick={clearValue}
          >
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label={t('title')}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-white hover:text-[var(--color-fg)] disabled:opacity-50"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (!disabled) {
              setOpen((prev) => !prev);
            }
          }}
        >
          <CalendarDays className="size-4" aria-hidden />
        </button>
      </div>

      {open && menuPosition && typeof document !== 'undefined'
        ? createPortal(
            <div ref={panelRef} data-portal id={panelId} style={panelStyle}>
              <DateInputCalendar
                value={value}
                viewYear={viewYear}
                viewMonth={viewMonth}
                locale={locale}
                labels={{
                  title: t('title'),
                  prevMonth: t('prevMonth'),
                  nextMonth: t('nextMonth'),
                  clear: t('clear'),
                  today: t('today'),
                }}
                onViewChange={(year, monthIndex) => {
                  setViewYear(year);
                  setViewMonth(monthIndex);
                }}
                onSelect={(iso) => {
                  onChange(iso);
                  draftApi.setDraft(isoToDisplayInput(iso));
                  setOpen(false);
                }}
                onClear={clearValue}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
