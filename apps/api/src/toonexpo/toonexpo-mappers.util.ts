import {
  OrganizationType,
  PublicDisplayMode,
  ToonExpoRequestStatus,
  VenueMapPublicationStatus,
} from '@prisma/client';
import {
  SnapshotPublicDisplayModeWire,
  ToonExpoCompanyTypeWire,
} from './types/toonexpo-wire.types';

const COMPANY_TYPE_TO_WIRE: Partial<Record<OrganizationType, ToonExpoCompanyTypeWire>> = {
  [OrganizationType.BUILDER]: 'builder',
  [OrganizationType.PARTNER]: 'partner',
  [OrganizationType.BANK]: 'bank',
};

const DISPLAY_MODE_TO_WIRE: Record<PublicDisplayMode, SnapshotPublicDisplayModeWire> = {
  [PublicDisplayMode.ORGANIZATION]: 'organization',
  [PublicDisplayMode.CUSTOM_LABEL]: 'custom_label',
  [PublicDisplayMode.HIDDEN]: 'hidden',
};

const PROVISIONING_STATUS_FROM_WIRE: Record<string, ToonExpoRequestStatus> = {
  success: ToonExpoRequestStatus.SUCCESS,
  linked_existing: ToonExpoRequestStatus.LINKED_EXISTING,
  failed: ToonExpoRequestStatus.FAILED,
};

const PUBLISH_STATUS_FROM_WIRE: Record<string, VenueMapPublicationStatus> = {
  published: VenueMapPublicationStatus.PUBLISHED,
  already_published: VenueMapPublicationStatus.ALREADY_PUBLISHED,
  rejected: VenueMapPublicationStatus.REJECTED,
  failed: VenueMapPublicationStatus.FAILED,
};

/** Maps our `OrganizationType` to ToonExpo's wire `company_type`; throws for `OTHER` (never sent). */
export function mapCompanyTypeToWire(companyType: OrganizationType): ToonExpoCompanyTypeWire {
  const wire = COMPANY_TYPE_TO_WIRE[companyType];
  if (!wire) {
    throw new Error(`Organization type "${companyType}" cannot be sent to ToonExpo.`);
  }
  return wire;
}

export function mapDisplayModeToWire(mode: PublicDisplayMode): SnapshotPublicDisplayModeWire {
  return DISPLAY_MODE_TO_WIRE[mode];
}

/** Unknown/unexpected statuses are treated as FAILED, per the agreed contract. */
export function mapProvisioningStatusFromWire(status: string): ToonExpoRequestStatus {
  return PROVISIONING_STATUS_FROM_WIRE[status] ?? ToonExpoRequestStatus.FAILED;
}

export function mapPublishStatusFromWire(status: string): VenueMapPublicationStatus {
  return PUBLISH_STATUS_FROM_WIRE[status] ?? VenueMapPublicationStatus.FAILED;
}
