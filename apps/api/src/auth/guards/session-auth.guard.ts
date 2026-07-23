import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SESSION_COOKIE_NAME } from '../../common/constants/auth.constants';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.type';
import { AuthService } from '../auth.service';

const AUTH_REQUIRED_MESSAGE = 'Authentication required.';

/**
 * Global guard: reads the session cookie, validates it against the `Session` table (via
 * `AuthService`), and attaches the resolved user + session id to the request. Routes marked
 * `@Public()` (login, health) skip this check entirely.
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.[SESSION_COOKIE_NAME];

    if (typeof token !== 'string' || token.length === 0) {
      throw new UnauthorizedException(AUTH_REQUIRED_MESSAGE);
    }

    const validated = await this.authService.validateSession(token);
    if (!validated) {
      throw new UnauthorizedException(AUTH_REQUIRED_MESSAGE);
    }

    request.user = validated.user;
    request.sessionId = validated.sessionId;
    return true;
  }
}
