'use client';

import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  buildCalendarCells,
  parseIsoDate,
  shiftMonth,
  todayIso,
  weekdayLabelsForLocale,
} from '@/components/ui/date-input-utils';

type DateInputCalendarProps = {
  value: string;
  viewYear: number;
  viewMonth: number;
  locale: string;
  labels: {
    title: string;
    prevMonth: string;
    nextMonth: string;
    clear: string;
    today: string;
  };
  onViewChange: (year: number, monthIndex: number) => void;
  onSelect: (iso: string) => void;
  onClear: () => void;
};

export function DateInputCalendar({
  value,
  viewYear,
  viewMonth,
  locale,
  labels,
  onViewChange,
  onSelect,
  onClear,
}: DateInputCalendarProps) {
  const weekdayLabels = weekdayLabelsForLocale(locale);
  const monthTitle = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(viewYear, viewMonth, 1));
  const cells = buildCalendarCells(viewYear, viewMonth);
  const today = todayIso();

  return (
    <div
      role="dialog"
      aria-label={labels.title}
      className="dropdown-panel-in overflow-hidden rounded-[1.15rem] border border-white/80 bg-[linear-gradient(180deg,#fffcf8,#ffffff)] p-3 shadow-[var(--shadow-lift)] outline outline-1 outline-[var(--color-border)]"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={labels.prevMonth}
          className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-bg-warm)] hover:text-[var(--color-fg)]"
          onClick={() => {
            const next = shiftMonth(viewYear, viewMonth, -1);
            onViewChange(next.year, next.monthIndex);
          }}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <p className="text-sm font-semibold capitalize tracking-tight text-[var(--color-fg)]">
          {monthTitle}
        </p>
        <button
          type="button"
          aria-label={labels.nextMonth}
          className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-bg-warm)] hover:text-[var(--color-fg)]"
          onClick={() => {
            const next = shiftMonth(viewYear, viewMonth, 1);
            onViewChange(next.year, next.monthIndex);
          }}
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {weekdayLabels.map((label, index) => (
          <span
            key={`${label}-${index}`}
            className="py-1 text-center text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-muted)]"
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
              onClick={() => onSelect(cell.iso)}
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
          className="rounded-lg px-2 py-1 text-sm font-medium text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-soft)]"
          onClick={onClear}
        >
          {labels.clear}
        </button>
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-sm font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-accent-soft)]"
          onClick={() => {
            const iso = todayIso();
            const parsed = parseIsoDate(iso);
            if (parsed) {
              onViewChange(parsed.year, parsed.monthIndex);
            }
            onSelect(iso);
          }}
        >
          {labels.today}
        </button>
      </div>
    </div>
  );
}
