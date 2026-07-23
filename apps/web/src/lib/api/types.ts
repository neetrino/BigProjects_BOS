export type UserRole = 'ADMIN' | 'STAFF';

export type UserStatus = 'ACTIVE' | 'DISABLED';

export type EventCycleStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export type OrganizationType = 'BUILDER' | 'BANK' | 'PARTNER' | 'OTHER';

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  locale: string;
};

export type UserAccount = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  locale: string;
  createdAt: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type UpdateUserInput = {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  password?: string;
};

export type EventCycle = {
  id: string;
  name: string;
  code: string;
  status: EventCycleStatus;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCycleInput = {
  name: string;
  code: string;
  startsAt?: string;
  endsAt?: string;
};

export type UpdateCycleInput = {
  name?: string;
  code?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  status?: EventCycleStatus;
};

export type OrganizationListItem = {
  id: string;
  name: string;
  type: OrganizationType;
  registrationId: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  toonexpoCompanyId: string | null;
  createdAt: string;
  updatedAt: string;
  contactCount: number;
};

export type OrganizationContact = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  position: string | null;
  isPrimary: boolean;
  createdAt: string;
};

export type OrganizationDetail = OrganizationListItem & {
  contacts: OrganizationContact[];
};

export type CreateOrganizationInput = {
  name: string;
  type: OrganizationType;
  registrationId?: string;
  phone?: string;
  email?: string;
  website?: string;
};

export type UpdateOrganizationInput = {
  name?: string;
  type?: OrganizationType;
  registrationId?: string;
  phone?: string;
  email?: string;
  website?: string;
};

export type CreateContactInput = {
  name: string;
  phone?: string;
  email?: string;
  position?: string;
  isPrimary?: boolean;
};

export type UpdateContactInput = {
  name?: string;
  phone?: string;
  email?: string;
  position?: string;
  isPrimary?: boolean;
};

export type ListOrganizationsQuery = {
  search?: string;
  type?: OrganizationType;
};

export type HealthResponse = {
  status: 'ok';
  timestamp: string;
  database: 'up' | 'down';
};

export type DealStage = 'NEW' | 'CONTACTED' | 'NEGOTIATION' | 'WON' | 'LOST';

export type ContentOwnerType = 'ORGANIZATION' | 'BUILDER_DEAL' | 'PARTNER_PARTICIPATION';

export type DealStaffRef = {
  id: string;
  name: string;
};

export type DealContactRef = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
};

export type DealAreasSummary = {
  count: number;
  totalSqm: number;
  labels: string[];
};

export type DealListItem = {
  id: string;
  eventCycleId: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    type: OrganizationType;
  };
  primaryContact: DealContactRef | null;
  assignedStaff: DealStaffRef | null;
  stage: DealStage;
  expectedSqm: number | null;
  agreedAmount: string | number | null;
  description: string | null;
  areasSummary: DealAreasSummary;
  createdAt: string;
  updatedAt: string;
};

export type ListDealsQuery = {
  cycleId: string;
  search?: string;
  assignedStaffId?: string;
  stage?: DealStage;
};

export type CreateDealInput = {
  eventCycleId: string;
  organizationId: string;
  primaryContactId?: string;
  assignedStaffId?: string;
  expectedSqm?: number;
  agreedAmount?: string;
  description?: string;
};

export type UpdateDealInput = {
  stage?: DealStage;
  primaryContactId?: string | null;
  assignedStaffId?: string | null;
  expectedSqm?: number | null;
  agreedAmount?: string | null;
  description?: string | null;
};

export type NoteItem = {
  id: string;
  body: string;
  author: DealStaffRef;
  createdAt: string;
};

export type CreateNoteInput = {
  ownerType: ContentOwnerType;
  ownerId: string;
  body: string;
};

export type AttachmentItem = {
  id: string;
  originalFilename: string;
  contentType: string;
  size: number;
  uploader: DealStaffRef;
  createdAt: string;
};

export type PresignAttachmentInput = {
  ownerType: ContentOwnerType;
  ownerId: string;
  filename: string;
  contentType: string;
  size: number;
};

export type PresignAttachmentResponse = {
  objectKey: string;
  uploadUrl: string;
};

export type ConfirmAttachmentInput = {
  ownerType: ContentOwnerType;
  ownerId: string;
  objectKey: string;
  originalFilename: string;
  contentType: string;
  size: number;
};

export type AttachmentDownloadResponse = {
  downloadUrl: string;
};
