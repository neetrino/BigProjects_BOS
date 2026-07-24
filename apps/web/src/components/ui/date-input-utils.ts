const WEEKDAY_COUNT = 7;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type CalendarCell = {
  iso: string;
  day: number;
  inMonth: boolean;
};

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function toIsoDate(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

export function parseIsoDate(
  value: string,
): { year: number; monthIndex: number; day: number } | null {
  if (!ISO_DATE_RE.test(value)) {
    return null;
  }
  const year = Number(value.slice(0, 4));
  const monthIndex = Number(value.slice(5, 7)) - 1;
  const day = Number(value.slice(8, 10));
  if (!Number.isFinite(year) || monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) {
    return null;
  }
  return { year, monthIndex, day };
}

export function todayIso(): string {
  const now = new Date();
  return toIsoDate(now.getFullYear(), now.getMonth(), now.getDate());
}

export function shiftMonth(
  year: number,
  monthIndex: number,
  delta: number,
): { year: number; monthIndex: number } {
  const date = new Date(year, monthIndex + delta, 1);
  return { year: date.getFullYear(), monthIndex: date.getMonth() };
}

/** Monday-first weekday index: Mon=0 … Sun=6 */
function mondayFirstWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function buildCalendarCells(year: number, monthIndex: number): CalendarCell[] {
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leading = mondayFirstWeekday(first);
  const cells: CalendarCell[] = [];

  for (let i = leading - 1; i >= 0; i -= 1) {
    const date = new Date(year, monthIndex, -i);
    cells.push({
      iso: toIsoDate(date.getFullYear(), date.getMonth(), date.getDate()),
      day: date.getDate(),
      inMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      iso: toIsoDate(year, monthIndex, day),
      day,
      inMonth: true,
    });
  }

  while (cells.length % WEEKDAY_COUNT !== 0) {
    const last = cells[cells.length - 1];
    const date = new Date(`${last.iso}T00:00:00`);
    date.setDate(date.getDate() + 1);
    cells.push({
      iso: toIsoDate(date.getFullYear(), date.getMonth(), date.getDate()),
      day: date.getDate(),
      inMonth: false,
    });
  }

  return cells;
}

export function formatDateDisplay(value: string, locale: string): string {
  const parsed = parseIsoDate(value);
  if (!parsed) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(parsed.year, parsed.monthIndex, parsed.day));
}

export function weekdayLabelsForLocale(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  // 2024-01-01 was a Monday
  return Array.from({ length: WEEKDAY_COUNT }, (_, index) =>
    formatter.format(new Date(2024, 0, 1 + index)),
  );
}
