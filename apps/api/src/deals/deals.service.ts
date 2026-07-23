import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  BuilderDeal,
  Contact,
  DealStage,
  EventCycleStatus,
  Organization,
  Prisma,
  User,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AreasSummary, SpaceAllocationsQueryService } from '../venue-map/space-allocations-query.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { DealAreasSummaryResponseDto, DealDetailResponseDto, DealResponseDto } from './dto/deal-response.dto';
import { ListDealsQueryDto } from './dto/list-deals-query.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

const DEAL_NOT_FOUND_MESSAGE = 'Builder deal not found.';
const CYCLE_NOT_FOUND_MESSAGE = 'Event cycle not found.';
const CYCLE_CLOSED_MESSAGE = 'Cannot create or update a deal for a closed event cycle.';
const ORGANIZATION_NOT_FOUND_MESSAGE = 'Organization not found.';
const CONTACT_NOT_IN_ORG_MESSAGE = 'Primary contact must belong to the selected organization.';
const ASSIGNED_STAFF_INVALID_MESSAGE = 'Assigned staff must be an existing active user.';
const WON_WITHOUT_ALLOCATION_MESSAGE =
  'The deal cannot be won without an active venue-space allocation.';
const WON_STAGE_LOCKED_MESSAGE = 'A won deal cannot be moved to another stage.';
const INVALID_STAGE_TRANSITION_MESSAGE = 'Invalid deal stage transition.';
const ALLOCATION_KIND_BUILDER = 'BUILDER';

const ACTIVE_STAGES: ReadonlySet<DealStage> = new Set([
  DealStage.NEW,
  DealStage.CONTACTED,
  DealStage.NEGOTIATION,
]);

const EMPTY_AREAS_SUMMARY: DealAreasSummaryResponseDto = {
  count: 0,
  totalSqm: 0,
  labels: [],
};

const DEAL_INCLUDE = {
  organization: true,
  primaryContact: true,
  assignedStaff: true,
} as const;

type DealWithRelations = BuilderDeal & {
  organization: Organization;
  primaryContact: Contact | null;
  assignedStaff: User | null;
};

