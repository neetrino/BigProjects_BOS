import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventCycleStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CyclesService } from './cycles.service';

const existingCycle = {
  id: 'cycle-1',
  name: 'ToonExpo 2026-1',
  code: 'TE2026-1',
  status: EventCycleStatus.DRAFT,
  startsAt: null,
  endsAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CyclesService', () => {
  let service: CyclesService;
  let prisma: {
    eventCycle: {
      findMany: jest.Mock;
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      eventCycle: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CyclesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CyclesService);
  });

  describe('create', () => {
    it('maps a duplicate-code database error to a readable 409', async () => {
      const conflictError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      });
      prisma.eventCycle.create.mockRejectedValue(conflictError);

      await expect(service.create({ name: 'Duplicate', code: existingCycle.code })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('throws when the target cycle does not exist', async () => {
      prisma.eventCycle.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('maps a duplicate-code database error to a readable 409', async () => {
      prisma.eventCycle.findUnique.mockResolvedValue(existingCycle);
      const conflictError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      });
      prisma.eventCycle.update.mockRejectedValue(conflictError);

      await expect(service.update(existingCycle.id, { code: 'TE2026-2' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('assertValidStatusTransition', () => {
    it('allows DRAFT to ACTIVE', () => {
      expect(() =>
        service.assertValidStatusTransition(EventCycleStatus.DRAFT, EventCycleStatus.ACTIVE),
      ).not.toThrow();
    });

    it('allows ACTIVE to CLOSED', () => {
      expect(() =>
        service.assertValidStatusTransition(EventCycleStatus.ACTIVE, EventCycleStatus.CLOSED),
      ).not.toThrow();
    });

    it('allows keeping the same status', () => {
      expect(() =>
        service.assertValidStatusTransition(EventCycleStatus.DRAFT, EventCycleStatus.DRAFT),
      ).not.toThrow();
    });

    it('rejects DRAFT to CLOSED', () => {
      expect(() =>
        service.assertValidStatusTransition(EventCycleStatus.DRAFT, EventCycleStatus.CLOSED),
      ).toThrow(BadRequestException);
    });

    it('rejects CLOSED to ACTIVE', () => {
      expect(() =>
        service.assertValidStatusTransition(EventCycleStatus.CLOSED, EventCycleStatus.ACTIVE),
      ).toThrow(BadRequestException);
    });
  });
});
