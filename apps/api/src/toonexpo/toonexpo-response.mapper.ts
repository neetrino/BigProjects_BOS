import { ToonExpoProvisioningRequest, VenueMapPublication } from '@prisma/client';
import { ProvisioningRequestResponseDto } from './dto/provisioning-request-response.dto';
import { VenueMapPublicationResponseDto } from './dto/venue-map-publication-response.dto';

export function toProvisioningResponse(
  row: ToonExpoProvisioningRequest,
): ProvisioningRequestResponseDto {
  return {
    id: row.id,
    organizationId: row.organizationId,
    eventCycleId: row.eventCycleId,
    companyType: row.companyType,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    requestedModules: row.requestedModules,
    status: row.status,
    toonexpoCompanyId: row.toonexpoCompanyId,
    toonexpoUserId: row.toonexpoUserId,
    errorMessage: row.errorMessage,
    attemptCount: row.attemptCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toPublicationResponse(row: VenueMapPublication): VenueMapPublicationResponseDto {
  return {
    id: row.id,
    venuePlanId: row.venuePlanId,
    snapshotVersion: row.snapshotVersion,
    checksum: row.checksum,
    status: row.status,
    toonexpoSnapshotId: row.toonexpoSnapshotId,
    errorMessage: row.errorMessage,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
