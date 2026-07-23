import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ContentOwnerType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const PARTNER_PARTICIPATION_UNAVAILABLE_MESSAGE = 'not available yet';
const BUILDER_DEAL_NOT_FOUND_MESSAGE = 'Builder deal not found.';
const ORGANIZATION_NOT_FOUND_MESSAGE = 'Organization not found.';

/**
 * Validates that a polymorphic content owner exists for notes/attachments.
 * PARTNER_PARTICIPATION is deferred to Phase 3.
 */
export async function assertContentOwnerExists(
  prisma: PrismaService,
  ownerType: ContentOwnerType,
  ownerId: string,
): Promise<void> {
  if (ownerType === ContentOwnerType.PARTNER_PARTICIPATION) {
    throw new BadRequestException(PARTNER_PARTICIPATION_UNAVAILABLE_MESSAGE);
  }

  if (ownerType === ContentOwnerType.BUILDER_DEAL) {
    const deal = await prisma.builderDeal.findUnique({ where: { id: ownerId } });
    if (!deal) {
      throw new NotFoundException(BUILDER_DEAL_NOT_FOUND_MESSAGE);
    }
    return;
  }

  const organization = await prisma.organization.findUnique({ where: { id: ownerId } });
  if (!organization) {
    throw new NotFoundException(ORGANIZATION_NOT_FOUND_MESSAGE);
  }
}
