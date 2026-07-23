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
