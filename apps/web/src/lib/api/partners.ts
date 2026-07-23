import { apiFetch } from './client';
import type {
  CreatePartnerInput,
  ListPartnersQuery,
  PartnerListItem,
  UpdatePartnerInput,
} from './types';

const PARTNERS_BASE = '/api/v1/partners';

export async function listPartners(query: ListPartnersQuery): Promise<PartnerListItem[]> {
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
  if (query.partnerType) {
    params.set('partnerType', query.partnerType);
  }

  return apiFetch<PartnerListItem[]>(`${PARTNERS_BASE}?${params.toString()}`);
}

export async function getPartner(id: string): Promise<PartnerListItem> {
  return apiFetch<PartnerListItem>(`${PARTNERS_BASE}/${id}`);
}

export async function createPartner(input: CreatePartnerInput): Promise<PartnerListItem> {
  return apiFetch<PartnerListItem>(PARTNERS_BASE, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updatePartner(
  id: string,
  input: UpdatePartnerInput,
): Promise<PartnerListItem> {
  return apiFetch<PartnerListItem>(`${PARTNERS_BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
