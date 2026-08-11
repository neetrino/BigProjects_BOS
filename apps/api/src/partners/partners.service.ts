import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  Contact,
  ContentOwnerType,
  EventCycleStatus,
  Organization,
  PartnerParticipation,
  PartnerStage,
  Prisma,
  User,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AreasSummary,
  SpaceAllocationsQueryService,
} from '../venue-map/space-allocations-query.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { ListPartnersQueryDto } from './dto/list-partners-query.dto';
import {
  PartnerAreasSummaryResponseDto,
  PartnerDetailResponseDto,
  PartnerResponseDto,
} from './dto/partner-response.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

const PARTNER_NOT_FOUND_MESSAGE = 'Partner participation not found.';
const CYCLE_NOT_FOUND_MESSAGE = 'Event cycle not found.';
const CYCLE_CLOSED_MESSAGE =
  'Cannot create or update a partner participation for a closed event cycle.';
const ORGANIZATION_NOT_FOUND_MESSAGE = 'Organization not found.';
const CONTACT_NOT_IN_ORG_MESSAGE = 'Primary contact must belong to the selected organization.';
const ASSIGNED_STAFF_INVALID_MESSAGE = 'Assigned staff must be an existing active user.';
const INVALID_STAGE_TRANSITION_MESSAGE = 'Invalid partner stage transition.';
const ALLOCATION_KIND_PARTNER = 'PARTNER';

const ACTIVE_STAGES: ReadonlySet<PartnerStage> = new Set([
  PartnerStage.NEW,
  PartnerStage.CONTACTED,
]);

const EMPTY_AREAS_SUMMARY: PartnerAreasSummaryResponseDto = {
  count: 0,
  totalSqm: 0,
  labels: [],
};

const PARTNER_INCLUDE = {
  organization: true,
  primaryContact: true,
  assignedStaff: true,
} as const;

type PartnerWithRelations = PartnerParticipation & {
  organization: Organization;
  primaryContact: Contact | null;
  assignedStaff: User | null;
};

