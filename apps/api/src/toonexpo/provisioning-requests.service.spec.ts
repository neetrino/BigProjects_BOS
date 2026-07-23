import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationType, PartnerStage, ToonExpoRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProvisioningRequestsService } from './provisioning-requests.service';
import { ToonExpoClientService } from './toonexpo-client.service';

const organizationId = 'org-1';
const eventCycleId = 'cycle-1';
const requestId = 'req-1';

const organization = { id: organizationId, name: 'Acme Builders', type: OrganizationType.BUILDER };
const eventCycle = { id: eventCycleId, name: 'Expo 2026', code: 'EXPO-2026' };
const primaryContact = {
  id: 'contact-1',
  organizationId,
  name: 'Jane Doe',
  email: 'jane@acme.test',
  phone: '+374 00 000000',
  isPrimary: true,
};
const pendingRow = {
  id: requestId,
  organizationId,
  eventCycleId,
  companyType: OrganizationType.BUILDER,
  contactName: primaryContact.name,
  contactEmail: primaryContact.email,
  contactPhone: primaryContact.phone,
  requestedModules: ['builder_portal'],
  status: ToonExpoRequestStatus.PENDING,
  toonexpoCompanyId: null,
  toonexpoUserId: null,
  errorMessage: null,
  attemptCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProvisioningRequestsService', () => {
  let service: ProvisioningRequestsService;
  let prisma: {
    organization: { findUnique: jest.Mock; update: jest.Mock };
    eventCycle: { findUnique: jest.Mock };
    contact: { findFirst: jest.Mock };
    builderDeal: { findFirst: jest.Mock };
    partnerParticipation: { findFirst: jest.Mock };
    toonExpoProvisioningRequest: {
      create: jest.Mock;
      update: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let client: { provisionCompany: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      organization: { findUnique: jest.fn().mockResolvedValue(organization), update: jest.fn() },
      eventCycle: { findUnique: jest.fn().mockResolvedValue(eventCycle) },
      contact: { findFirst: jest.fn().mockResolvedValue(primaryContact) },
      builderDeal: { findFirst: jest.fn().mockResolvedValue({ id: 'deal-1' }) },
      partnerParticipation: { findFirst: jest.fn().mockResolvedValue(null) },
      toonExpoProvisioningRequest: {
        create: jest.fn().mockResolvedValue(pendingRow),
        update: jest.fn().mockImplementation(async ({ data }) => ({ ...pendingRow, ...data })),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    client = { provisionCompany: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvisioningRequestsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ToonExpoClientService, useValue: client },
      ],
    }).compile();

    service = module.get(ProvisioningRequestsService);
  });

  describe('eligibility', () => {
    it('rejects when the organization has no WON deal or CONFIRMED partner participation', async () => {
      prisma.builderDeal.findFirst.mockResolvedValue(null);
      prisma.partnerParticipation.findFirst.mockResolvedValue(null);

      await expect(
        service.create({ organizationId, eventCycleId, requestedModules: ['builder_portal'] }),
      ).rejects.toThrow(BadRequestException);
      expect(client.provisionCompany).not.toHaveBeenCalled();
    });

    it('rejects when the organization has no primary contact with an email', async () => {
      prisma.contact.findFirst.mockResolvedValue(null);

      await expect(
        service.create({ organizationId, eventCycleId, requestedModules: ['builder_portal'] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('infers PARTNER company type from a CONFIRMED partner participation', async () => {
      prisma.builderDeal.findFirst.mockResolvedValue(null);
      prisma.partnerParticipation.findFirst.mockResolvedValue({
        id: 'partner-1',
        stage: PartnerStage.CONFIRMED,
      });
      client.provisionCompany.mockResolvedValue({
        request_id: requestId,
        toonexpo_company_id: 'toon-co-1',
        primary_user_id: 'toon-user-1',
        status: 'success',
        created_at: new Date().toISOString(),
      });

      await service.create({ organizationId, eventCycleId, requestedModules: ['partner_profile'] });

      expect(prisma.toonExpoProvisioningRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ companyType: OrganizationType.PARTNER }) }),
      );
    });
  });

  describe('wire payload', () => {
    it('builds the ToonExpo request with snake_case fields and modules from the row', async () => {
      client.provisionCompany.mockResolvedValue({
        request_id: requestId,
        toonexpo_company_id: 'toon-co-1',
        primary_user_id: 'toon-user-1',
        status: 'success',
        created_at: new Date().toISOString(),
      });

      await service.create({ organizationId, eventCycleId, requestedModules: ['builder_portal'] });

      expect(client.provisionCompany).toHaveBeenCalledWith({
        request_id: requestId,
        bos_company_id: organizationId,
        company_name: organization.name,
        company_type: 'builder',
        primary_contact_name: primaryContact.name,
        primary_contact_email: primaryContact.email,
        primary_contact_phone: primaryContact.phone,
        event_cycle_id: eventCycleId,
        event_cycle_name: eventCycle.name,
        requested_modules: ['builder_portal'],
      });
    });
  });

  describe('result handling', () => {
    it('marks the row FAILED (without throwing) when the client rejects', async () => {
      client.provisionCompany.mockRejectedValue(new Error('ECONNREFUSED'));

      const result = await service.create({
        organizationId,
        eventCycleId,
        requestedModules: ['builder_portal'],
      });

      expect(result.status).toBe(ToonExpoRequestStatus.FAILED);
      expect(result.errorMessage).toContain('ECONNREFUSED');
      expect(prisma.organization.update).not.toHaveBeenCalled();
    });

    it('stores toonexpoCompanyId on the organization on success', async () => {
      client.provisionCompany.mockResolvedValue({
        request_id: requestId,
        toonexpo_company_id: 'toon-co-1',
        primary_user_id: 'toon-user-1',
        status: 'success',
        created_at: new Date().toISOString(),
      });

      const result = await service.create({
        organizationId,
        eventCycleId,
        requestedModules: ['builder_portal'],
      });

      expect(result.status).toBe(ToonExpoRequestStatus.SUCCESS);
      expect(prisma.organization.update).toHaveBeenCalledWith({
        where: { id: organizationId },
        data: { toonexpoCompanyId: 'toon-co-1' },
      });
    });

    it('treats an unknown wire status as FAILED with the raw status in the message', async () => {
      client.provisionCompany.mockResolvedValue({
        request_id: requestId,
        toonexpo_company_id: null,
        primary_user_id: null,
        status: 'weird_unexpected_status',
        created_at: new Date().toISOString(),
      });

      const result = await service.create({
        organizationId,
        eventCycleId,
        requestedModules: ['builder_portal'],
      });

      expect(result.status).toBe(ToonExpoRequestStatus.FAILED);
      expect(result.errorMessage).toContain('weird_unexpected_status');
    });
  });

  describe('retry', () => {
    it('rejects retrying a request that is not FAILED', async () => {
      prisma.toonExpoProvisioningRequest.findUnique.mockResolvedValue({
        ...pendingRow,
        status: ToonExpoRequestStatus.SUCCESS,
      });

      await expect(service.retry(requestId)).rejects.toThrow(BadRequestException);
      expect(client.provisionCompany).not.toHaveBeenCalled();
    });

    it('resends the same request_id on retry', async () => {
      prisma.toonExpoProvisioningRequest.findUnique.mockResolvedValue({
        ...pendingRow,
        status: ToonExpoRequestStatus.FAILED,
      });
      client.provisionCompany.mockResolvedValue({
        request_id: requestId,
        toonexpo_company_id: 'toon-co-1',
        primary_user_id: 'toon-user-1',
        status: 'success',
        created_at: new Date().toISOString(),
      });

      await service.retry(requestId);

      expect(client.provisionCompany).toHaveBeenCalledWith(
        expect.objectContaining({ request_id: requestId }),
      );
    });
  });
});
