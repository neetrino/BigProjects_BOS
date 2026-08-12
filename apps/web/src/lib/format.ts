const DATE_ONLY_LENGTH = 10;
const PAD_WIDTH = 2;
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * 1024;

function pad2(value: number): string {
  return String(value).padStart(PAD_WIDTH, '0');
}

/** Formats an ISO date string for display; returns empty string when null. */
export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return value.slice(0, DATE_ONLY_LENGTH);
}

/** Formats an ISO datetime as `YYYY-MM-DD HH:mm` in local time; empty when null. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, DATE_ONLY_LENGTH);
  }

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** Formats a byte size for attachment lists. */
export function formatFileSize(bytes: number): string {
  if (bytes < BYTES_PER_KB) {
    return `${bytes} B`;
  }
  if (bytes < BYTES_PER_MB) {
    return `${(bytes / BYTES_PER_KB).toFixed(1)} KB`;
  }
  return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;
}

/** Stable locale for amount formatting (avoids SSR/client hydration mismatches). */
const AMOUNT_LOCALE = 'en-US';

/** Formats a decimal amount string or number for display. */
export function formatAmount(value: string | number | null | undefined): string {
  if (value == null || value === '') {
    return '';
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(parsed)) {
    return String(value);
  }
  return parsed.toLocaleString(AMOUNT_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/** Formats expected square meters for list/card display; empty when unset. */
export function formatSqm(value: number | string | null | undefined): string {
  if (value == null || value === '') {
    return '';
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(parsed)) {
    return String(value);
  }
  return String(parsed);
}

/** Two-letter initials from a display name. */
export function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
}

/** Converts a date input value (YYYY-MM-DD) to an ISO string for the API, or undefined when empty. */
export function dateInputToIso(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return new Date(`${trimmed}T00:00:00.000Z`).toISOString();
}