@Injectable()
export class PartnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spaceAllocationsQuery: SpaceAllocationsQueryService,
  ) {}

  async list(query: ListPartnersQueryDto): Promise<PartnerResponseDto[]> {
    const partners = await this.prisma.partnerParticipation.findMany({
      where: this.buildListWhere(query),
      include: PARTNER_INCLUDE,
      orderBy: { updatedAt: 'desc' },
    });

    const allocations = await this.spaceAllocationsQuery.listActiveAllocationsForTargets(
      ALLOCATION_KIND_PARTNER,
      partners.map((partner) => partner.id),
    );
    const summaries = this.spaceAllocationsQuery.buildAreasSummaryMap(
      ALLOCATION_KIND_PARTNER,
      allocations,
    );

    return partners.map((partner) => this.toResponse(partner, summaries.get(partner.id)));
  }

  async findOne(id: string): Promise<PartnerDetailResponseDto> {
    const partner = await this.prisma.partnerParticipation.findUnique({
      where: { id },
      include: PARTNER_INCLUDE,
    });

    if (!partner) {
      throw new NotFoundException(PARTNER_NOT_FOUND_MESSAGE);
    }

    const [summary, areas] = await Promise.all([
      this.spaceAllocationsQuery.getAreasSummary(ALLOCATION_KIND_PARTNER, id),
      this.spaceAllocationsQuery.getActiveAreaItems(ALLOCATION_KIND_PARTNER, id),
    ]);

    return { ...this.toResponse(partner, summary), areas };
  }

  async create(dto: CreatePartnerDto): Promise<PartnerResponseDto> {
    await this.assertCycleAcceptsPartners(dto.eventCycleId);
    await this.assertOrganizationExists(dto.organizationId);
    await this.assertPrimaryContactBelongsToOrganization(
      dto.primaryContactId ?? undefined,
      dto.organizationId,
    );
    await this.assertAssignedStaffActive(dto.assignedStaffId ?? undefined);

    const partner = await this.prisma.partnerParticipation.create({
      data: {
        eventCycleId: dto.eventCycleId,
        organizationId: dto.organizationId,
        primaryContactId: dto.primaryContactId ?? null,
        assignedStaffId: dto.assignedStaffId ?? null,
        partnerType: dto.partnerType ?? null,
        description: dto.description ?? null,
      },
      include: PARTNER_INCLUDE,
    });

    return this.toResponse(partner);
  }

  async update(id: string, dto: UpdatePartnerDto): Promise<PartnerResponseDto> {
    const existing = await this.prisma.partnerParticipation.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(PARTNER_NOT_FOUND_MESSAGE);
    }

    const nextEventCycleId = dto.eventCycleId ?? existing.eventCycleId;
    const nextOrganizationId = dto.organizationId ?? existing.organizationId;
    const nextPrimaryContactId =
      dto.primaryContactId !== undefined ? dto.primaryContactId : existing.primaryContactId;

    if (dto.eventCycleId !== undefined) {
      await this.assertCycleAcceptsPartners(nextEventCycleId);
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
      await this.assertValidStageTransition(existing.stage, dto.stage);
    }

    const data: Prisma.PartnerParticipationUpdateInput = {
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
      ...(dto.partnerType !== undefined && { partnerType: dto.partnerType }),
      ...(dto.description !== undefined && { description: dto.description }),
    };

    const partner = await this.prisma.partnerParticipation.update({
      where: { id },
      data,
      include: PARTNER_INCLUDE,
    });

    return this.toResponse(partner);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.partnerParticipation.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(PARTNER_NOT_FOUND_MESSAGE);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.spaceAllocation.updateMany({
        where: { partnerParticipationId: id, active: true },
        data: { active: false, releasedAt: new Date() },
      });
      await tx.spaceAllocation.deleteMany({ where: { partnerParticipationId: id } });
      await tx.note.deleteMany({
        where: { ownerType: ContentOwnerType.PARTNER_PARTICIPATION, ownerId: id },
      });
      await tx.attachment.deleteMany({
        where: { ownerType: ContentOwnerType.PARTNER_PARTICIPATION, ownerId: id },
      });
      await tx.partnerParticipation.delete({ where: { id } });
    });
  }

  async assertValidStageTransition(current: PartnerStage, next: PartnerStage): Promise<void> {
    if (current === next) {
      return;
    }

    if (ACTIVE_STAGES.has(current) && ACTIVE_STAGES.has(next)) {
      return;
    }

    if (current === PartnerStage.CONTACTED && next === PartnerStage.CONFIRMED) {
      return;
    }

    if (ACTIVE_STAGES.has(current) && next === PartnerStage.DECLINED) {
      return;
    }

    if (
      (current === PartnerStage.CONFIRMED || current === PartnerStage.DECLINED) &&
      ACTIVE_STAGES.has(next)
    ) {
      return;
    }

    throw new BadRequestException(INVALID_STAGE_TRANSITION_MESSAGE);
  }

  private buildListWhere(query: ListPartnersQueryDto): Prisma.PartnerParticipationWhereInput {
    const where: Prisma.PartnerParticipationWhereInput = {
      eventCycleId: query.cycleId,
    };

    if (query.assignedStaffId) {
      where.assignedStaffId = query.assignedStaffId;
    }

    if (query.stage) {
      where.stage = query.stage;
    }

    if (query.partnerType) {
      where.partnerType = query.partnerType;
    }

    if (query.search) {
      where.organization = {
        name: { contains: query.search, mode: 'insensitive' },
      };
    }

    return where;
  }

  private async assertCycleAcceptsPartners(eventCycleId: string): Promise<void> {
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

  private toResponse(
    partner: PartnerWithRelations,
    areasSummary?: AreasSummary,
  ): PartnerResponseDto {
    return {
      id: partner.id,
      eventCycleId: partner.eventCycleId,
      organizationId: partner.organizationId,
      organization: {
        id: partner.organization.id,
        name: partner.organization.name,
        type: partner.organization.type,
      },
      primaryContact: partner.primaryContact
        ? {
            id: partner.primaryContact.id,
            name: partner.primaryContact.name,
            phone: partner.primaryContact.phone,
            email: partner.primaryContact.email,
          }
        : null,
      assignedStaff: partner.assignedStaff
        ? {
            id: partner.assignedStaff.id,
            name: partner.assignedStaff.name,
          }
        : null,
      stage: partner.stage,
      partnerType: partner.partnerType,
      description: partner.description,
      areasSummary: areasSummary ?? EMPTY_AREAS_SUMMARY,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
    };
  }
}
