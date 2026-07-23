import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventCycleStatus, PlanPublishStatus } from '@prisma/client';
import { StorageService } from '../attachments/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { VenuePlansService } from './venue-plans.service';

const cycleId = 'cycle-1';
const planId = 'plan-1';

const basePlan = {
  id: planId,
  eventCycleId: cycleId,
  title: 'Main Hall',
  imageKey: null,
  imageWidth: null,
  imageHeight: null,
  pixelsPerMeter: null,
  gridOriginX: 0,
  gridOriginY: 0,
  publishStatus: PlanPublishStatus.UNPUBLISHED,
  createdAt: new Date(),
  updatedAt: new Date(),
  spaceAreas: [],
};

describe('VenuePlansService', () => {
  let service: VenuePlansService;
  let prisma: {
    venuePlan: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock };
    eventCycle: { findUnique: jest.Mock };
  };
  let storageService: {
    createPresignedPutUrl: jest.Mock;
    createPresignedGetUrl: jest.Mock;
    deleteObject: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      venuePlan: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      eventCycle: { findUnique: jest.fn() },
    };
    storageService = {
      createPresignedPutUrl: jest.fn().mockResolvedValue('https://upload.example/put'),
      createPresignedGetUrl: jest.fn().mockResolvedValue('https://get.example/image'),
      deleteObject: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VenuePlansService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storageService },
      ],
    }).compile();

    service = module.get(VenuePlansService);
  });

  describe('create', () => {
    it('rejects when the event cycle does not exist', async () => {
      prisma.eventCycle.findUnique.mockResolvedValue(null);

      await expect(service.create({ eventCycleId: cycleId, title: 'Main Hall' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects a closed event cycle', async () => {
      prisma.eventCycle.findUnique.mockResolvedValue({
        id: cycleId,
        status: EventCycleStatus.CLOSED,
      });

      await expect(service.create({ eventCycleId: cycleId, title: 'Main Hall' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects when the cycle already has a plan', async () => {
      prisma.eventCycle.findUnique.mockResolvedValue({
        id: cycleId,
        status: EventCycleStatus.ACTIVE,
      });
      prisma.venuePlan.findUnique.mockResolvedValue(basePlan);

      await expect(service.create({ eventCycleId: cycleId, title: 'Main Hall' })).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.venuePlan.create).not.toHaveBeenCalled();
    });

    it('creates a plan with no image yet (imageUrl null)', async () => {
      prisma.eventCycle.findUnique.mockResolvedValue({
        id: cycleId,
        status: EventCycleStatus.ACTIVE,
      });
      prisma.venuePlan.findUnique.mockResolvedValue(null);
      prisma.venuePlan.create.mockResolvedValue(basePlan);

      const result = await service.create({ eventCycleId: cycleId, title: 'Main Hall' });

      expect(result.imageUrl).toBeNull();
      expect(result.areas).toEqual([]);
    });
  });

  describe('update', () => {
    it('rejects when the plan does not exist', async () => {
      prisma.venuePlan.findUnique.mockResolvedValue(null);

      await expect(service.update(planId, { pixelsPerMeter: 20 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('applies calibration fields', async () => {
      prisma.venuePlan.findUnique.mockResolvedValue(basePlan);
      prisma.venuePlan.update.mockResolvedValue({ ...basePlan, pixelsPerMeter: 20 });

      const result = await service.update(planId, { pixelsPerMeter: 20 });

      expect(result.pixelsPerMeter).toBe(20);
      expect(prisma.venuePlan.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { pixelsPerMeter: 20 } }),
      );
    });
  });

  describe('setImage', () => {
    it('deletes the previous image object when replacing it', async () => {
      prisma.venuePlan.findUnique.mockResolvedValue({ ...basePlan, imageKey: 'old-key.png' });
      prisma.venuePlan.update.mockResolvedValue({
        ...basePlan,
        imageKey: 'new-key.png',
        imageWidth: 800,
        imageHeight: 600,
      });

      const result = await service.setImage(planId, {
        objectKey: 'new-key.png',
        width: 800,
        height: 600,
      });

      expect(storageService.deleteObject).toHaveBeenCalledWith('old-key.png');
      expect(result.imageUrl).toBe('https://get.example/image');
    });
  });
});
