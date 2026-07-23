import {
  BuilderDeal,
  Contact,
  Organization,
  PartnerParticipation,
  SpaceAllocation,
} from '@prisma/client';
import {
  BuilderDealAllocationSummaryDto,
  PartnerAllocationSummaryDto,
  SpaceAreaAllocationResponseDto,
  SpaceAreaResponseDto,
} from '../dto/space-area-response.dto';
import { AllocationKind } from '../types/allocation-kind.type';

export type AllocationWithTargetOrganization = SpaceAllocation & {
  builderDeal:
    | (BuilderDeal & { organization: Organization; primaryContact: Pick<Contact, 'name'> | null })
    | null;
  partnerParticipation: (PartnerParticipation & { organization: Organization }) | null;
};

export type SpaceAreaWithRelations = {
  id: string;
  code: string | null;
  name: string;
  squareMeters: number;
  publicDisplayMode: SpaceAreaResponseDto['publicDisplayMode'];
  customPublicLabel: string | null;
  createdAt: Date;
  cells: { x: number; y: number }[];
  allocations: AllocationWithTargetOrganization[];
};

/** Resolves the derived allocation kind from which foreign key is populated. */
export function resolveAllocationKind(
  allocation: Pick<SpaceAllocation, 'builderDealId' | 'partnerParticipationId'>,
): AllocationKind {
  return allocation.builderDealId ? 'BUILDER' : 'PARTNER';
}

function mapBuilderDealSummary(
  deal: BuilderDeal & { primaryContact: Pick<Contact, 'name'> | null },
): BuilderDealAllocationSummaryDto {
  return {
    id: deal.id,
    stage: deal.stage,
    amount: deal.agreedAmount === null ? null : Number(deal.agreedAmount),
    expectedSqm: deal.expectedSqm,
    primaryContactName: deal.primaryContact?.name ?? null,
  };
}

function mapPartnerSummary(partner: PartnerParticipation): PartnerAllocationSummaryDto {
  return {
    id: partner.id,
    stage: partner.stage,
  };
}

function mapActiveAllocation(
  allocations: AllocationWithTargetOrganization[],
): SpaceAreaAllocationResponseDto | null {
  const active = allocations.find((allocation) => allocation.active);
  if (!active) {
    return null;
  }

  const kind = resolveAllocationKind(active);
  const targetId = kind === 'BUILDER' ? active.builderDealId : active.partnerParticipationId;
  const organizationName =
    kind === 'BUILDER'
      ? active.builderDeal?.organization.name
      : active.partnerParticipation?.organization.name;

  const base: SpaceAreaAllocationResponseDto = {
    id: active.id,
    kind,
    targetId: targetId as string,
    organizationName: organizationName as string,
  };

  if (kind === 'BUILDER' && active.builderDeal) {
    return { ...base, deal: mapBuilderDealSummary(active.builderDeal) };
  }

  if (kind === 'PARTNER' && active.partnerParticipation) {
    return { ...base, partner: mapPartnerSummary(active.partnerParticipation) };
  }

  return base;
}

/** Maps a `SpaceArea` (with cells and its active allocation, if any) to its API response shape. */
export function mapSpaceAreaToResponse(area: SpaceAreaWithRelations): SpaceAreaResponseDto {
  return {
    id: area.id,
    code: area.code,
    name: area.name,
    squareMeters: area.squareMeters,
    publicDisplayMode: area.publicDisplayMode,
    customPublicLabel: area.customPublicLabel,
    cells: area.cells.map((cell) => ({ x: cell.x, y: cell.y })),
    allocation: mapActiveAllocation(area.allocations),
    createdAt: area.createdAt,
  };
}
