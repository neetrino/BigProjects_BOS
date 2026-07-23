import { apiFetch } from './client';
import type { CurrentUser } from './types';

const AUTH_BASE = '/api/v1/auth';

export type LoginInput = {
  email: string;
  password: string;
};

export async function login(input: LoginInput): Promise<CurrentUser> {
  return apiFetch<CurrentUser>(`${AUTH_BASE}/login`, {
    method: 'POST',
    body: JSON.stringify(input),
    redirectOn401: false,
  });
}

export async function logout(): Promise<void> {
  await apiFetch<void>(`${AUTH_BASE}/logout`, {
    method: 'POST',
    redirectOn401: false,
  });
}

export async function fetchCurrentUserClient(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>(`${AUTH_BASE}/me`);
}
