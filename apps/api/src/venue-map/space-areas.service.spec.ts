import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PublicDisplayMode } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SpaceAreasService } from './space-areas.service';

const planId = 'plan-1';
const areaId = 'area-1';

const calibratedPlan = {
  id: planId,
  eventCycleId: 'cycle-1',
  title: 'Main Hall',
  pixelsPerMeter: 20,
};

const rectangleCells = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
];

const createdArea = {
  id: areaId,
  code: null,
  name: 'A1',
  squareMeters: 4,
  publicDisplayMode: PublicDisplayMode.ORGANIZATION,
  customPublicLabel: null,
  createdAt: new Date(),
  cells: rectangleCells,
  allocations: [],
};

describe('SpaceAreasService', () => {
  let service: SpaceAreasService;
  let prisma: {
    venuePlan: { findUnique: jest.Mock };
    spaceArea: {
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      create: jest.Mock;
      findUniqueOrThrow: jest.Mock;
    };
    spaceAreaCell: { findFirst: jest.Mock; createMany: jest.Mock };
    spaceAllocation: { deleteMany: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      venuePlan: { findUnique: jest.fn() },
      spaceArea: {
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        create: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      spaceAreaCell: { findFirst: jest.fn(), createMany: jest.fn() },
      spaceAllocation: { deleteMany: jest.fn() },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SpaceAreasService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(SpaceAreasService);
  });

  describe('create', () => {
    it('rejects when the plan does not exist', async () => {
      prisma.venuePlan.findUnique.mockResolvedValue(null);

      await expect(service.create(planId, { name: 'A1', cells: rectangleCells })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects when the plan is not calibrated', async () => {
      prisma.venuePlan.findUnique.mockResolvedValue({ ...calibratedPlan, pixelsPerMeter: null });

      await expect(service.create(planId, { name: 'A1', cells: rectangleCells })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(planId, { name: 'A1', cells: rectangleCells })).rejects.toThrow(
        'calibrated',
      );
    });

    it('rejects non-rectangular cell shapes', async () => {
      prisma.venuePlan.findUnique.mockResolvedValue(calibratedPlan);

      const nonRectangle = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ];

      await expect(service.create(planId, { name: 'A1', cells: nonRectangle })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects when cells overlap an existing area', async () => {
      prisma.venuePlan.findUnique.mockResolvedValue(calibratedPlan);
      prisma.spaceAreaCell.findFirst.mockResolvedValue({ x: 0, y: 0 });

      await expect(service.create(planId, { name: 'A1', cells: rectangleCells })).rejects.toThrow(
        ConflictException,
      );
    });

    it('creates the area and its cells in a transaction, with squareMeters = cell count', async () => {
      prisma.venuePlan.findUnique.mockResolvedValue(calibratedPlan);
      prisma.spaceAreaCell.findFirst.mockResolvedValue(null);
      prisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        prisma.spaceArea.create.mockResolvedValue({ id: areaId });
        prisma.spaceArea.findUniqueOrThrow.mockResolvedValue(createdArea);
        return fn(prisma);
      });

      const result = await service.create(planId, { name: 'A1', cells: rectangleCells });

      expect(prisma.spaceArea.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ squareMeters: 4 }) }),
      );
      expect(prisma.spaceAreaCell.createMany).toHaveBeenCalled();
      expect(result.squareMeters).toBe(4);
      expect(result.cells).toHaveLength(4);
      expect(result.allocation).toBeNull();
    });
  });

  describe('update', () => {
    it('requires customPublicLabel when publicDisplayMode is CUSTOM_LABEL', async () => {
      prisma.spaceArea.findUnique.mockResolvedValue({ ...createdArea, customPublicLabel: null });

      await expect(
        service.update(areaId, { publicDisplayMode: PublicDisplayMode.CUSTOM_LABEL }),
      ).rejects.toThrow(BadRequestException);
    });

    it('allows CUSTOM_LABEL when a label is provided in the same request', async () => {
      prisma.spaceArea.findUnique.mockResolvedValue({ ...createdArea, customPublicLabel: null });
      prisma.spaceArea.update.mockResolvedValue({
        ...createdArea,
        publicDisplayMode: PublicDisplayMode.CUSTOM_LABEL,
        customPublicLabel: 'Sponsor Zone',
      });

      const result = await service.update(areaId, {
        publicDisplayMode: PublicDisplayMode.CUSTOM_LABEL,
        customPublicLabel: 'Sponsor Zone',
      });

      expect(result.customPublicLabel).toBe('Sponsor Zone');
    });

    it('rejects when the area does not exist', async () => {
      prisma.spaceArea.findUnique.mockResolvedValue(null);

      await expect(service.update(areaId, { name: 'New name' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('rejects deletion when an active allocation exists', async () => {
      prisma.spaceArea.findUnique.mockResolvedValue({
        ...createdArea,
        allocations: [{ id: 'alloc-1', active: true }],
      });

      await expect(service.remove(areaId)).rejects.toThrow(ConflictException);
      expect(prisma.spaceArea.delete).not.toHaveBeenCalled();
    });

    it('deletes a free area, clearing any released allocation history first', async () => {
      prisma.spaceArea.findUnique.mockResolvedValue({ ...createdArea, allocations: [] });
      prisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
        fn(prisma),
      );

      await service.remove(areaId);

      expect(prisma.spaceAllocation.deleteMany).toHaveBeenCalledWith({
        where: { spaceAreaId: areaId },
      });
      expect(prisma.spaceArea.delete).toHaveBeenCalledWith({ where: { id: areaId } });
    });

    it('rejects when the area does not exist', async () => {
      prisma.spaceArea.findUnique.mockResolvedValue(null);

      await expect(service.remove(areaId)).rejects.toThrow(NotFoundException);
    });
  });
});
