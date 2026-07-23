import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PublicDisplayMode } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpaceAreaDto } from './dto/create-space-area.dto';
import { SpaceAreaResponseDto } from './dto/space-area-response.dto';
import { UpdateSpaceAreaDto } from './dto/update-space-area.dto';
import { mapSpaceAreaToResponse } from './mappers/space-area.mapper';
import { assertCellsFormFilledRectangle } from './validation/rectangle-cells.validation';

const PLAN_NOT_FOUND_MESSAGE = 'Venue plan not found.';
const PLAN_NOT_CALIBRATED_MESSAGE =
  'The venue plan must be calibrated (pixels-per-meter set) before creating areas.';
const AREA_NOT_FOUND_MESSAGE = 'Space area not found.';
const CELLS_OVERLAP_MESSAGE = 'One or more cells overlap an existing area on this plan.';
const CUSTOM_LABEL_REQUIRED_MESSAGE =
  'customPublicLabel is required when publicDisplayMode is CUSTOM_LABEL.';
const AREA_HAS_ACTIVE_ALLOCATION_MESSAGE =
  'This area has an active allocation. Release it before deleting.';
const PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE = 'P2002';

const AREA_INCLUDE = {
  cells: { select: { x: true, y: true } },
  allocations: {
    where: { active: true },
    include: {
      builderDeal: { include: { organization: true } },
      partnerParticipation: { include: { organization: true } },
    },
  },
} satisfies Prisma.SpaceAreaInclude;

@Injectable()
export class SpaceAreasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(venuePlanId: string, dto: CreateSpaceAreaDto): Promise<SpaceAreaResponseDto> {
    const plan = await this.prisma.venuePlan.findUnique({ where: { id: venuePlanId } });
    if (!plan) {
      throw new NotFoundException(PLAN_NOT_FOUND_MESSAGE);
    }
    if (plan.pixelsPerMeter === null) {
      throw new BadRequestException(PLAN_NOT_CALIBRATED_MESSAGE);
    }

    assertCellsFormFilledRectangle(dto.cells);
    await this.assertCellsDoNotOverlap(venuePlanId, dto.cells);

    try {
      const area = await this.prisma.$transaction(async (tx) => {
        const created = await tx.spaceArea.create({
          data: {
            venuePlanId,
            name: dto.name,
            code: dto.code ?? null,
            squareMeters: dto.cells.length,
          },
        });

        await tx.spaceAreaCell.createMany({
          data: dto.cells.map((cell) => ({
            spaceAreaId: created.id,
            venuePlanId,
            x: cell.x,
            y: cell.y,
          })),
        });

        return tx.spaceArea.findUniqueOrThrow({
          where: { id: created.id },
          include: AREA_INCLUDE,
        });
      });

      return mapSpaceAreaToResponse(area);
    } catch (error: unknown) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new ConflictException(CELLS_OVERLAP_MESSAGE);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateSpaceAreaDto): Promise<SpaceAreaResponseDto> {
    const existing = await this.prisma.spaceArea.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(AREA_NOT_FOUND_MESSAGE);
    }

    const nextMode = dto.publicDisplayMode ?? existing.publicDisplayMode;
    const nextLabel =
      dto.customPublicLabel !== undefined ? dto.customPublicLabel : existing.customPublicLabel;
    if (nextMode === PublicDisplayMode.CUSTOM_LABEL && !nextLabel) {
      throw new BadRequestException(CUSTOM_LABEL_REQUIRED_MESSAGE);
    }

    const data: Prisma.SpaceAreaUpdateInput = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.code !== undefined && { code: dto.code }),
      ...(dto.publicDisplayMode !== undefined && { publicDisplayMode: dto.publicDisplayMode }),
      ...(dto.customPublicLabel !== undefined && { customPublicLabel: dto.customPublicLabel }),
    };

    const area = await this.prisma.spaceArea.update({
      where: { id },
      data,
      include: AREA_INCLUDE,
    });

    return mapSpaceAreaToResponse(area);
  }

  async remove(id: string): Promise<void> {
    const area = await this.prisma.spaceArea.findUnique({
      where: { id },
      include: { allocations: { where: { active: true } } },
    });
    if (!area) {
      throw new NotFoundException(AREA_NOT_FOUND_MESSAGE);
    }
    if (area.allocations.length > 0) {
      throw new ConflictException(AREA_HAS_ACTIVE_ALLOCATION_MESSAGE);
    }

    // No event store in Release 1 (see docs/02-DATA-MODEL.md "Data Rules"): once an area has no
    // active allocation, its released allocation history is cleared in the same transaction so
    // the area itself can be deleted (SpaceAllocation.spaceAreaId is an onDelete: Restrict FK).
    await this.prisma.$transaction(async (tx) => {
      await tx.spaceAllocation.deleteMany({ where: { spaceAreaId: id } });
      await tx.spaceArea.delete({ where: { id } });
    });
  }

  private async assertCellsDoNotOverlap(
    venuePlanId: string,
    cells: { x: number; y: number }[],
  ): Promise<void> {
    const overlapping = await this.prisma.spaceAreaCell.findFirst({
      where: {
        venuePlanId,
        OR: cells.map((cell) => ({ x: cell.x, y: cell.y })),
      },
    });

    if (overlapping) {
      throw new ConflictException(CELLS_OVERLAP_MESSAGE);
    }
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE
    );
  }
}
