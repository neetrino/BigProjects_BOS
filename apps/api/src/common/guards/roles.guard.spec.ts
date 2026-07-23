import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '../types/authenticated-request.type';
import { RolesGuard } from './roles.guard';

const buildContext = (request: Partial<AuthenticatedRequest>): ExecutionContext =>
  ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('allows the request when no @Roles metadata is present', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = buildContext({});

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows a request whose user has one of the required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const context = buildContext({
      user: { id: '1', name: 'Admin', email: 'a@b.c', role: UserRole.ADMIN, locale: 'en' },
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects a request whose user role does not match', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const context = buildContext({
      user: { id: '1', name: 'Staff', email: 'a@b.c', role: UserRole.STAFF, locale: 'en' },
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('rejects a request with no user attached', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const context = buildContext({});

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
