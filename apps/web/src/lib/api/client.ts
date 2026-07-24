const DEFAULT_API_URL = 'http://localhost:4000';
const LOGIN_PATH = '/login';
const AUTH_ME_PATH = '/api/v1/auth/me';

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type ApiFetchOptions = RequestInit & {
  /** When false, 401 does not redirect (used by login and server auth check). */
  redirectOn401?: boolean;
};

let sessionConfirmInFlight: Promise<boolean> | null = null;

function resolveRequestUrl(path: string): string {
  if (typeof window !== 'undefined') {
    return path;
  }

  const base = process.env.API_URL ?? DEFAULT_API_URL;
  return `${base}${path}`;
}

function extractErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') {
    return fallback;
  }

  const message = (body as { message?: unknown }).message;
  if (typeof message === 'string' && message.length > 0) {
    return message;
  }

  if (Array.isArray(message) && message.length > 0) {
    return (
      message.filter((item): item is string => typeof item === 'string').join(', ') || fallback
    );
  }

  return fallback;
}

/**
 * Confirms whether the session is truly gone before forcing login.
 * Network / rate-limit errors must not log the user out.
 */
async function confirmSessionAlive(): Promise<boolean> {
  if (!sessionConfirmInFlight) {
    sessionConfirmInFlight = fetch(resolveRequestUrl(AUTH_ME_PATH), {
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
      .then((response) => response.status !== 401)
      .catch(() => true)
      .finally(() => {
        sessionConfirmInFlight = null;
      });
  }

  return sessionConfirmInFlight;
}

/**
 * Shared fetch wrapper for NestJS `/api/v1` routes.
 * Browser calls stay same-origin (rewritten by Next). Server calls use `API_URL`.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { redirectOn401 = true, headers, ...rest } = options;
  const response = await fetch(resolveRequestUrl(path), {
    ...rest,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
  });

  if (response.status === 401 && redirectOn401 && typeof window !== 'undefined') {
    const sessionAlive = await confirmSessionAlive();
    if (!sessionAlive) {
      window.location.assign(LOGIN_PATH);
    }
    throw new ApiError(401, 'Unauthorized');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const hasJson = contentType.includes('application/json');
  const body: unknown = hasJson ? await response.json() : undefined;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      extractErrorMessage(body, `Request failed with status ${response.status}`),
      body,
    );
  }

  return body as T;
}
