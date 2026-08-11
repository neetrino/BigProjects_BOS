import { apiFetch } from './client';
import type { CreateDealInput, DealListItem, ListDealsQuery, UpdateDealInput } from './types';

const DEALS_BASE = '/api/v1/deals';

export async function listDeals(query: ListDealsQuery): Promise<DealListItem[]> {
  const params = new URLSearchParams();
  params.set('cycleId', query.cycleId);
  if (query.search) {
    params.set('search', query.search);
  }
  if (query.assignedStaffId) {
    params.set('assignedStaffId', query.assignedStaffId);
  }
  if (query.stage) {
    params.set('stage', query.stage);
  }

  return apiFetch<DealListItem[]>(`${DEALS_BASE}?${params.toString()}`);
}

export async function getDeal(id: string): Promise<DealListItem> {
  return apiFetch<DealListItem>(`${DEALS_BASE}/${id}`);
}

export async function createDeal(input: CreateDealInput): Promise<DealListItem> {
  return apiFetch<DealListItem>(DEALS_BASE, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateDeal(id: string, input: UpdateDealInput): Promise<DealListItem> {
  return apiFetch<DealListItem>(`${DEALS_BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteDeal(id: string): Promise<void> {
  await apiFetch<void>(`${DEALS_BASE}/${id}`, {
    method: 'DELETE',
  });
}
