import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DealStage, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpaceAllocationDto } from './dto/create-space-allocation.dto';
import { SpaceAllocationResponseDto } from './dto/space-allocation-response.dto';
import { mapAllocationToResponse } from './mappers/space-allocation.mapper';

const EXACTLY_ONE_TARGET_MESSAGE =
  'Provide exactly one of builderDealId or partnerParticipationId.';
const AREA_NOT_FOUND_MESSAGE = 'Space area not found.';
const AREA_ALREADY_ASSIGNED_MESSAGE = 'This area is already assigned. Release it first.';
const DEAL_NOT_FOUND_MESSAGE = 'Builder deal not found.';
const PARTNER_NOT_FOUND_MESSAGE = 'Partner participation not found.';
const CYCLE_MISMATCH_MESSAGE =
  'The target does not belong to the same event cycle as the venue plan.';
const DEAL_LOST_MESSAGE = 'Cannot assign an area to a lost builder deal.';
const ALLOCATION_NOT_FOUND_MESSAGE = 'Space allocation not found.';
const ALREADY_RELEASED_MESSAGE = 'This allocation is already released.';
const PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE = 'P2002';

@Injectable()
export class SpaceAllocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async assign(
    spaceAreaId: string,
    dto: CreateSpaceAllocationDto,
  ): Promise<SpaceAllocationResponseDto> {
    this.assertExactlyOneTarget(dto);

    const area = await this.prisma.spaceArea.findUnique({
      where: { id: spaceAreaId },
      include: { venuePlan: true, allocations: { where: { active: true } } },
    });
    if (!area) {
      throw new NotFoundException(AREA_NOT_FOUND_MESSAGE);
    }
    if (area.allocations.length > 0) {
      throw new ConflictException(AREA_ALREADY_ASSIGNED_MESSAGE);
    }

    if (dto.builderDealId) {
      await this.assertDealIsAssignable(dto.builderDealId, area.venuePlan.eventCycleId);
    } else {
      await this.assertPartnerIsAssignable(
        dto.partnerParticipationId as string,
        area.venuePlan.eventCycleId,
      );
    }

    try {
      const allocation = await this.prisma.spaceAllocation.create({
        data: {
          spaceAreaId,
          builderDealId: dto.builderDealId ?? null,
          partnerParticipationId: dto.partnerParticipationId ?? null,
        },
      });
      return mapAllocationToResponse(allocation);
    } catch (error: unknown) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new ConflictException(AREA_ALREADY_ASSIGNED_MESSAGE);
      }
      throw error;
    }
  }

  async release(id: string): Promise<SpaceAllocationResponseDto> {
    const allocation = await this.prisma.spaceAllocation.findUnique({ where: { id } });
    if (!allocation) {
      throw new NotFoundException(ALLOCATION_NOT_FOUND_MESSAGE);
    }
    if (!allocation.active) {
      throw new ConflictException(ALREADY_RELEASED_MESSAGE);
    }

    const released = await this.prisma.spaceAllocation.update({
      where: { id },
      data: { active: false, releasedAt: new Date() },
    });

    return mapAllocationToResponse(released);
  }

  private assertExactlyOneTarget(dto: CreateSpaceAllocationDto): void {
    const targetCount = [dto.builderDealId, dto.partnerParticipationId].filter(
      (value) => value !== undefined,
    ).length;

    if (targetCount !== 1) {
      throw new BadRequestException(EXACTLY_ONE_TARGET_MESSAGE);
    }
  }

  private async assertDealIsAssignable(dealId: string, planCycleId: string): Promise<void> {
    const deal = await this.prisma.builderDeal.findUnique({ where: { id: dealId } });
    if (!deal) {
      throw new NotFoundException(DEAL_NOT_FOUND_MESSAGE);
    }
    if (deal.eventCycleId !== planCycleId) {
      throw new BadRequestException(CYCLE_MISMATCH_MESSAGE);
    }
    if (deal.stage === DealStage.LOST) {
      throw new BadRequestException(DEAL_LOST_MESSAGE);
    }
  }

  private async assertPartnerIsAssignable(
    partnerParticipationId: string,
    planCycleId: string,
  ): Promise<void> {
    const partner = await this.prisma.partnerParticipation.findUnique({
      where: { id: partnerParticipationId },
    });
    if (!partner) {
      throw new NotFoundException(PARTNER_NOT_FOUND_MESSAGE);
    }
    if (partner.eventCycleId !== planCycleId) {
      throw new BadRequestException(CYCLE_MISMATCH_MESSAGE);
    }
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE
    );
  }
}
