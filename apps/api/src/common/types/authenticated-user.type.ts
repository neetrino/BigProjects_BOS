import { UserRole } from '@prisma/client';

/**
 * Shape of the current user as attached to the request by `SessionAuthGuard`,
 * and as returned by the login and `/auth/me` endpoints.
 */
export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  locale: string;
};
