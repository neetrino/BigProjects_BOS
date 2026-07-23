import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import {
  DUMMY_PASSWORD_HASH,
  SESSION_RENEWAL_THRESHOLD_MS,
  SESSION_TTL_MS,
} from '../common/constants/auth.constants';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('argon2', () => ({
  verify: jest.fn(),
  hash: jest.fn(),
  argon2id: 2,
}));

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const baseUser = {
  id: 'user-1',
  name: 'Admin User',
  email: 'admin@bigprojects.local',
  passwordHash: 'stored-hash',
  role: UserRole.ADMIN,
  status: UserStatus.ACTIVE,
  locale: 'en',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { findUnique: jest.Mock };
    session: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock; delete: jest.Mock };
  };
  const verifyMock = argon2.verify as jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      user: { findUnique: jest.fn() },
      session: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AuthService);
  });

  describe('login', () => {
    it('creates a session and returns the current user on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);
      verifyMock.mockResolvedValue(true);
      prisma.session.create.mockResolvedValue({});

      const result = await service.login(baseUser.email, 'correct-password');

      expect(result.user).toEqual({
        id: baseUser.id,
        name: baseUser.name,
        email: baseUser.email,
        role: baseUser.role,
        locale: baseUser.locale,
      });
      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(0);
      expect(verifyMock).toHaveBeenCalledWith(baseUser.passwordHash, 'correct-password');
      expect(prisma.session.create).toHaveBeenCalledTimes(1);
      const createArgs = prisma.session.create.mock.calls[0][0];
      expect(createArgs.data.userId).toBe(baseUser.id);
      expect(createArgs.data.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('rejects with a generic message and enumeration-safe timing when the email is unknown', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      verifyMock.mockResolvedValue(false);

      await expect(service.login('nobody@bigprojects.local', 'whatever')).rejects.toThrow(
        UnauthorizedException,
      );

      // Still runs an Argon2 verification against the fixed dummy hash so timing does not
      // reveal whether the email exists.
      expect(verifyMock).toHaveBeenCalledWith(DUMMY_PASSWORD_HASH, 'whatever');
      expect(prisma.session.create).not.toHaveBeenCalled();
    });

    it('rejects with the same generic message on a wrong password for a known email', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);
      verifyMock.mockResolvedValue(false);

      await expect(service.login(baseUser.email, 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.session.create).not.toHaveBeenCalled();
    });

    it('rejects a disabled user even with the correct password', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser, status: UserStatus.DISABLED });
      verifyMock.mockResolvedValue(true);

      await expect(service.login(baseUser.email, 'correct-password')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.session.create).not.toHaveBeenCalled();
    });
  });

  describe('validateSession', () => {
    const buildSession = (
      overrides: Partial<{ expiresAt: Date; userStatus: UserStatus }> = {},
    ) => ({
      id: 'session-1',
      userId: baseUser.id,
      tokenHash: 'hash',
      expiresAt: overrides.expiresAt ?? new Date(Date.now() + SESSION_TTL_MS),
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { ...baseUser, status: overrides.userStatus ?? UserStatus.ACTIVE },
    });

    it('returns null when no session matches the token', async () => {
      prisma.session.findUnique.mockResolvedValue(null);

      const result = await service.validateSession('unknown-token');

      expect(result).toBeNull();
    });

    it('deletes and rejects an expired session', async () => {
      const expired = buildSession({ expiresAt: new Date(Date.now() - 1000) });
      prisma.session.findUnique.mockResolvedValue(expired);
      prisma.session.delete.mockResolvedValue({});

      const result = await service.validateSession('expired-token');

      expect(result).toBeNull();
      expect(prisma.session.delete).toHaveBeenCalledWith({ where: { id: expired.id } });
    });

    it('rejects a session belonging to a disabled user', async () => {
      const session = buildSession({ userStatus: UserStatus.DISABLED });
      prisma.session.findUnique.mockResolvedValue(session);

      const result = await service.validateSession('token');

      expect(result).toBeNull();
      expect(prisma.session.update).not.toHaveBeenCalled();
    });

    it('does not renew a session with 6+ days remaining', async () => {
      const session = buildSession({
        expiresAt: new Date(Date.now() + SESSION_RENEWAL_THRESHOLD_MS + MS_PER_DAY),
      });
      prisma.session.findUnique.mockResolvedValue(session);

      const result = await service.validateSession('token');

      expect(result?.sessionId).toBe(session.id);
      expect(prisma.session.update).not.toHaveBeenCalled();
    });

    it('slides the expiry back to the full TTL when less than 6 days remain', async () => {
      const session = buildSession({
        expiresAt: new Date(Date.now() + SESSION_RENEWAL_THRESHOLD_MS - MS_PER_DAY),
      });
      prisma.session.findUnique.mockResolvedValue(session);
      prisma.session.update.mockResolvedValue({});

      const result = await service.validateSession('token');

      expect(result?.sessionId).toBe(session.id);
      expect(prisma.session.update).toHaveBeenCalledTimes(1);
      const updateArgs = prisma.session.update.mock.calls[0][0];
      expect(updateArgs.where).toEqual({ id: session.id });
      expect(updateArgs.data.expiresAt.getTime()).toBeGreaterThan(
        Date.now() + SESSION_TTL_MS - 1000,
      );
    });
  });

  describe('logout', () => {
    it('deletes the session row', async () => {
      prisma.session.delete.mockResolvedValue({});

      await service.logout('session-1');

      expect(prisma.session.delete).toHaveBeenCalledWith({ where: { id: 'session-1' } });
    });

    it('does not throw if the session is already gone', async () => {
      prisma.session.delete.mockRejectedValue(new Error('Record not found'));

      await expect(service.logout('missing-session')).resolves.toBeUndefined();
    });
  });
});
