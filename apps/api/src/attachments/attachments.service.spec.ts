import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContentOwnerType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AttachmentsService, MAX_ATTACHMENT_SIZE_BYTES } from './attachments.service';
import { StorageService } from './storage.service';

describe('AttachmentsService', () => {
  let service: AttachmentsService;
  let prisma: {
    builderDeal: { findUnique: jest.Mock };
    organization: { findUnique: jest.Mock };
    attachment: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
    };
  };
  let storageService: {
    createPresignedPutUrl: jest.Mock;
    createPresignedGetUrl: jest.Mock;
    deleteObject: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      builderDeal: { findUnique: jest.fn() },
      organization: { findUnique: jest.fn() },
      attachment: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };

    storageService = {
      createPresignedPutUrl: jest.fn(),
      createPresignedGetUrl: jest.fn(),
      deleteObject: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storageService },
      ],
    }).compile();

    service = module.get(AttachmentsService);
  });

  describe('assertSizeWithinLimit', () => {
    it('allows sizes up to the 25 MB limit', () => {
      expect(() => service.assertSizeWithinLimit(MAX_ATTACHMENT_SIZE_BYTES)).not.toThrow();
    });

    it('rejects sizes above the 25 MB limit', () => {
      expect(() => service.assertSizeWithinLimit(MAX_ATTACHMENT_SIZE_BYTES + 1)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('owner validation on presign', () => {
    it('rejects PARTNER_PARTICIPATION owners as not available yet', async () => {
      await expect(
        service.presign({
          ownerType: ContentOwnerType.PARTNER_PARTICIPATION,
          ownerId: 'partner-1',
          filename: 'brief.pdf',
          contentType: 'application/pdf',
          size: 1024,
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.presign({
          ownerType: ContentOwnerType.PARTNER_PARTICIPATION,
          ownerId: 'partner-1',
          filename: 'brief.pdf',
          contentType: 'application/pdf',
          size: 1024,
        }),
      ).rejects.toThrow('not available yet');
    });

    it('rejects oversized files before owner lookup', async () => {
      await expect(
        service.presign({
          ownerType: ContentOwnerType.BUILDER_DEAL,
          ownerId: 'deal-1',
          filename: 'huge.bin',
          contentType: 'application/octet-stream',
          size: MAX_ATTACHMENT_SIZE_BYTES + 1,
        }),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.builderDeal.findUnique).not.toHaveBeenCalled();
    });

    it('presigns when the builder deal owner exists', async () => {
      prisma.builderDeal.findUnique.mockResolvedValue({ id: 'deal-1' });
      storageService.createPresignedPutUrl.mockResolvedValue('https://upload.example/put');

      const result = await service.presign({
        ownerType: ContentOwnerType.BUILDER_DEAL,
        ownerId: 'deal-1',
        filename: 'brief.pdf',
        contentType: 'application/pdf',
        size: 2048,
      });

      expect(result.uploadUrl).toBe('https://upload.example/put');
      expect(result.objectKey).toMatch(/^BUILDER_DEAL\/deal-1\//);
    });
  });

  describe('assertObjectKeyMatchesOwner', () => {
    it('accepts a matching objectKey prefix', () => {
      expect(() =>
        service.assertObjectKeyMatchesOwner(
          'BUILDER_DEAL/deal-1/abc-file.pdf',
          ContentOwnerType.BUILDER_DEAL,
          'deal-1',
        ),
      ).not.toThrow();
    });

    it('rejects a mismatched objectKey prefix', () => {
      expect(() =>
        service.assertObjectKeyMatchesOwner(
          'ORGANIZATION/org-1/abc-file.pdf',
          ContentOwnerType.BUILDER_DEAL,
          'deal-1',
        ),
      ).toThrow(BadRequestException);
    });
  });
});
