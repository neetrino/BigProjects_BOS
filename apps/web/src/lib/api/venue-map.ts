import { apiFetch } from './client';
import { putPresignedFile } from './attachments';

export type PublicDisplayMode = 'ORGANIZATION' | 'CUSTOM_LABEL' | 'HIDDEN';

export type AllocationKind = 'BUILDER' | 'PARTNER';

export type VenueCell = {
  x: number;
  y: number;
};

export type VenueAreaAllocation = {
  id: string;
  kind: AllocationKind;
  targetId: string;
  organizationName: string;
};

export type VenueSpaceArea = {
  id: string;
  code: string | null;
  name: string;
  squareMeters: number;
  publicDisplayMode: PublicDisplayMode;
  customPublicLabel: string | null;
  cells: VenueCell[];
  allocation: VenueAreaAllocation | null;
  createdAt: string;
};

export type VenuePlan = {
  id: string;
  eventCycleId: string;
  title: string;
  imageKey: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  pixelsPerMeter: number | null;
  gridOriginX: number;
  gridOriginY: number;
  publishStatus: string;
  imageUrl: string | null;
  areas: VenueSpaceArea[];
};

export type VenuePlanResponse = {
  plan: VenuePlan | null;
};

export type CreateVenuePlanInput = {
  eventCycleId: string;
  title: string;
};

export type UpdateVenuePlanInput = {
  title?: string;
  pixelsPerMeter?: number;
  gridOriginX?: number;
  gridOriginY?: number;
};

export type CreateSpaceAreaInput = {
  name: string;
  code?: string;
  cells: VenueCell[];
};

export type UpdateSpaceAreaInput = {
  name?: string;
  code?: string | null;
  publicDisplayMode?: PublicDisplayMode;
  customPublicLabel?: string | null;
};

export type CreateAllocationInput =
  | { builderDealId: string; partnerParticipationId?: never }
  | { partnerParticipationId: string; builderDealId?: never };

export type ImagePresignInput = {
  filename: string;
  contentType: string;
  size: number;
};

export type ImagePresignResponse = {
  objectKey: string;
  uploadUrl: string;
};

export type ConfirmImageInput = {
  objectKey: string;
  width: number;
  height: number;
};

const VENUE_PLANS_BASE = '/api/v1/venue-plans';
const SPACE_AREAS_BASE = '/api/v1/space-areas';
const SPACE_ALLOCATIONS_BASE = '/api/v1/space-allocations';

export async function getVenuePlan(cycleId: string): Promise<VenuePlanResponse> {
  const params = new URLSearchParams({ cycleId });
  return apiFetch<VenuePlanResponse>(`${VENUE_PLANS_BASE}?${params.toString()}`);
}

export async function createVenuePlan(input: CreateVenuePlanInput): Promise<VenuePlan> {
  return apiFetch<VenuePlan>(VENUE_PLANS_BASE, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateVenuePlan(id: string, input: UpdateVenuePlanInput): Promise<VenuePlan> {
  return apiFetch<VenuePlan>(`${VENUE_PLANS_BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function presignVenueImage(
  planId: string,
  input: ImagePresignInput,
): Promise<ImagePresignResponse> {
  return apiFetch<ImagePresignResponse>(`${VENUE_PLANS_BASE}/${planId}/image/presign`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function confirmVenueImage(
  planId: string,
  input: ConfirmImageInput,
): Promise<VenuePlan> {
  return apiFetch<VenuePlan>(`${VENUE_PLANS_BASE}/${planId}/image`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** Presign → PUT → confirm for a venue plan background image. */
export async function uploadVenuePlanImage(
  planId: string,
  file: File,
  width: number,
  height: number,
): Promise<VenuePlan> {
  const { objectKey, uploadUrl } = await presignVenueImage(planId, {
    filename: file.name,
    contentType: file.type || 'application/octet-stream',
    size: file.size,
  });
  await putPresignedFile(uploadUrl, file);
  return confirmVenueImage(planId, { objectKey, width, height });
}

export async function createSpaceArea(
  planId: string,
  input: CreateSpaceAreaInput,
): Promise<VenueSpaceArea> {
  return apiFetch<VenueSpaceArea>(`${VENUE_PLANS_BASE}/${planId}/areas`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateSpaceArea(
  id: string,
  input: UpdateSpaceAreaInput,
): Promise<VenueSpaceArea> {
  return apiFetch<VenueSpaceArea>(`${SPACE_AREAS_BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteSpaceArea(id: string): Promise<void> {
  await apiFetch<void>(`${SPACE_AREAS_BASE}/${id}`, { method: 'DELETE' });
}

export async function createSpaceAllocation(
  areaId: string,
  input: CreateAllocationInput,
): Promise<VenueAreaAllocation> {
  return apiFetch<VenueAreaAllocation>(`${SPACE_AREAS_BASE}/${areaId}/allocations`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function releaseSpaceAllocation(allocationId: string): Promise<void> {
  await apiFetch<void>(`${SPACE_ALLOCATIONS_BASE}/${allocationId}/release`, {
    method: 'POST',
  });
}
