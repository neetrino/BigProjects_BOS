import { Request } from 'express';
import { AuthenticatedUser } from './authenticated-user.type';

/**
 * Express request as seen by handlers running after `SessionAuthGuard`.
 * `user` and `sessionId` are absent on routes marked `@Public()`.
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  sessionId?: string;
}
