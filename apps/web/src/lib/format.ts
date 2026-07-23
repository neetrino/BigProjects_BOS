const DATE_ONLY_LENGTH = 10;
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * 1024;

/** Formats an ISO date string for display; returns empty string when null. */
export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return value.slice(0, DATE_ONLY_LENGTH);
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

/** Formats a decimal amount string or number for display. */
export function formatAmount(value: string | number | null | undefined): string {
  if (value == null || value === '') {
    return '';
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(parsed)) {
    return String(value);
  }
  return parsed.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
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
