import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  Contact,
  DealStage,
  EventCycle,
  Organization,
  OrganizationType,
  PartnerStage,
  ToonExpoProvisioningRequest,
  ToonExpoRequestStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProvisioningRequestDto } from './dto/create-provisioning-request.dto';
import { ListProvisioningRequestsQueryDto } from './dto/list-provisioning-requests-query.dto';
import { ProvisioningRequestResponseDto } from './dto/provisioning-request-response.dto';
import { ToonExpoClientService } from './toonexpo-client.service';
import { mapCompanyTypeToWire, mapProvisioningStatusFromWire } from './toonexpo-mappers.util';
import { toProvisioningResponse } from './toonexpo-response.mapper';
import { ToonExpoModuleWire, ToonExpoProvisioningRequestWire } from './types/toonexpo-wire.types';

const ORGANIZATION_NOT_FOUND_MESSAGE = 'Organization not found.';
const CYCLE_NOT_FOUND_MESSAGE = 'Event cycle not found.';
const REQUEST_NOT_FOUND_MESSAGE = 'ToonExpo provisioning request not found.';
const RETRY_ONLY_FAILED_MESSAGE = 'Only a failed provisioning request can be retried.';
const NOT_ELIGIBLE_MESSAGE =
  'Organization is not eligible for a ToonExpo account: it needs a WON builder deal or a ' +
  'CONFIRMED partner participation in this event cycle.';
const NO_PRIMARY_CONTACT_MESSAGE =
  'Organization has no primary contact with an email address; add one before requesting an account.';

type EligibilityContext = { companyType: OrganizationType };

@Injectable()
export class ProvisioningRequestsService {
  private readonly logger = new Logger(ProvisioningRequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly client: ToonExpoClientService,
  ) {}

  async create(dto: CreateProvisioningRequestDto): Promise<ProvisioningRequestResponseDto> {
    const organization = await this.getOrganizationOrThrow(dto.organizationId);
    const eventCycle = await this.getEventCycleOrThrow(dto.eventCycleId);
    const eligibility = await this.assertEligible(dto.organizationId, dto.eventCycleId);
    const contact = await this.resolvePrimaryContact(dto.organizationId);

    const row = await this.prisma.toonExpoProvisioningRequest.create({
      data: {
        organizationId: dto.organizationId,
        eventCycleId: dto.eventCycleId,
        companyType: dto.companyType ?? eligibility.companyType,
        contactName: contact.name,
        contactEmail: contact.email as string,
        contactPhone: contact.phone,
        requestedModules: dto.requestedModules,
        status: ToonExpoRequestStatus.PENDING,
      },
    });

    return this.sendAndPersist(row, organization, eventCycle);
  }

  async retry(id: string): Promise<ProvisioningRequestResponseDto> {
    const row = await this.getRequestOrThrow(id);
    if (row.status !== ToonExpoRequestStatus.FAILED) {
      throw new BadRequestException(RETRY_ONLY_FAILED_MESSAGE);
    }

    const organization = await this.getOrganizationOrThrow(row.organizationId);
    const eventCycle = await this.getEventCycleOrThrow(row.eventCycleId);
    return this.sendAndPersist(row, organization, eventCycle);
  }

