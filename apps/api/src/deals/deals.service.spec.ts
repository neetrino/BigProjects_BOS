import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DealStage, EventCycleStatus, OrganizationType, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DealsService } from './deals.service';

const cycleId = 'cycle-1';
const organizationId = 'org-1';
const dealId = 'deal-1';
const contactId = 'contact-1';
const otherContactId = 'contact-2';
const staffId = 'staff-1';

const baseDeal = {
  id: dealId,
  eventCycleId: cycleId,
  organizationId,
  primaryContactId: null,
  assignedStaffId: null,
  stage: DealStage.NEW,
  expectedSqm: null,
  agreedAmount: null,
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  organization: {
    id: organizationId,
    name: 'Builder Co',
    type: OrganizationType.BUILDER,
    registrationId: null,
    phone: null,
    email: null,
    website: null,
    toonexpoCompanyId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  primaryContact: null,
  assignedStaff: null,
};

describe('DealsService', () => {
  let service: DealsService;
  let prisma: {
    builderDeal: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    eventCycle: { findUnique: jest.Mock };
    organization: { findUnique: jest.Mock };
    contact: { findUnique: jest.Mock };
    user: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      builderDeal: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      eventCycle: { findUnique: jest.fn() },
      organization: { findUnique: jest.fn() },
      contact: { findUnique: jest.fn() },
      user: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DealsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(DealsService);
  });

  describe('assertValidStageTransition', () => {
    it('allows free movement among active stages', async () => {
      await expect(
        service.assertValidStageTransition(DealStage.NEW, DealStage.CONTACTED, dealId),
      ).resolves.toBeUndefined();
      await expect(
        service.assertValidStageTransition(DealStage.CONTACTED, DealStage.NEGOTIATION, dealId),
      ).resolves.toBeUndefined();
      await expect(
        service.assertValidStageTransition(DealStage.NEGOTIATION, DealStage.NEW, dealId),
      ).resolves.toBeUndefined();
    });

    it('allows any active stage to LOST and LOST reopen to active', async () => {
      await expect(
        service.assertValidStageTransition(DealStage.CONTACTED, DealStage.LOST, dealId),
      ).resolves.toBeUndefined();
      await expect(
        service.assertValidStageTransition(DealStage.LOST, DealStage.NEGOTIATION, dealId),
      ).resolves.toBeUndefined();
    });

    it('rejects WON without an active venue-space allocation', async () => {
      await expect(
        service.assertValidStageTransition(DealStage.NEGOTIATION, DealStage.WON, dealId),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.assertValidStageTransition(DealStage.NEGOTIATION, DealStage.WON, dealId),
      ).rejects.toThrow('The deal cannot be won without an active venue-space allocation.');
    });

    it('rejects moving from WON to another stage', async () => {
      await expect(
        service.assertValidStageTransition(DealStage.WON, DealStage.NEGOTIATION, dealId),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects WON from a non-NEGOTIATION stage', async () => {
      await expect(
        service.assertValidStageTransition(DealStage.CONTACTED, DealStage.WON, dealId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('assertPrimaryContactBelongsToOrganization', () => {
    it('allows a contact that belongs to the organization', async () => {
      prisma.contact.findUnique.mockResolvedValue({
        id: contactId,
        organizationId,
      });

      await expect(
        service.assertPrimaryContactBelongsToOrganization(contactId, organizationId),
      ).resolves.toBeUndefined();
    });

    it('rejects a contact that belongs to another organization', async () => {
      prisma.contact.findUnique.mockResolvedValue({
        id: otherContactId,
        organizationId: 'other-org',
      });

      await expect(
        service.assertPrimaryContactBelongsToOrganization(otherContactId, organizationId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('rejects deals for a closed event cycle', async () => {
      prisma.eventCycle.findUnique.mockResolvedValue({
        id: cycleId,
        status: EventCycleStatus.CLOSED,
      });

      await expect(service.create({ eventCycleId: cycleId, organizationId })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('creates a deal when cycle and organization are valid', async () => {
      prisma.eventCycle.findUnique.mockResolvedValue({
        id: cycleId,
        status: EventCycleStatus.ACTIVE,
      });
      prisma.organization.findUnique.mockResolvedValue({ id: organizationId });
      prisma.builderDeal.create.mockResolvedValue(baseDeal);

      const result = await service.create({ eventCycleId: cycleId, organizationId });

      expect(result.areasSummary).toEqual({ count: 0, totalSqm: 0, labels: [] });
      expect(result.organization.id).toBe(organizationId);
    });
  });

  describe('update stage', () => {
    it('blocks WON transition via update', async () => {
      prisma.builderDeal.findUnique.mockResolvedValue({
        ...baseDeal,
        stage: DealStage.NEGOTIATION,
      });

      await expect(service.update(dealId, { stage: DealStage.WON })).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.builderDeal.update).not.toHaveBeenCalled();
    });
  });

  describe('assigned staff validation', () => {
    it('rejects inactive assigned staff on create', async () => {
      prisma.eventCycle.findUnique.mockResolvedValue({
        id: cycleId,
        status: EventCycleStatus.DRAFT,
      });
      prisma.organization.findUnique.mockResolvedValue({ id: organizationId });
      prisma.user.findUnique.mockResolvedValue({
        id: staffId,
        status: UserStatus.DISABLED,
      });

      await expect(
        service.create({
          eventCycleId: cycleId,
          organizationId,
          assignedStaffId: staffId,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update nullable fields', () => {
    const dealWithRelations = {
      ...baseDeal,
      primaryContactId: contactId,
      assignedStaffId: staffId,
      expectedSqm: 100,
      agreedAmount: 5000,
      description: 'Existing notes',
      primaryContact: {
        id: contactId,
        name: 'Jane',
        phone: null,
        email: null,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      assignedStaff: {
        id: staffId,
        name: 'Staff User',
        email: 'staff@example.com',
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    beforeEach(() => {
      prisma.builderDeal.findUnique.mockResolvedValue(dealWithRelations);
      prisma.builderDeal.update.mockImplementation(async ({ data }) => ({
        ...dealWithRelations,
        ...data,
        primaryContactId:
          data.primaryContact !== undefined
            ? data.primaryContact.disconnect
              ? null
              : data.primaryContact.connect.id
            : dealWithRelations.primaryContactId,
        assignedStaffId:
          data.assignedStaff !== undefined
            ? data.assignedStaff.disconnect
              ? null
              : data.assignedStaff.connect.id
            : dealWithRelations.assignedStaffId,
        primaryContact: data.primaryContact?.disconnect ? null : dealWithRelations.primaryContact,
        assignedStaff: data.assignedStaff?.disconnect ? null : dealWithRelations.assignedStaff,
      }));
    });

    it('disconnects primary contact when primaryContactId is null', async () => {
      await service.update(dealId, { primaryContactId: null });

      expect(prisma.builderDeal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            primaryContact: { disconnect: true },
          }),
        }),
      );
    });

    it('disconnects assigned staff when assignedStaffId is null', async () => {
      await service.update(dealId, { assignedStaffId: null });

      expect(prisma.builderDeal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            assignedStaff: { disconnect: true },
          }),
        }),
      );
    });

    it('leaves absent relation and scalar fields unchanged', async () => {
      await service.update(dealId, { stage: DealStage.CONTACTED });

      const updateCall = prisma.builderDeal.update.mock.calls[0][0];
      expect(updateCall.data).toEqual({ stage: DealStage.CONTACTED });
    });

    it('clears scalar fields when explicit null is sent', async () => {
      await service.update(dealId, {
        expectedSqm: null,
        agreedAmount: null,
        description: null,
      });

      expect(prisma.builderDeal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            expectedSqm: null,
            agreedAmount: null,
            description: null,
          }),
        }),
      );
    });

    it('rejects an invalid primary contact id', async () => {
      prisma.contact.findUnique.mockResolvedValue(null);

      await expect(service.update(dealId, { primaryContactId: 'missing-contact' })).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.builderDeal.update).not.toHaveBeenCalled();
    });

    it('rejects an invalid assigned staff id', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.update(dealId, { assignedStaffId: 'missing-staff' })).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.builderDeal.update).not.toHaveBeenCalled();
    });
  });
});
