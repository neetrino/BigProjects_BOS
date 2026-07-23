import { Injectable } from '@nestjs/common';
import { Prisma, SpaceAllocation } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AllocationKind } from './types/allocation-kind.type';

export type AreasSummary = {
  count: number;
  totalSqm: number;
  labels: string[];
};

export type ActiveAreaItem = {
  allocationId: string;
  areaId: string;
  name: string;
  code: string | null;
  squareMeters: number;
};

type PrismaTransactionClient = Prisma.TransactionClient;

const EMPTY_SUMMARY: AreasSummary = { count: 0, totalSqm: 0, labels: [] };

type AllocationWithArea = SpaceAllocation & {
  spaceArea: { id: string; name: string; code: string | null; squareMeters: number };
};

/**
 * Read/write helper for `SpaceAllocation` rows shared by the deals and partners modules, so
 * neither duplicates the batched "areas summary" / "active areas" queries. Kept free of any
 * dependency on `DealsService` / `PartnersService` to avoid a module import cycle.
 */
@Injectable()
export class SpaceAllocationsQueryService {
  constructor(private readonly prisma: PrismaService) {}

  /** Batched lookup of active allocations for many targets at once (avoids N+1 in list endpoints). */
  async listActiveAllocationsForTargets(
    kind: AllocationKind,
    targetIds: string[],
  ): Promise<AllocationWithArea[]> {
    if (targetIds.length === 0) {
      return [];
    }

    const targetFilter =
      kind === 'BUILDER' ? { builderDealId: { in: targetIds } } : { partnerParticipationId: { in: targetIds } };

    return this.prisma.spaceAllocation.findMany({
      where: { active: true, ...targetFilter },
      include: { spaceArea: { select: { id: true, name: true, code: true, squareMeters: true } } },
    });
  }

  /** Builds a `targetId -> summary` map from a batch of active allocations. */
  buildAreasSummaryMap(
    kind: AllocationKind,
    allocations: AllocationWithArea[],
  ): Map<string, AreasSummary> {
    const map = new Map<string, AreasSummary>();

    for (const allocation of allocations) {
      const targetId = this.resolveTargetId(kind, allocation);
      const current = map.get(targetId) ?? { count: 0, totalSqm: 0, labels: [] };
      map.set(targetId, {
        count: current.count + 1,
        totalSqm: current.totalSqm + allocation.spaceArea.squareMeters,
        labels: [...current.labels, allocation.spaceArea.name],
      });
    }

    return map;
  }

  /** Convenience wrapper for a single target (detail endpoints). */
  async getAreasSummary(kind: AllocationKind, targetId: string): Promise<AreasSummary> {
    const allocations = await this.listActiveAllocationsForTargets(kind, [targetId]);
    return this.buildAreasSummaryMap(kind, allocations).get(targetId) ?? EMPTY_SUMMARY;
  }

  /** Active allocated areas for a single target, for detail view `areas: [...]`. */
  async getActiveAreaItems(kind: AllocationKind, targetId: string): Promise<ActiveAreaItem[]> {
    const allocations = await this.listActiveAllocationsForTargets(kind, [targetId]);
    return allocations.map((allocation) => ({
      allocationId: allocation.id,
      areaId: allocation.spaceArea.id,
      name: allocation.spaceArea.name,
      code: allocation.spaceArea.code,
      squareMeters: allocation.spaceArea.squareMeters,
    }));
  }

  async dealHasActiveAllocation(dealId: string): Promise<boolean> {
    const allocation = await this.prisma.spaceAllocation.findFirst({
      where: { builderDealId: dealId, active: true },
      select: { id: true },
    });
    return allocation !== null;
  }

  /** Releases all active allocations for a deal, as part of a LOST-stage transition. */
  async releaseAllActiveAllocationsForDeal(
    dealId: string,
    tx: PrismaTransactionClient,
  ): Promise<void> {
    await tx.spaceAllocation.updateMany({
      where: { builderDealId: dealId, active: true },
      data: { active: false, releasedAt: new Date() },
    });
  }

  private resolveTargetId(kind: AllocationKind, allocation: SpaceAllocation): string {
    const targetId = kind === 'BUILDER' ? allocation.builderDealId : allocation.partnerParticipationId;
    return targetId as string;
  }
}
