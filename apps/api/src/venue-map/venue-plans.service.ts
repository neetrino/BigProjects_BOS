import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventCycleStatus, Prisma, VenuePlan } from '@prisma/client';
import { StorageService } from '../attachments/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVenuePlanDto } from './dto/create-venue-plan.dto';
import { PresignVenuePlanImageDto } from './dto/presign-venue-plan-image.dto';
import { PresignVenuePlanImageResponseDto } from './dto/presign-venue-plan-image-response.dto';
import { SetVenuePlanImageDto } from './dto/set-venue-plan-image.dto';
import { UpdateVenuePlanDto } from './dto/update-venue-plan.dto';
import { VenuePlanEnvelopeResponseDto, VenuePlanResponseDto } from './dto/venue-plan-response.dto';
import { mapSpaceAreaToResponse } from './mappers/space-area.mapper';
import { MAX_PLAN_IMAGE_SIZE_BYTES, MAX_SANITIZED_PLAN_FILENAME_LENGTH } from './venue-map.constants';

const CYCLE_NOT_FOUND_MESSAGE = 'Event cycle not found.';
const CYCLE_CLOSED_MESSAGE = 'Cannot create a venue plan for a closed event cycle.';
const PLAN_ALREADY_EXISTS_MESSAGE = 'This event cycle already has a venue plan.';
const PLAN_NOT_FOUND_MESSAGE = 'Venue plan not found.';
const PLAN_SIZE_LIMIT_MESSAGE = `Image size must not exceed ${MAX_PLAN_IMAGE_SIZE_BYTES} bytes.`;
const PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE = 'P2002';

const PLAN_AREAS_INCLUDE = {
  spaceAreas: {
    orderBy: { createdAt: 'asc' as const },
    include: {
      cells: { select: { x: true, y: true } },
      allocations: {
        where: { active: true },
        include: {
          builderDeal: { include: { organization: true } },
          partnerParticipation: { include: { organization: true } },
        },
      },
    },
  },
} satisfies Prisma.VenuePlanInclude;

type VenuePlanWithAreas = Prisma.VenuePlanGetPayload<{ include: typeof PLAN_AREAS_INCLUDE }>;

@Injectable()
export class VenuePlansService {
  private readonly logger = new Logger(VenuePlansService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findByCycle(eventCycleId: string): Promise<VenuePlanEnvelopeResponseDto> {
    const plan = await this.prisma.venuePlan.findUnique({
      where: { eventCycleId },
      include: PLAN_AREAS_INCLUDE,
    });

    if (!plan) {
      return { plan: null };
    }

    return { plan: await this.toResponse(plan) };
  }

  async create(dto: CreateVenuePlanDto): Promise<VenuePlanResponseDto> {
    await this.assertCycleAcceptsPlan(dto.eventCycleId);
    await this.assertCycleHasNoPlan(dto.eventCycleId);

    try {
      const plan = await this.prisma.venuePlan.create({
        data: { eventCycleId: dto.eventCycleId, title: dto.title },
        include: PLAN_AREAS_INCLUDE,
      });
      return this.toResponse(plan);
    } catch (error: unknown) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new ConflictException(PLAN_ALREADY_EXISTS_MESSAGE);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateVenuePlanDto): Promise<VenuePlanResponseDto> {
    await this.getPlanOrThrow(id);

    const data: Prisma.VenuePlanUpdateInput = {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.pixelsPerMeter !== undefined && { pixelsPerMeter: dto.pixelsPerMeter }),
      ...(dto.gridOriginX !== undefined && { gridOriginX: dto.gridOriginX }),
      ...(dto.gridOriginY !== undefined && { gridOriginY: dto.gridOriginY }),
    };

    const plan = await this.prisma.venuePlan.update({
      where: { id },
      data,
      include: PLAN_AREAS_INCLUDE,
    });

    return this.toResponse(plan);
  }