  async list(query: ListProvisioningRequestsQueryDto): Promise<ProvisioningRequestResponseDto[]> {
    const rows = await this.prisma.toonExpoProvisioningRequest.findMany({
      where: {
        ...(query.organizationId && { organizationId: query.organizationId }),
        ...(query.cycleId && { eventCycleId: query.cycleId }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => toProvisioningResponse(row));
  }

  private async sendAndPersist(
    row: ToonExpoProvisioningRequest,
    organization: Organization,
    eventCycle: EventCycle,
  ): Promise<ProvisioningRequestResponseDto> {
    const payload = this.buildWirePayload(row, organization, eventCycle);

    try {
      const response = await this.client.provisionCompany(payload);
      return await this.persistResult(row.id, response);
    } catch (error: unknown) {
      return await this.persistFailure(row.id, error);
    }
  }

  private buildWirePayload(
    row: ToonExpoProvisioningRequest,
    organization: Organization,
    eventCycle: EventCycle,
  ): ToonExpoProvisioningRequestWire {
    return {
      request_id: row.id,
      bos_company_id: organization.id,
      company_name: organization.name,
      company_type: mapCompanyTypeToWire(row.companyType),
      primary_contact_name: row.contactName,
      primary_contact_email: row.contactEmail,
      ...(row.contactPhone && { primary_contact_phone: row.contactPhone }),
      event_cycle_id: eventCycle.id,
      event_cycle_name: eventCycle.name,
      requested_modules: row.requestedModules as ToonExpoModuleWire[],
    };
  }

  private async persistResult(
    id: string,
    response: {
      status: string;
      toonexpo_company_id: string | null;
      primary_user_id: string | null;
      error_message?: string;
    },
  ): Promise<ProvisioningRequestResponseDto> {
    const status = mapProvisioningStatusFromWire(response.status);
    const isSuccessLike =
      status === ToonExpoRequestStatus.SUCCESS || status === ToonExpoRequestStatus.LINKED_EXISTING;
    const errorMessage = isSuccessLike
      ? null
      : (response.error_message ?? `Unexpected ToonExpo status: "${response.status}".`);

    const row = await this.prisma.toonExpoProvisioningRequest.update({
      where: { id },
      data: {
        status,
        toonexpoCompanyId: response.toonexpo_company_id,
        toonexpoUserId: response.primary_user_id,
        errorMessage,
        attemptCount: { increment: 1 },
      },
    });

    if (isSuccessLike && response.toonexpo_company_id) {
      await this.prisma.organization.update({
        where: { id: row.organizationId },
        data: { toonexpoCompanyId: response.toonexpo_company_id },
      });
    }

    return toProvisioningResponse(row);
  }

  private async persistFailure(
    id: string,
    error: unknown,
  ): Promise<ProvisioningRequestResponseDto> {
    const message = error instanceof Error ? error.message : 'Unknown ToonExpo integration error.';
    this.logger.error(`ToonExpo provisioning request ${id} failed: ${message}`);

    const row = await this.prisma.toonExpoProvisioningRequest.update({
      where: { id },
      data: {
        status: ToonExpoRequestStatus.FAILED,
        errorMessage: message,
        attemptCount: { increment: 1 },
      },
    });

    return toProvisioningResponse(row);
  }

  private async assertEligible(
    organizationId: string,
    eventCycleId: string,
  ): Promise<EligibilityContext> {
    const wonDeal = await this.prisma.builderDeal.findFirst({
      where: { organizationId, eventCycleId, stage: DealStage.WON },
      select: { id: true },
    });
    if (wonDeal) {
      return { companyType: OrganizationType.BUILDER };
    }

    const confirmedPartner = await this.prisma.partnerParticipation.findFirst({
      where: { organizationId, eventCycleId, stage: PartnerStage.CONFIRMED },
      select: { id: true },
    });
    if (confirmedPartner) {
      return { companyType: OrganizationType.PARTNER };
    }

    throw new BadRequestException(NOT_ELIGIBLE_MESSAGE);
  }

  private async resolvePrimaryContact(organizationId: string): Promise<Contact> {
    const contact = await this.prisma.contact.findFirst({
      where: { organizationId, isPrimary: true },
    });
    if (!contact || !contact.email) {
      throw new BadRequestException(NO_PRIMARY_CONTACT_MESSAGE);
    }
    return contact;
  }

  private async getOrganizationOrThrow(organizationId: string): Promise<Organization> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization) {
      throw new NotFoundException(ORGANIZATION_NOT_FOUND_MESSAGE);
    }
    return organization;
  }

  private async getEventCycleOrThrow(eventCycleId: string): Promise<EventCycle> {
    const eventCycle = await this.prisma.eventCycle.findUnique({ where: { id: eventCycleId } });
    if (!eventCycle) {
      throw new NotFoundException(CYCLE_NOT_FOUND_MESSAGE);
    }
    return eventCycle;
  }

  private async getRequestOrThrow(id: string): Promise<ToonExpoProvisioningRequest> {
    const row = await this.prisma.toonExpoProvisioningRequest.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(REQUEST_NOT_FOUND_MESSAGE);
    }
    return row;
  }
}
