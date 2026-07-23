import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  argon2id: 2,
}));

const admin: AuthenticatedUser = {
  id: 'admin-1',
  name: 'Admin',
  email: 'admin@bigprojects.local',
  role: UserRole.ADMIN,
  locale: 'en',
};

const existingUser = {
  id: 'staff-1',
  name: 'Staff Member',
  email: 'staff@bigprojects.local',
  passwordHash: 'stored-hash',
  role: UserRole.STAFF,
  status: UserStatus.ACTIVE,
  locale: 'en',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: { findMany: jest.Mock; create: jest.Mock; findUnique: jest.Mock };
    $transaction: jest.Mock;
  };
  let tx: { user: { update: jest.Mock }; session: { deleteMany: jest.Mock } };

  beforeEach(async () => {
    jest.clearAllMocks();

    tx = { user: { update: jest.fn() }, session: { deleteMany: jest.fn() } };
    prisma = {
      user: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
      $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(tx)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(UsersService);
  });

  describe('create', () => {
    it('hashes the password and creates the user', async () => {
      prisma.user.create.mockResolvedValue(existingUser);

      const result = await service.create({
        name: existingUser.name,
        email: existingUser.email,
        password: 'a-strong-password',
        role: UserRole.STAFF,
      });

      expect(argon2.hash).toHaveBeenCalledWith('a-strong-password', { type: 2 });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: existingUser.name,
          email: existingUser.email,
          passwordHash: 'hashed-password',
          role: UserRole.STAFF,
          status: UserStatus.ACTIVE,
        },
      });
      expect(result.email).toBe(existingUser.email);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('maps a duplicate-email database error to a readable 409', async () => {
      const conflictError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      });
      prisma.user.create.mockRejectedValue(conflictError);

      await expect(
        service.create({
          name: 'Duplicate',
          email: existingUser.email,
          password: 'a-strong-password',
          role: UserRole.STAFF,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('throws when the target user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', {}, admin)).rejects.toThrow(NotFoundException);
    });

    it('prevents an admin from disabling their own account', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...existingUser, id: admin.id, role: UserRole.ADMIN });

      await expect(
        service.update(admin.id, { status: UserStatus.DISABLED }, admin),
      ).rejects.toThrow(ForbiddenException);
      expect(tx.user.update).not.toHaveBeenCalled();
    });

    it('prevents an admin from demoting their own role', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...existingUser, id: admin.id, role: UserRole.ADMIN });

      await expect(service.update(admin.id, { role: UserRole.STAFF }, admin)).rejects.toThrow(
        ForbiddenException,
      );
      expect(tx.user.update).not.toHaveBeenCalled();
    });

    it('allows an admin to update their own name', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...existingUser, id: admin.id, role: UserRole.ADMIN });
      tx.user.update.mockResolvedValue({ ...existingUser, id: admin.id, name: 'New Name' });

      const result = await service.update(admin.id, { name: 'New Name' }, admin);

      expect(result.name).toBe('New Name');
      expect(tx.session.deleteMany).not.toHaveBeenCalled();
    });

    it('deletes sessions when disabling a different user', async () => {
      prisma.user.findUnique.mockResolvedValue(existingUser);
      tx.user.update.mockResolvedValue({ ...existingUser, status: UserStatus.DISABLED });

      const result = await service.update(existingUser.id, { status: UserStatus.DISABLED }, admin);

      expect(result.status).toBe(UserStatus.DISABLED);
      expect(tx.session.deleteMany).toHaveBeenCalledWith({ where: { userId: existingUser.id } });
    });

    it('re-hashes the password when a password reset is provided', async () => {
      prisma.user.findUnique.mockResolvedValue(existingUser);
      tx.user.update.mockResolvedValue(existingUser);

      await service.update(existingUser.id, { password: 'brand-new-password' }, admin);

      expect(argon2.hash).toHaveBeenCalledWith('brand-new-password', { type: 2 });
      const updateArgs = tx.user.update.mock.calls[0][0];
      expect(updateArgs.data.passwordHash).toBe('hashed-password');
    });
  });
});
