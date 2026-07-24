import { createHash, randomBytes } from 'node:crypto';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Session, User, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import {
  DUMMY_PASSWORD_HASH,
  INVALID_CREDENTIALS_MESSAGE,
  SESSION_RENEWAL_THRESHOLD_MS,
  SESSION_TOKEN_BYTES,
  SESSION_TTL_MS,
} from '../common/constants/auth.constants';
import { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';

export type LoginResult = {
  token: string;
  user: AuthenticatedUser;
};

export type ValidatedSession = {
  user: AuthenticatedUser;
  sessionId: string;
};

type SessionWithUser = Session & { user: User };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verifies credentials and creates a new session row.
   * Always returns the same generic error for unknown email, wrong password, or a disabled
   * account, so responses cannot be used to enumerate which accounts exist or are active.
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    const passwordIsValid = await this.verifyPassword(user?.passwordHash, password);

    if (!user || !passwordIsValid || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const token = this.generateSessionToken();
    await this.prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(token),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });

    return { token, user: this.toAuthenticatedUser(user) };
  }

  /** Deletes a session row on logout. Idempotent: a already-gone session is not an error. */
  async logout(sessionId: string): Promise<void> {
    try {
      await this.prisma.session.delete({ where: { id: sessionId } });
    } catch (error: unknown) {
      this.logger.warn(`Failed to delete session ${sessionId} on logout: ${this.describe(error)}`);
    }
  }

  /**
   * Loads and validates a session by its raw token. Returns `null` for a missing, expired, or
   * owned-by-disabled-user session. Expired sessions are deleted lazily when encountered.
   * A valid session that is close to expiry is transparently renewed (sliding TTL).
   */
  async validateSession(token: string): Promise<ValidatedSession | null> {
    const session = await this.prisma.session.findUnique({
      where: { tokenHash: this.hashToken(token) },
      include: { user: true },
    });

    if (!session) {
      return null;
    }

    const now = new Date();
    if (session.expiresAt <= now) {
      await this.deleteExpiredSession(session.id);
      return null;
    }

    if (session.user.status !== UserStatus.ACTIVE) {
      return null;
    }

    await this.renewSessionIfNeeded(session, now);

    return { user: this.toAuthenticatedUser(session.user), sessionId: session.id };
  }

  private async deleteExpiredSession(sessionId: string): Promise<void> {
    try {
      await this.prisma.session.delete({ where: { id: sessionId } });
    } catch (error: unknown) {
      this.logger.warn(`Failed to delete expired session ${sessionId}: ${this.describe(error)}`);
    }
  }

  /**
   * Sliding renewal: extend when less than half the TTL remains.
   * Caps writes to roughly once per ~3.5 days of active use.
   */
  private async renewSessionIfNeeded(session: SessionWithUser, now: Date): Promise<void> {
    const remainingMs = session.expiresAt.getTime() - now.getTime();
    if (remainingMs >= SESSION_RENEWAL_THRESHOLD_MS) {
      return;
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: new Date(now.getTime() + SESSION_TTL_MS) },
    });
  }

  private async verifyPassword(
    passwordHash: string | undefined,
    password: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(passwordHash ?? DUMMY_PASSWORD_HASH, password);
    } catch (error: unknown) {
      this.logger.warn(`Argon2 verification failed: ${this.describe(error)}`);
      return false;
    }
  }

  private generateSessionToken(): string {
    return randomBytes(SESSION_TOKEN_BYTES).toString('base64url');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private toAuthenticatedUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      locale: user.locale,
    };
  }

  private describe(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
