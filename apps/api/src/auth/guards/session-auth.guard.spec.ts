import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { SESSION_COOKIE_NAME } from '../../common/constants/auth.constants';
import { AuthenticatedRequest } from '../../common/types/authenticated-request.type';
import { AuthService } from '../auth.service';
import { SessionAuthGuard } from './session-auth.guard';

const buildContext = (request: Partial<AuthenticatedRequest>, isPublic: boolean): ExecutionContext =>
  ({
    getHandler: () => (isPublic ? { __public: true } : {}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe('SessionAuthGuard', () => {
  let guard: SessionAuthGuard;
  let authService: { validateSession: jest.Mock };
  let reflector: Reflector;

  beforeEach(() => {
    authService = { validateSession: jest.fn() };
    reflector = new Reflector();
    guard = new SessionAuthGuard(reflector, authService as unknown as AuthService);
  });

  it('allows public routes without checking a cookie', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const context = buildContext({}, true);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(authService.validateSession).not.toHaveBeenCalled();
  });

  it('rejects when no session cookie is present', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const context = buildContext({ cookies: {} }, false);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects when the session token does not validate', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    authService.validateSession.mockResolvedValue(null);
    const context = buildContext({ cookies: { [SESSION_COOKIE_NAME]: 'bad-token' } }, false);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('attaches the resolved user and session id on a valid token', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const user = {
      id: 'user-1',
      name: 'Admin',
      email: 'admin@bigprojects.local',
      role: UserRole.ADMIN,
      locale: 'en',
    };
    authService.validateSession.mockResolvedValue({ user, sessionId: 'session-1' });
    const request: Partial<AuthenticatedRequest> = { cookies: { [SESSION_COOKIE_NAME]: 'good-token' } };
    const context = buildContext(request, false);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual(user);
    expect(request.sessionId).toBe('session-1');
  });
});
