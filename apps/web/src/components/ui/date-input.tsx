'use client';

import { clsx } from 'clsx';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import {
  buildCalendarCells,
  formatDateDisplay,
  parseIsoDate,
  shiftMonth,
  todayIso,
  weekdayLabelsForLocale,
} from '@/components/ui/date-input-utils';

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

/**
 * Site-styled date picker. Value is always `YYYY-MM-DD` or empty string.
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const selected = parseIsoDate(value);
  const fallback = parseIsoDate(todayIso()) ?? { year: 2026, monthIndex: 0, day: 1 };
  const seed = selected ?? fallback;
  const [viewYear, setViewYear] = useState(seed.year);
  const [viewMonth, setViewMonth] = useState(seed.monthIndex);

  const weekdayLabels = useMemo(() => weekdayLabelsForLocale(locale), [locale]);
  const monthTitle = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
        new Date(viewYear, viewMonth, 1),
      ),
    [locale, viewMonth, viewYear],
  );
  const cells = useMemo(() => buildCalendarCells(viewYear, viewMonth), [viewMonth, viewYear]);
  const today = todayIso();
  const display = value ? formatDateDisplay(value, locale) : '';

  function updateMenuPosition(): void {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const panelHeight = 340;
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP_PX;
    const openUpward = spaceBelow < panelHeight && rect.top > spaceBelow;
    setMenuPosition({
      top: openUpward ? rect.top - MENU_GAP_PX : rect.bottom + MENU_GAP_PX,
      left: rect.left,
      width: Math.max(rect.width, 288),
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
    function handleKeyDown(event: KeyboardEvent) {
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
        zIndex: 220,
      }
    : undefined;

  return (
    <div ref={rootRef} className={clsx('relative', className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={clsx(
          'flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--color-border)] bg-[#f3f2ee] px-3.5 py-2.5 text-left text-sm font-medium outline-none transition-colors duration-150',
          'hover:border-[var(--color-border-strong)] focus:border-[var(--color-brand)] focus:bg-white',
          disabled && 'cursor-not-allowed opacity-60',
          display ? 'text-[var(--color-fg)]' : 'text-[var(--color-muted)]/60',
        )}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
          }
        }}
      >
        <span className="truncate">{display || t('placeholder')}</span>
        <CalendarDays className="size-4 shrink-0 text-[var(--color-muted)]" aria-hidden />
      </button>

      {open && menuPosition && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={panelRef}
              data-portal
              id={panelId}
              role="dialog"
              aria-label={t('title')}
              className="dropdown-panel-in overflow-hidden rounded-[1.15rem] border border-white/80 bg-[linear-gradient(180deg,#fffcf8,#ffffff)] p-3 shadow-[var(--shadow-lift)] outline outline-1 outline-[var(--color-border)]"
              style={panelStyle}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  aria-label={t('prevMonth')}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-bg-warm)] hover:text-[var(--color-fg)]"
                  onClick={() => {
                    const next = shiftMonth(viewYear, viewMonth, -1);
                    setViewYear(next.year);
                    setViewMonth(next.monthIndex);
                  }}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
                <p className="text-sm font-semibold capitalize tracking-tight text-[var(--color-fg)]">
                  {monthTitle}
                </p>
                <button
                  type="button"
                  aria-label={t('nextMonth')}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-bg-warm)] hover:text-[var(--color-fg)]"
                  onClick={() => {
                    const next = shiftMonth(viewYear, viewMonth, 1);
                    setViewYear(next.year);
                    setViewMonth(next.monthIndex);
                  }}
                >
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-0.5">
                {weekdayLabels.map((label, index) => (
                  <span
                    key={`${label}-${index}`}
                    className="py-1 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-muted)]"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {cells.map((cell) => {
                  const isSelected = cell.iso === value;
                  const isToday = cell.iso === today;
                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      onClick={() => {
                        onChange(cell.iso);
                        setOpen(false);
                      }}
                      className={clsx(
                        'flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                        !cell.inMonth && 'text-[var(--color-muted)]/35',
                        cell.inMonth &&
                          !isSelected &&
                          'text-[var(--color-fg)] hover:bg-[var(--color-accent-soft)]',
                        isSelected &&
                          'bg-[var(--color-brand)] text-white shadow-sm hover:bg-[var(--color-brand)]',
                        isToday && !isSelected && 'ring-1 ring-[var(--color-brass)]/50',
                      )}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--color-border)] pt-2.5">
                <button
                  type="button"
                  className="rounded-lg px-2 py-1 text-sm font-medium text-[var(--color-muted)] transition-colors hover:bg-[var(--color-bg-warm)] hover:text-[var(--color-fg)]"
                  onClick={() => {
                    onChange('');
                    setOpen(false);
                  }}
                >
                  {t('clear')}
                </button>
                <button
                  type="button"
                  className="rounded-lg px-2 py-1 text-sm font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-accent-soft)]"
                  onClick={() => {
                    const iso = todayIso();
                    onChange(iso);
                    const parsed = parseIsoDate(iso);
                    if (parsed) {
                      setViewYear(parsed.year);
                      setViewMonth(parsed.monthIndex);
                    }
                    setOpen(false);
                  }}
                >
                  {t('today')}
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
