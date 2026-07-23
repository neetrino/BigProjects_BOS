const DATE_ONLY_LENGTH = 10;

/** Formats an ISO date string for display; returns empty string when null. */
export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return value.slice(0, DATE_ONLY_LENGTH);
}

/** Converts a date input value (YYYY-MM-DD) to an ISO string for the API, or undefined when empty. */
export function dateInputToIso(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return new Date(`${trimmed}T00:00:00.000Z`).toISOString();
}
