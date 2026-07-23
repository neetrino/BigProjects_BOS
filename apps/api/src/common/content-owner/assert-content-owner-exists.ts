import { NotFoundException } from '@nestjs/common';
import { ContentOwnerType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const BUILDER_DEAL_NOT_FOUND_MESSAGE = 'Builder deal not found.';
const PARTNER_PARTICIPATION_NOT_FOUND_MESSAGE = 'Partner participation not found.';
const ORGANIZATION_NOT_FOUND_MESSAGE = 'Organization not found.';

/**
 * Validates that a polymorphic content owner exists for notes/attachments.
 */
export async function assertContentOwnerExists(
  prisma: PrismaService,
  ownerType: ContentOwnerType,
  ownerId: string,
): Promise<void> {
  if (ownerType === ContentOwnerType.BUILDER_DEAL) {
    const deal = await prisma.builderDeal.findUnique({ where: { id: ownerId } });
    if (!deal) {
      throw new NotFoundException(BUILDER_DEAL_NOT_FOUND_MESSAGE);
    }
    return;
  }

  if (ownerType === ContentOwnerType.PARTNER_PARTICIPATION) {
    const partner = await prisma.partnerParticipation.findUnique({ where: { id: ownerId } });
    if (!partner) {
      throw new NotFoundException(PARTNER_PARTICIPATION_NOT_FOUND_MESSAGE);
    }
    return;
  }

  const organization = await prisma.organization.findUnique({ where: { id: ownerId } });
  if (!organization) {
    throw new NotFoundException(ORGANIZATION_NOT_FOUND_MESSAGE);
  }
}
