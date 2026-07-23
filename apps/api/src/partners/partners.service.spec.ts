import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventCycleStatus, OrganizationType, PartnerStage, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PartnersService } from './partners.service';

const cycleId = 'cycle-1';
const organizationId = 'org-1';
const partnerId = 'partner-1';
const contactId = 'contact-1';
const otherContactId = 'contact-2';
const staffId = 'staff-1';

const basePartner = {
  id: partnerId,
  eventCycleId: cycleId,
  organizationId,
  primaryContactId: null,
  assignedStaffId: null,
  stage: PartnerStage.NEW,
  partnerType: null,
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  organization: {
    id: organizationId,
    name: 'Partner Bank',
    type: OrganizationType.BANK,
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

describe('PartnersService', () => {
  let service: PartnersService;
  let prisma: {
    partnerParticipation: {
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
      partnerParticipation: {
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
      providers: [PartnersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(PartnersService);
  });

  describe('assertValidStageTransition', () => {
    it('allows free movement among active stages', async () => {
      await expect(
        service.assertValidStageTransition(PartnerStage.NEW, PartnerStage.CONTACTED),
      ).resolves.toBeUndefined();
      await expect(
        service.assertValidStageTransition(PartnerStage.CONTACTED, PartnerStage.NEW),
      ).resolves.toBeUndefined();
    });

    it('allows CONTACTED to CONFIRMED without area allocation', async () => {
      await expect(
        service.assertValidStageTransition(PartnerStage.CONTACTED, PartnerStage.CONFIRMED),
      ).resolves.toBeUndefined();
    });

    it('rejects CONFIRMED from NEW', async () => {
      await expect(
        service.assertValidStageTransition(PartnerStage.NEW, PartnerStage.CONFIRMED),
      ).rejects.toThrow(BadRequestException);
    });

    it('allows any active stage to DECLINED and reopen to active', async () => {
      await expect(
        service.assertValidStageTransition(PartnerStage.CONTACTED, PartnerStage.DECLINED),
      ).resolves.toBeUndefined();
      await expect(
        service.assertValidStageTransition(PartnerStage.DECLINED, PartnerStage.CONTACTED),
      ).resolves.toBeUndefined();
      await expect(
        service.assertValidStageTransition(PartnerStage.CONFIRMED, PartnerStage.NEW),
      ).resolves.toBeUndefined();
    });

    it('rejects CONFIRMED to DECLINED directly', async () => {
      await expect(
        service.assertValidStageTransition(PartnerStage.CONFIRMED, PartnerStage.DECLINED),
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
    it('rejects partners for a closed event cycle', async () => {
      prisma.eventCycle.findUnique.mockResolvedValue({
        id: cycleId,
        status: EventCycleStatus.CLOSED,
      });

      await expect(service.create({ eventCycleId: cycleId, organizationId })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('creates a partner when cycle and organization are valid', async () => {
      prisma.eventCycle.findUnique.mockResolvedValue({
        id: cycleId,
        status: EventCycleStatus.ACTIVE,
      });
      prisma.organization.findUnique.mockResolvedValue({ id: organizationId });
      prisma.partnerParticipation.create.mockResolvedValue(basePartner);

      const result = await service.create({ eventCycleId: cycleId, organizationId });

      expect(result.areasSummary).toEqual({ count: 0, totalSqm: 0, labels: [] });
      expect(result.organization.id).toBe(organizationId);
    });
  });

  describe('update stage', () => {
    it('allows CONFIRMED transition via update from CONTACTED', async () => {
      prisma.partnerParticipation.findUnique.mockResolvedValue({
        ...basePartner,
        stage: PartnerStage.CONTACTED,
      });
      prisma.partnerParticipation.update.mockResolvedValue({
        ...basePartner,
        stage: PartnerStage.CONFIRMED,
      });

      await service.update(partnerId, { stage: PartnerStage.CONFIRMED });

      expect(prisma.partnerParticipation.update).toHaveBeenCalled();
    });

    it('blocks CONFIRMED transition from NEW via update', async () => {
      prisma.partnerParticipation.findUnique.mockResolvedValue(basePartner);

      await expect(service.update(partnerId, { stage: PartnerStage.CONFIRMED })).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.partnerParticipation.update).not.toHaveBeenCalled();
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
    const partnerWithRelations = {
      ...basePartner,
      primaryContactId: contactId,
      assignedStaffId: staffId,
      partnerType: 'sponsor',
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
      prisma.partnerParticipation.findUnique.mockResolvedValue(partnerWithRelations);
      prisma.partnerParticipation.update.mockImplementation(async ({ data }) => ({
        ...partnerWithRelations,
        ...data,
        primaryContactId:
          data.primaryContact !== undefined
            ? data.primaryContact.disconnect
              ? null
              : data.primaryContact.connect.id
            : partnerWithRelations.primaryContactId,
        assignedStaffId:
          data.assignedStaff !== undefined
            ? data.assignedStaff.disconnect
              ? null
              : data.assignedStaff.connect.id
            : partnerWithRelations.assignedStaffId,
        primaryContact: data.primaryContact?.disconnect
          ? null
          : partnerWithRelations.primaryContact,
        assignedStaff: data.assignedStaff?.disconnect ? null : partnerWithRelations.assignedStaff,
      }));
    });

    it('disconnects primary contact when primaryContactId is null', async () => {
      await service.update(partnerId, { primaryContactId: null });

      expect(prisma.partnerParticipation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            primaryContact: { disconnect: true },
          }),
        }),
      );
    });

    it('disconnects assigned staff when assignedStaffId is null', async () => {
      await service.update(partnerId, { assignedStaffId: null });

      expect(prisma.partnerParticipation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            assignedStaff: { disconnect: true },
          }),
        }),
      );
    });

    it('leaves absent relation and scalar fields unchanged', async () => {
      await service.update(partnerId, { stage: PartnerStage.CONTACTED });

      const updateCall = prisma.partnerParticipation.update.mock.calls[0][0];
      expect(updateCall.data).toEqual({ stage: PartnerStage.CONTACTED });
    });

    it('clears scalar fields when explicit null is sent', async () => {
      await service.update(partnerId, {
        partnerType: null,
        description: null,
      });

      expect(prisma.partnerParticipation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            partnerType: null,
            description: null,
          }),
        }),
      );
    });

    it('rejects an invalid primary contact id', async () => {
      prisma.contact.findUnique.mockResolvedValue(null);

      await expect(
        service.update(partnerId, { primaryContactId: 'missing-contact' }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.partnerParticipation.update).not.toHaveBeenCalled();
    });

    it('rejects an invalid assigned staff id', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.update(partnerId, { assignedStaffId: 'missing-staff' })).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.partnerParticipation.update).not.toHaveBeenCalled();
    });
  });
});
