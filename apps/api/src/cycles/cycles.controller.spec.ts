import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { CyclesController } from './cycles.controller';

describe('CyclesController role metadata', () => {
  const reflector = new Reflector();

  it('does not restrict GET list to ADMIN', () => {
    const roles = reflector.get<UserRole[] | undefined>(ROLES_KEY, CyclesController.prototype.list);
    expect(roles).toBeUndefined();
  });

  it('requires ADMIN for POST create', () => {
    const roles = reflector.get<UserRole[]>(ROLES_KEY, CyclesController.prototype.create);
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('requires ADMIN for PATCH update', () => {
    const roles = reflector.get<UserRole[]>(ROLES_KEY, CyclesController.prototype.update);
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('requires ADMIN for DELETE remove', () => {
    const roles = reflector.get<UserRole[]>(ROLES_KEY, CyclesController.prototype.remove);
    expect(roles).toEqual([UserRole.ADMIN]);
  });
});
