import { apiFetch } from './client';
import type { CreateCycleInput, EventCycle, UpdateCycleInput } from './types';

const CYCLES_BASE = '/api/v1/cycles';

export async function listCycles(): Promise<EventCycle[]> {
  return apiFetch<EventCycle[]>(CYCLES_BASE);
}

export async function createCycle(input: CreateCycleInput): Promise<EventCycle> {
  return apiFetch<EventCycle>(CYCLES_BASE, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateCycle(id: string, input: UpdateCycleInput): Promise<EventCycle> {
  return apiFetch<EventCycle>(`${CYCLES_BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteCycle(id: string): Promise<void> {
  await apiFetch<void>(`${CYCLES_BASE}/${id}`, {
    method: 'DELETE',
  });
}
