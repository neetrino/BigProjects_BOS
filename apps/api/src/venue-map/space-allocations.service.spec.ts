import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DealStage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SpaceAllocationsService } from './space-allocations.service';

const areaId = 'area-1';
const dealId = 'deal-1';
const partnerId = 'partner-1';
const cycleId = 'cycle-1';

const freeArea = {
  id: areaId,
  venuePlan: { id: 'plan-1', eventCycleId: cycleId },
  allocations: [],
};

const assignedArea = {
  id: areaId,
  venuePlan: { id: 'plan-1', eventCycleId: cycleId },
  allocations: [{ id: 'alloc-existing', active: true }],
};

describe('SpaceAllocationsService', () => {
  let service: SpaceAllocationsService;
  let prisma: {
    spaceArea: { findUnique: jest.Mock };
    builderDeal: { findUnique: jest.Mock };
    partnerParticipation: { findUnique: jest.Mock };
    spaceAllocation: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      spaceArea: { findUnique: jest.fn() },
      builderDeal: { findUnique: jest.fn() },
      partnerParticipation: { findUnique: jest.fn() },
      spaceAllocation: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SpaceAllocationsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(SpaceAllocationsService);
  });

  describe('assign', () => {
    it('rejects when neither target is provided', async () => {
      await expect(service.assign(areaId, {})).rejects.toThrow(BadRequestException);
    });

    it('rejects when both targets are provided', async () => {
      await expect(
        service.assign(areaId, { builderDealId: dealId, partnerParticipationId: partnerId }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects when the area already has an active allocation', async () => {
      prisma.spaceArea.findUnique.mockResolvedValue(assignedArea);

      await expect(service.assign(areaId, { builderDealId: dealId })).rejects.toThrow(
        ConflictException,
      );
    });

    it('rejects when the area does not exist', async () => {
      prisma.spaceArea.findUnique.mockResolvedValue(null);

      await expect(service.assign(areaId, { builderDealId: dealId })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects when the builder deal does not exist', async () => {
      prisma.spaceArea.findUnique.mockResolvedValue(freeArea);
      prisma.builderDeal.findUnique.mockResolvedValue(null);

      await expect(service.assign(areaId, { builderDealId: dealId })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects when the deal belongs to a different event cycle than the plan', async () => {
      prisma.spaceArea.findUnique.mockResolvedValue(freeArea);
      prisma.builderDeal.findUnique.mockResolvedValue({
        id: dealId,
        eventCycleId: 'other-cycle',
        stage: DealStage.NEGOTIATION,
      });

      await expect(service.assign(areaId, { builderDealId: dealId })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects assigning an area to a LOST deal', async () => {
      prisma.spaceArea.findUnique.mockResolvedValue(freeArea);
      prisma.builderDeal.findUnique.mockResolvedValue({
        id: dealId,
        eventCycleId: cycleId,
        stage: DealStage.LOST,
      });

      await expect(service.assign(areaId, { builderDealId: dealId })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('assigns a free area to a valid, non-lost builder deal', async () => {
      prisma.spaceArea.findUnique.mockResolvedValue(freeArea);
      prisma.builderDeal.findUnique.mockResolvedValue({
        id: dealId,
        eventCycleId: cycleId,
        stage: DealStage.NEGOTIATION,
      });
      prisma.spaceAllocation.create.mockResolvedValue({
        id: 'alloc-1',
        spaceAreaId: areaId,
        builderDealId: dealId,
        partnerParticipationId: null,
        active: true,
        assignedAt: new Date(),
        releasedAt: null,
      });

      const result = await service.assign(areaId, { builderDealId: dealId });

      expect(result).toMatchObject({ kind: 'BUILDER', targetId: dealId, active: true });
    });

    it('rejects when the partner belongs to a different event cycle than the plan', async () => {
      prisma.spaceArea.findUnique.mockResolvedValue(freeArea);
      prisma.partnerParticipation.findUnique.mockResolvedValue({
        id: partnerId,
        eventCycleId: 'other-cycle',
      });

      await expect(
        service.assign(areaId, { partnerParticipationId: partnerId }),
      ).rejects.toThrow(BadRequestException);
    });

    it('assigns a free area to a valid partner participation', async () => {
      prisma.spaceArea.findUnique.mockResolvedValue(freeArea);
      prisma.partnerParticipation.findUnique.mockResolvedValue({
        id: partnerId,
        eventCycleId: cycleId,
      });
      prisma.spaceAllocation.create.mockResolvedValue({
        id: 'alloc-2',
        spaceAreaId: areaId,
        builderDealId: null,
        partnerParticipationId: partnerId,
        active: true,
        assignedAt: new Date(),
        releasedAt: null,
      });

      const result = await service.assign(areaId, { partnerParticipationId: partnerId });

      expect(result).toMatchObject({ kind: 'PARTNER', targetId: partnerId, active: true });
    });
  });

  describe('release', () => {
    it('rejects when the allocation does not exist', async () => {
      prisma.spaceAllocation.findUnique.mockResolvedValue(null);

      await expect(service.release('alloc-1')).rejects.toThrow(NotFoundException);
    });

    it('is idempotent: rejects releasing an already-released allocation', async () => {
      prisma.spaceAllocation.findUnique.mockResolvedValue({ id: 'alloc-1', active: false });

      await expect(service.release('alloc-1')).rejects.toThrow(ConflictException);
      expect(prisma.spaceAllocation.update).not.toHaveBeenCalled();
    });

    it('releases an active allocation', async () => {
      prisma.spaceAllocation.findUnique.mockResolvedValue({
        id: 'alloc-1',
        active: true,
        builderDealId: dealId,
        partnerParticipationId: null,
      });
      prisma.spaceAllocation.update.mockResolvedValue({
        id: 'alloc-1',
        spaceAreaId: areaId,
        builderDealId: dealId,
        partnerParticipationId: null,
        active: false,
        assignedAt: new Date(),
        releasedAt: new Date(),
      });

      const result = await service.release('alloc-1');

      expect(result.active).toBe(false);
      expect(result.releasedAt).not.toBeNull();
    });
  });
});