  async presignImage(
    id: string,
    dto: PresignVenuePlanImageDto,
  ): Promise<PresignVenuePlanImageResponseDto> {
    await this.getPlanOrThrow(id);
    this.assertImageSizeWithinLimit(dto.size);

    const objectKey = this.buildImageObjectKey(id, dto.filename);
    const uploadUrl = await this.storageService.createPresignedPutUrl(objectKey, dto.contentType);

    return { objectKey, uploadUrl };
  }

  async setImage(id: string, dto: SetVenuePlanImageDto): Promise<VenuePlanResponseDto> {
    const existing = await this.getPlanOrThrow(id);

    if (existing.imageKey && existing.imageKey !== dto.objectKey) {
      await this.deleteOldImageBestEffort(existing.imageKey);
    }

    const plan = await this.prisma.venuePlan.update({
      where: { id },
      data: { imageKey: dto.objectKey, imageWidth: dto.width, imageHeight: dto.height },
      include: PLAN_AREAS_INCLUDE,
    });

    return this.toResponse(plan);
  }

  private async deleteOldImageBestEffort(imageKey: string): Promise<void> {
    try {
      await this.storageService.deleteObject(imageKey);
    } catch (error: unknown) {
      this.logger.error(`Failed to delete replaced venue plan image "${imageKey}"`, error);
    }
  }

  private async getPlanOrThrow(id: string): Promise<VenuePlan> {
    const plan = await this.prisma.venuePlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException(PLAN_NOT_FOUND_MESSAGE);
    }
    return plan;
  }

  private async assertCycleAcceptsPlan(eventCycleId: string): Promise<void> {
    const cycle = await this.prisma.eventCycle.findUnique({ where: { id: eventCycleId } });
    if (!cycle) {
      throw new NotFoundException(CYCLE_NOT_FOUND_MESSAGE);
    }
    if (cycle.status === EventCycleStatus.CLOSED) {
      throw new BadRequestException(CYCLE_CLOSED_MESSAGE);
    }
  }

  private async assertCycleHasNoPlan(eventCycleId: string): Promise<void> {
    const existing = await this.prisma.venuePlan.findUnique({ where: { eventCycleId } });
    if (existing) {
      throw new ConflictException(PLAN_ALREADY_EXISTS_MESSAGE);
    }
  }

  private assertImageSizeWithinLimit(size: number): void {
    if (size > MAX_PLAN_IMAGE_SIZE_BYTES) {
      throw new BadRequestException(PLAN_SIZE_LIMIT_MESSAGE);
    }
  }

  private buildImageObjectKey(planId: string, filename: string): string {
    const sanitized = this.sanitizeFilename(filename);
    return `venue-plans/${planId}/${randomUUID()}-${sanitized}`;
  }

  private sanitizeFilename(filename: string): string {
    const withoutPath = filename.replace(/[/\\]/g, '_');
    const sanitized = withoutPath.replace(/[^\w.\-+() ]/g, '_').trim();
    const fallback = sanitized.length > 0 ? sanitized : 'file';
    return fallback.slice(0, MAX_SANITIZED_PLAN_FILENAME_LENGTH);
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE
    );
  }

  private async toResponse(plan: VenuePlanWithAreas): Promise<VenuePlanResponseDto> {
    const imageUrl = plan.imageKey
      ? await this.storageService.createPresignedGetUrl(plan.imageKey)
      : null;

    return {
      id: plan.id,
      eventCycleId: plan.eventCycleId,
      title: plan.title,
      imageKey: plan.imageKey,
      imageWidth: plan.imageWidth,
      imageHeight: plan.imageHeight,
      pixelsPerMeter: plan.pixelsPerMeter,
      gridOriginX: plan.gridOriginX,
      gridOriginY: plan.gridOriginY,
      publishStatus: plan.publishStatus,
      imageUrl,
      areas: plan.spaceAreas.map((area) => mapSpaceAreaToResponse(area)),
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}
