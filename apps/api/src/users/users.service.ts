import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User, UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

const PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE = 'P2002';
const DUPLICATE_EMAIL_MESSAGE = 'A user with this email already exists.';
const USER_NOT_FOUND_MESSAGE = 'User not found.';
const SELF_DISABLE_MESSAGE = 'You cannot disable your own account.';
const SELF_DEMOTE_MESSAGE = 'You cannot change your own role.';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    return users.map((user) => this.toResponse(user));
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });

    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash,
          role: dto.role,
          status: UserStatus.ACTIVE,
        },
      });
      return this.toResponse(user);
    } catch (error: unknown) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new ConflictException(DUPLICATE_EMAIL_MESSAGE);
      }
      throw error;
    }
  }

  /**
   * Applies a partial update. Self-lockout protection ensures the acting admin can neither
   * disable nor demote their own account. Disabling a user deletes all of their sessions so an
   * already-open browser session is invalidated immediately, not just future logins.
   */
  async update(
    id: string,
    dto: UpdateUserDto,
    currentUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }

    this.assertNotSelfLockout(id, dto, currentUser);

    const data: Prisma.UserUpdateInput = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.role !== undefined && { role: dto.role }),
      ...(dto.status !== undefined && { status: dto.status }),
    };

    if (dto.password !== undefined) {
      data.passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    }

    const willBeDisabled = dto.status === UserStatus.DISABLED;
    const updated = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({ where: { id }, data });
      if (willBeDisabled) {
        await tx.session.deleteMany({ where: { userId: id } });
      }
      return user;
    });

    return this.toResponse(updated);
  }

  private assertNotSelfLockout(
    targetId: string,
    dto: UpdateUserDto,
    currentUser: AuthenticatedUser,
  ): void {
    if (targetId !== currentUser.id) {
      return;
    }

    if (dto.status === UserStatus.DISABLED) {
      throw new ForbiddenException(SELF_DISABLE_MESSAGE);
    }

    if (dto.role !== undefined && dto.role !== UserRole.ADMIN) {
      throw new ForbiddenException(SELF_DEMOTE_MESSAGE);
    }
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE
    );
  }

  private toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      locale: user.locale,
      createdAt: user.createdAt,
    };
  }
}
