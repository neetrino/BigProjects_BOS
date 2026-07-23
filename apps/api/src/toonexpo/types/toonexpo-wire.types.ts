/**
 * Wire-format (snake_case) request/response shapes for ToonExpo's real integration
 * endpoints. These types mirror ToonExpo's contract exactly and are only used at the
 * boundary of {@link ../toonexpo-client.service}; internal code stays camelCase.
 */

export const TOONEXPO_MODULES = [
  'builder_portal',
  'constructor_crm',
  'readiness',
  'partner_profile',
  'bank_offers',
  'analytics',
] as const;

export type ToonExpoModuleWire = (typeof TOONEXPO_MODULES)[number];

export type ToonExpoCompanyTypeWire = 'builder' | 'partner' | 'bank';

export type ToonExpoProvisioningStatusWire = 'success' | 'linked_existing' | 'failed';

export interface ToonExpoProvisioningRequestWire {
  request_id: string;
  bos_company_id: string;
  company_name: string;
  company_type: ToonExpoCompanyTypeWire;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone?: string;
  event_cycle_id?: string;
  event_cycle_name?: string;
  requested_modules: ToonExpoModuleWire[];
}

export interface ToonExpoProvisioningResponseWire {
  request_id: string;
  toonexpo_company_id: string | null;
  primary_user_id: string | null;
  status: ToonExpoProvisioningStatusWire | string;
  error_message?: string;
  created_at: string;
}

export type SnapshotPublicDisplayModeWire = 'organization' | 'custom_label' | 'hidden';

export interface SnapshotOccupantWire {
  toonexpo_company_id?: string;
  organization_name: string;
}

export interface SnapshotCellWire {
  x: number;
  y: number;
}

export interface SnapshotAreaWire {
  code: string;
  name?: string;
  square_meters: number;
  cells: SnapshotCellWire[];
  public_display_mode: SnapshotPublicDisplayModeWire;
  occupant?: SnapshotOccupantWire;
  custom_label?: string;
}

export interface SnapshotBackgroundWire {
  url: string;
  width: number;
  height: number;
  pixels_per_meter: number;
  grid_origin_x: number;
  grid_origin_y: number;
}

export interface SnapshotContentWire {
  title: string;
  background: SnapshotBackgroundWire;
  areas: SnapshotAreaWire[];
}

export type VenueMapPublishStatusWire = 'published' | 'already_published' | 'rejected' | 'failed';

export interface VenueMapPublishRequestWire {
  request_id: string;
  schema_version: 'venue-map.v1';
  bos_venue_plan_id: string;
  bos_event_cycle_id: string;
  bos_event_cycle_code: string;
  snapshot_version: number;
  checksum: string;
  published_at: string;
  content: SnapshotContentWire;
}

export interface VenueMapPublishResponseWire {
  request_id: string;
  bos_venue_plan_id: string;
  accepted_snapshot_version: number;
  toonexpo_snapshot_id: string | null;
  status: VenueMapPublishStatusWire | string;
  validation_errors?: string[];
  activated_at?: string;
}