@Injectable()
export class DealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spaceAllocationsQuery: SpaceAllocationsQueryService,
  ) {}

  async list(query: ListDealsQueryDto): Promise<DealResponseDto[]> {
    const deals = await this.prisma.builderDeal.findMany({
      where: this.buildListWhere(query),
      include: DEAL_INCLUDE,
      orderBy: { updatedAt: 'desc' },
    });

    const allocations = await this.spaceAllocationsQuery.listActiveAllocationsForTargets(
      ALLOCATION_KIND_BUILDER,
      deals.map((deal) => deal.id),
    );
    const summaries = this.spaceAllocationsQuery.buildAreasSummaryMap(
      ALLOCATION_KIND_BUILDER,
      allocations,
    );

    return deals.map((deal) => this.toResponse(deal, summaries.get(deal.id)));
  }

  async findOne(id: string): Promise<DealDetailResponseDto> {
    const deal = await this.prisma.builderDeal.findUnique({
      where: { id },
      include: DEAL_INCLUDE,
    });

    if (!deal) {
      throw new NotFoundException(DEAL_NOT_FOUND_MESSAGE);
    }

    const [summary, areas] = await Promise.all([
      this.spaceAllocationsQuery.getAreasSummary(ALLOCATION_KIND_BUILDER, id),
      this.spaceAllocationsQuery.getActiveAreaItems(ALLOCATION_KIND_BUILDER, id),
    ]);

    return { ...this.toResponse(deal, summary), areas };
  }

  async create(dto: CreateDealDto): Promise<DealResponseDto> {
    await this.assertCycleAcceptsDeals(dto.eventCycleId);
    await this.assertOrganizationExists(dto.organizationId);
    await this.assertPrimaryContactBelongsToOrganization(
      dto.primaryContactId ?? undefined,
      dto.organizationId,
    );
    await this.assertAssignedStaffActive(dto.assignedStaffId ?? undefined);

    const deal = await this.prisma.builderDeal.create({
      data: {
        eventCycleId: dto.eventCycleId,
        organizationId: dto.organizationId,
        primaryContactId: dto.primaryContactId ?? null,
        assignedStaffId: dto.assignedStaffId ?? null,
        expectedSqm: dto.expectedSqm ?? null,
        agreedAmount: dto.agreedAmount ?? null,
        description: dto.description ?? null,
      },
      include: DEAL_INCLUDE,
    });

    return this.toResponse(deal);
  }

  async update(id: string, dto: UpdateDealDto): Promise<DealResponseDto> {
    const existing = await this.prisma.builderDeal.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(DEAL_NOT_FOUND_MESSAGE);
    }

    const nextEventCycleId = dto.eventCycleId ?? existing.eventCycleId;
    const nextOrganizationId = dto.organizationId ?? existing.organizationId;
    const nextPrimaryContactId =
      dto.primaryContactId !== undefined ? dto.primaryContactId : existing.primaryContactId;

    if (dto.eventCycleId !== undefined) {
      await this.assertCycleAcceptsDeals(nextEventCycleId);
    }

    if (dto.organizationId !== undefined) {
      await this.assertOrganizationExists(nextOrganizationId);
    }

    if (dto.primaryContactId !== undefined || dto.organizationId !== undefined) {
      await this.assertPrimaryContactBelongsToOrganization(
        nextPrimaryContactId ?? undefined,
        nextOrganizationId,
      );
    }

    if (dto.assignedStaffId !== undefined) {
      await this.assertAssignedStaffActive(dto.assignedStaffId ?? undefined);
    }

    if (dto.stage !== undefined) {
      await this.assertValidStageTransition(existing.stage, dto.stage, id);
    }

    const data: Prisma.BuilderDealUpdateInput = {
      ...(dto.eventCycleId !== undefined && {
        eventCycle: { connect: { id: dto.eventCycleId } },
      }),
      ...(dto.organizationId !== undefined && {
        organization: { connect: { id: dto.organizationId } },
      }),
      ...(dto.primaryContactId !== undefined &&
        (dto.primaryContactId === null
          ? { primaryContact: { disconnect: true } }
          : { primaryContact: { connect: { id: dto.primaryContactId } } })),
      ...(dto.assignedStaffId !== undefined &&
        (dto.assignedStaffId === null
          ? { assignedStaff: { disconnect: true } }
          : { assignedStaff: { connect: { id: dto.assignedStaffId } } })),
      ...(dto.stage !== undefined && { stage: dto.stage }),
      ...(dto.expectedSqm !== undefined && { expectedSqm: dto.expectedSqm }),
      ...(dto.agreedAmount !== undefined && { agreedAmount: dto.agreedAmount }),
      ...(dto.description !== undefined && { description: dto.description }),
    };

    const shouldReleaseAreas = dto.stage === DealStage.LOST && dto.releaseAreas === true;

    const deal = shouldReleaseAreas
      ? await this.prisma.$transaction(async (tx) => {
          const updated = await tx.builderDeal.update({ where: { id }, data, include: DEAL_INCLUDE });
          await this.spaceAllocationsQuery.releaseAllActiveAllocationsForDeal(id, tx);
          return updated;
        })
      : await this.prisma.builderDeal.update({ where: { id }, data, include: DEAL_INCLUDE });

    const summary = shouldReleaseAreas
      ? EMPTY_AREAS_SUMMARY
      : await this.spaceAllocationsQuery.getAreasSummary(ALLOCATION_KIND_BUILDER, id);

    return this.toResponse(deal, summary);
  }

  async assertValidStageTransition(
    current: DealStage,
    next: DealStage,
    dealId: string,
  ): Promise<void> {
    if (current === next) {
      return;
    }

    if (current === DealStage.WON) {
      throw new BadRequestException(WON_STAGE_LOCKED_MESSAGE);
    }

    if (next === DealStage.WON) {
      if (current !== DealStage.NEGOTIATION) {
        throw new BadRequestException(INVALID_STAGE_TRANSITION_MESSAGE);
      }

      const hasAllocation = await this.spaceAllocationsQuery.dealHasActiveAllocation(dealId);
      if (!hasAllocation) {
        throw new BadRequestException(WON_WITHOUT_ALLOCATION_MESSAGE);
      }
      return;
    }

    if (ACTIVE_STAGES.has(current) && ACTIVE_STAGES.has(next)) {
      return;
    }

    if (ACTIVE_STAGES.has(current) && next === DealStage.LOST) {
      return;
    }

    if (current === DealStage.LOST && ACTIVE_STAGES.has(next)) {
      return;
    }

    throw new BadRequestException(INVALID_STAGE_TRANSITION_MESSAGE);
  }

  private buildListWhere(query: ListDealsQueryDto): Prisma.BuilderDealWhereInput {
    const where: Prisma.BuilderDealWhereInput = {
      eventCycleId: query.cycleId,
    };

    if (query.assignedStaffId) {
      where.assignedStaffId = query.assignedStaffId;
    }

    if (query.stage) {
      where.stage = query.stage;
    }

    if (query.search) {
      where.organization = {
        name: { contains: query.search, mode: 'insensitive' },
      };
    }

    return where;
  }

  private async assertCycleAcceptsDeals(eventCycleId: string): Promise<void> {
    const cycle = await this.prisma.eventCycle.findUnique({ where: { id: eventCycleId } });
    if (!cycle) {
      throw new NotFoundException(CYCLE_NOT_FOUND_MESSAGE);
    }
    if (cycle.status === EventCycleStatus.CLOSED) {
      throw new BadRequestException(CYCLE_CLOSED_MESSAGE);
    }
  }

  private async assertOrganizationExists(organizationId: string): Promise<void> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization) {
      throw new NotFoundException(ORGANIZATION_NOT_FOUND_MESSAGE);
    }
  }

  async assertPrimaryContactBelongsToOrganization(
    primaryContactId: string | undefined,
    organizationId: string,
  ): Promise<void> {
    if (!primaryContactId) {
      return;
    }

    const contact = await this.prisma.contact.findUnique({ where: { id: primaryContactId } });
    if (!contact || contact.organizationId !== organizationId) {
      throw new BadRequestException(CONTACT_NOT_IN_ORG_MESSAGE);
    }
  }

  private async assertAssignedStaffActive(assignedStaffId: string | undefined): Promise<void> {
    if (!assignedStaffId) {
      return;
    }

    const user = await this.prisma.user.findUnique({ where: { id: assignedStaffId } });
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException(ASSIGNED_STAFF_INVALID_MESSAGE);
    }
  }

  private toResponse(deal: DealWithRelations, areasSummary?: AreasSummary): DealResponseDto {
    return {
      id: deal.id,
      eventCycleId: deal.eventCycleId,
      organizationId: deal.organizationId,
      organization: {
        id: deal.organization.id,
        name: deal.organization.name,
        type: deal.organization.type,
      },
      primaryContact: deal.primaryContact
        ? {
            id: deal.primaryContact.id,
            name: deal.primaryContact.name,
            phone: deal.primaryContact.phone,
            email: deal.primaryContact.email,
          }
        : null,
      assignedStaff: deal.assignedStaff
        ? {
            id: deal.assignedStaff.id,
            name: deal.assignedStaff.name,
          }
        : null,
      stage: deal.stage,
      expectedSqm: deal.expectedSqm,
      agreedAmount: deal.agreedAmount === null ? null : Number(deal.agreedAmount),
      description: deal.description,
      areasSummary: areasSummary ?? EMPTY_AREAS_SUMMARY,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
    };
  }
}
