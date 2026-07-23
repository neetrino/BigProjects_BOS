import { apiFetch } from './client';
import type {
  CreateContactInput,
  CreateOrganizationInput,
  ListOrganizationsQuery,
  OrganizationContact,
  OrganizationDetail,
  OrganizationListItem,
  UpdateContactInput,
  UpdateOrganizationInput,
} from './types';

const ORGANIZATIONS_BASE = '/api/v1/organizations';
const CONTACTS_BASE = '/api/v1/contacts';

export async function listOrganizations(
  query: ListOrganizationsQuery = {},
): Promise<OrganizationListItem[]> {
  const params = new URLSearchParams();
  if (query.search) {
    params.set('search', query.search);
  }
  if (query.type) {
    params.set('type', query.type);
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : '';
  return apiFetch<OrganizationListItem[]>(`${ORGANIZATIONS_BASE}${suffix}`);
}

export async function getOrganization(id: string): Promise<OrganizationDetail> {
  return apiFetch<OrganizationDetail>(`${ORGANIZATIONS_BASE}/${id}`);
}

export async function createOrganization(
  input: CreateOrganizationInput,
): Promise<OrganizationListItem> {
  return apiFetch<OrganizationListItem>(ORGANIZATIONS_BASE, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateOrganization(
  id: string,
  input: UpdateOrganizationInput,
): Promise<OrganizationListItem> {
  return apiFetch<OrganizationListItem>(`${ORGANIZATIONS_BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function createContact(
  organizationId: string,
  input: CreateContactInput,
): Promise<OrganizationContact> {
  return apiFetch<OrganizationContact>(`${ORGANIZATIONS_BASE}/${organizationId}/contacts`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateContact(
  id: string,
  input: UpdateContactInput,
): Promise<OrganizationContact> {
  return apiFetch<OrganizationContact>(`${CONTACTS_BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteContact(id: string): Promise<void> {
  await apiFetch<void>(`${CONTACTS_BASE}/${id}`, {
    method: 'DELETE',
  });
}
