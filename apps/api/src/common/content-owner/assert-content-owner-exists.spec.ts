import { NotFoundException } from '@nestjs/common';
import { ContentOwnerType } from '@prisma/client';
import { assertContentOwnerExists } from './assert-content-owner-exists';
import { PrismaService } from '../../prisma/prisma.service';

describe('assertContentOwnerExists', () => {
  let prisma: {
    builderDeal: { findUnique: jest.Mock };
    partnerParticipation: { findUnique: jest.Mock };
    organization: { findUnique: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      builderDeal: { findUnique: jest.fn() },
      partnerParticipation: { findUnique: jest.fn() },
      organization: { findUnique: jest.fn() },
    };
  });

  it('accepts an existing partner participation owner', async () => {
    prisma.partnerParticipation.findUnique.mockResolvedValue({ id: 'partner-1' });

    await expect(
      assertContentOwnerExists(
        prisma as unknown as PrismaService,
        ContentOwnerType.PARTNER_PARTICIPATION,
        'partner-1',
      ),
    ).resolves.toBeUndefined();
  });

  it('rejects a missing partner participation owner', async () => {
    prisma.partnerParticipation.findUnique.mockResolvedValue(null);

    await expect(
      assertContentOwnerExists(
        prisma as unknown as PrismaService,
        ContentOwnerType.PARTNER_PARTICIPATION,
        'missing-partner',
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
