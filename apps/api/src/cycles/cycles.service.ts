import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventCycle, EventCycleStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { CycleResponseDto } from './dto/cycle-response.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';

const PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE = 'P2002';
const DUPLICATE_CODE_MESSAGE = 'An event cycle with this code already exists.';
const CYCLE_NOT_FOUND_MESSAGE = 'Event cycle not found.';
const INVALID_STATUS_TRANSITION_MESSAGE =
  'Invalid status transition. Allowed transitions: DRAFT to ACTIVE, ACTIVE to CLOSED.';

const ALLOWED_STATUS_TRANSITIONS: Record<EventCycleStatus, EventCycleStatus[]> = {
  [EventCycleStatus.DRAFT]: [EventCycleStatus.ACTIVE],
  [EventCycleStatus.ACTIVE]: [EventCycleStatus.CLOSED],
  [EventCycleStatus.CLOSED]: [],
};

@Injectable()
export class CyclesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<CycleResponseDto[]> {
    const cycles = await this.prisma.eventCycle.findMany({ orderBy: { createdAt: 'desc' } });
    return cycles.map((cycle) => this.toResponse(cycle));
  }

  async create(dto: CreateCycleDto): Promise<CycleResponseDto> {
    try {
      const cycle = await this.prisma.eventCycle.create({
        data: {
          name: dto.name,
          code: dto.code,
          status: EventCycleStatus.DRAFT,
          startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
          endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        },
      });
      return this.toResponse(cycle);
    } catch (error: unknown) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new ConflictException(DUPLICATE_CODE_MESSAGE);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateCycleDto): Promise<CycleResponseDto> {
    const existing = await this.prisma.eventCycle.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(CYCLE_NOT_FOUND_MESSAGE);
    }

    if (dto.status !== undefined) {
      this.assertValidStatusTransition(existing.status, dto.status);
    }

    const data: Prisma.EventCycleUpdateInput = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.code !== undefined && { code: dto.code }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.startsAt !== undefined && { startsAt: new Date(dto.startsAt) }),
      ...(dto.endsAt !== undefined && { endsAt: new Date(dto.endsAt) }),
    };

    try {
      const cycle = await this.prisma.eventCycle.update({ where: { id }, data });
      return this.toResponse(cycle);
    } catch (error: unknown) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new ConflictException(DUPLICATE_CODE_MESSAGE);
      }
      throw error;
    }
  }

  assertValidStatusTransition(current: EventCycleStatus, next: EventCycleStatus): void {
    if (current === next) {
      return;
    }

    if (!ALLOWED_STATUS_TRANSITIONS[current].includes(next)) {
      throw new BadRequestException(INVALID_STATUS_TRANSITION_MESSAGE);
    }
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE
    );
  }

  private toResponse(cycle: EventCycle): CycleResponseDto {
    return {
      id: cycle.id,
      name: cycle.name,
      code: cycle.code,
      status: cycle.status,
      startsAt: cycle.startsAt,
      endsAt: cycle.endsAt,
      createdAt: cycle.createdAt,
      updatedAt: cycle.updatedAt,
    };
  }
}
