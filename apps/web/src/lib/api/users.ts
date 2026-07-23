import { apiFetch } from './client';
import type { CreateUserInput, UpdateUserInput, UserAccount } from './types';

const USERS_BASE = '/api/v1/users';

export async function listUsers(): Promise<UserAccount[]> {
  return apiFetch<UserAccount[]>(USERS_BASE);
}

export async function createUser(input: CreateUserInput): Promise<UserAccount> {
  return apiFetch<UserAccount>(USERS_BASE, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<UserAccount> {
  return apiFetch<UserAccount>(`${USERS_BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
