import { apiFetch } from './client';
import type { OrganizationType } from './types';

export type ToonExpoRequestStatus = 'PENDING' | 'SUCCESS' | 'LINKED_EXISTING' | 'FAILED';

export type ToonExpoModule =
  | 'builder_portal'
  | 'constructor_crm'
  | 'readiness'
  | 'partner_profile'
  | 'bank_offers'
  | 'analytics';

export type VenueMapPublicationStatus =
  | 'PENDING'
  | 'PUBLISHED'
  | 'ALREADY_PUBLISHED'
  | 'REJECTED'
  | 'FAILED';

export type ProvisioningRequest = {
  id: string;
  organizationId: string;
  eventCycleId: string;
  companyType: OrganizationType;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  requestedModules: string[];
  status: ToonExpoRequestStatus;
  toonexpoCompanyId: string | null;
  toonexpoUserId: string | null;
  errorMessage: string | null;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
};

export type VenueMapPublication = {
  id: string;
  venuePlanId: string;
  snapshotVersion: number;
  checksum: string;
  status: VenueMapPublicationStatus;
  toonexpoSnapshotId: string | null;
  errorMessage: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateProvisioningRequestInput = {
  organizationId: string;
  eventCycleId: string;
  companyType?: OrganizationType;
  requestedModules: ToonExpoModule[];
};

export type ListProvisioningRequestsQuery = {
  organizationId?: string;
  cycleId?: string;
};

const TOONEXPO_BASE = '/api/v1/toonexpo';

export async function listProvisioningRequests(
  query: ListProvisioningRequestsQuery = {},
): Promise<ProvisioningRequest[]> {
  const params = new URLSearchParams();
  if (query.organizationId) {
    params.set('organizationId', query.organizationId);
  }
  if (query.cycleId) {
    params.set('cycleId', query.cycleId);
  }
  const suffix = params.size > 0 ? `?${params.toString()}` : '';
  return apiFetch<ProvisioningRequest[]>(`${TOONEXPO_BASE}/provisioning-requests${suffix}`);
}

export async function createProvisioningRequest(
  input: CreateProvisioningRequestInput,
): Promise<ProvisioningRequest> {
  return apiFetch<ProvisioningRequest>(`${TOONEXPO_BASE}/provisioning-requests`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function retryProvisioningRequest(id: string): Promise<ProvisioningRequest> {
  return apiFetch<ProvisioningRequest>(`${TOONEXPO_BASE}/provisioning-requests/${id}/retry`, {
    method: 'POST',
  });
}

export async function publishVenueMap(planId: string): Promise<VenueMapPublication> {
  return apiFetch<VenueMapPublication>(`${TOONEXPO_BASE}/venue-plans/${planId}/publish`, {
    method: 'POST',
  });
}

export async function listVenueMapPublications(planId: string): Promise<VenueMapPublication[]> {
  return apiFetch<VenueMapPublication[]>(`${TOONEXPO_BASE}/venue-plans/${planId}/publications`);
}
