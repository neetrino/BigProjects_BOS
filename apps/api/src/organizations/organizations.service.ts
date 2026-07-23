import { Injectable, NotFoundException } from '@nestjs/common';
import { Organization, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ListOrganizationsQueryDto } from './dto/list-organizations-query.dto';
import { OrganizationDetailResponseDto } from './dto/organization-detail-response.dto';
import { OrganizationListItemResponseDto } from './dto/organization-list-item-response.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

const ORGANIZATION_NOT_FOUND_MESSAGE = 'Organization not found.';

type OrganizationWithContactCount = Organization & {
  _count: { contacts: number };
};

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListOrganizationsQueryDto): Promise<OrganizationListItemResponseDto[]> {
    const where = this.buildListWhere(query);
    const organizations = await this.prisma.organization.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { _count: { select: { contacts: true } } },
    });

    return organizations.map((organization) => this.toListItemResponse(organization));
  }

  async findOne(id: string): Promise<OrganizationDetailResponseDto> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: { select: { contacts: true } },
        contacts: {
          orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }],
        },
      },
    });

    if (!organization) {
      throw new NotFoundException(ORGANIZATION_NOT_FOUND_MESSAGE);
    }

    return {
      ...this.toListItemResponse(organization),
      contacts: organization.contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        position: contact.position,
        isPrimary: contact.isPrimary,
        createdAt: contact.createdAt,
      })),
    };
  }

  async create(dto: CreateOrganizationDto): Promise<OrganizationListItemResponseDto> {
    const organization = await this.prisma.organization.create({
      data: {
        name: dto.name,
        type: dto.type,
        registrationId: dto.registrationId ?? null,
        phone: dto.phone ?? null,
        email: dto.email ?? null,
        website: dto.website ?? null,
      },
      include: { _count: { select: { contacts: true } } },
    });

    return this.toListItemResponse(organization);
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<OrganizationListItemResponseDto> {
    const existing = await this.prisma.organization.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(ORGANIZATION_NOT_FOUND_MESSAGE);
    }

    const data: Prisma.OrganizationUpdateInput = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.registrationId !== undefined && { registrationId: dto.registrationId }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.website !== undefined && { website: dto.website }),
    };

    const organization = await this.prisma.organization.update({
      where: { id },
      data,
      include: { _count: { select: { contacts: true } } },
    });

    return this.toListItemResponse(organization);
  }

  private buildListWhere(query: ListOrganizationsQueryDto): Prisma.OrganizationWhereInput {
    const where: Prisma.OrganizationWhereInput = {};

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    if (query.type) {
      where.type = query.type;
    }

    return where;
  }

  private toListItemResponse(
    organization: OrganizationWithContactCount,
  ): OrganizationListItemResponseDto {
    return {
      id: organization.id,
      name: organization.name,
      type: organization.type,
      registrationId: organization.registrationId,
      phone: organization.phone,
      email: organization.email,
      website: organization.website,
      toonexpoCompanyId: organization.toonexpoCompanyId,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      contactCount: organization._count.contacts,
    };
  }
}
