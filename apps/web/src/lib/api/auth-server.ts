import { cookies } from 'next/headers';
import { apiFetch } from './client';
import type { CurrentUser } from './types';

/** Server-side session check: forwards cookies to the API. Returns null when unauthenticated. */
export async function fetchCurrentUserServer(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    return null;
  }

  try {
    return await apiFetch<CurrentUser>('/api/v1/auth/me', {
      headers: { Cookie: cookieHeader },
      cache: 'no-store',
      redirectOn401: false,
    });
  } catch {
    return null;
  }
}
