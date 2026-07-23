import { SpaceAllocation } from '@prisma/client';
import { SpaceAllocationResponseDto } from '../dto/space-allocation-response.dto';
import { resolveAllocationKind } from './space-area.mapper';

/** Maps a `SpaceAllocation` row to its API response shape. */
export function mapAllocationToResponse(allocation: SpaceAllocation): SpaceAllocationResponseDto {
  const kind = resolveAllocationKind(allocation);
  const targetId =
    kind === 'BUILDER' ? allocation.builderDealId : allocation.partnerParticipationId;

  return {
    id: allocation.id,
    spaceAreaId: allocation.spaceAreaId,
    kind,
    targetId: targetId as string,
    active: allocation.active,
    assignedAt: allocation.assignedAt,
    releasedAt: allocation.releasedAt,
  };
}
