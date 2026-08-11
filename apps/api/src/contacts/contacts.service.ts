import { Injectable, NotFoundException } from '@nestjs/common';
import { Contact, OrganizationType, Prisma } from '@prisma/client';
import { ContactListItemResponseDto } from './dto/contact-list-item-response.dto';
import { ListContactsQueryDto } from './dto/list-contacts-query.dto';
import { OrganizationContactResponseDto } from './dto/organization-contact-response.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from '../prisma/prisma.service';

const ORGANIZATION_NOT_FOUND_MESSAGE = 'Organization not found.';
const CONTACT_NOT_FOUND_MESSAGE = 'Contact not found.';

type ContactWithOrganization = Contact & {
  organization: {
    id: string;
    name: string;
    type: OrganizationType;
  };
};

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListContactsQueryDto): Promise<ContactListItemResponseDto[]> {
    const contacts = await this.prisma.contact.findMany({
      where: this.buildListWhere(query),
      orderBy: [{ name: 'asc' }],
      include: {
        organization: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    return contacts.map((contact) => this.toListItemResponse(contact));
  }

  async createForOrganization(
    organizationId: string,
    dto: CreateContactDto,
  ): Promise<OrganizationContactResponseDto> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization) {
      throw new NotFoundException(ORGANIZATION_NOT_FOUND_MESSAGE);
    }

    const contact = await this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await this.unsetOtherPrimaryContacts(tx, organizationId);
      }

      return tx.contact.create({
        data: {
          organizationId,
          name: dto.name,
          phone: dto.phone ?? null,
          email: dto.email ?? null,
          position: dto.position ?? null,
          isPrimary: dto.isPrimary ?? false,
        },
      });
    });

    return this.toOrganizationContactResponse(contact);
  }

  async update(id: string, dto: UpdateContactDto): Promise<OrganizationContactResponseDto> {
    const existing = await this.prisma.contact.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(CONTACT_NOT_FOUND_MESSAGE);
    }

    const contact = await this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary === true) {
        await this.unsetOtherPrimaryContacts(tx, existing.organizationId, id);
      }

      return tx.contact.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
          ...(dto.email !== undefined && { email: dto.email }),
          ...(dto.position !== undefined && { position: dto.position }),
          ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
        },
      });
    });

    return this.toOrganizationContactResponse(contact);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.contact.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(CONTACT_NOT_FOUND_MESSAGE);
    }

    await this.prisma.contact.delete({ where: { id } });
  }

  private buildListWhere(query: ListContactsQueryDto): Prisma.ContactWhereInput {
    const search = query.search?.trim();
    if (!search) {
      return {};
    }

    return {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
        { organization: { name: { contains: search, mode: 'insensitive' } } },
      ],
    };
  }

  private async unsetOtherPrimaryContacts(
    tx: Prisma.TransactionClient,
    organizationId: string,
    excludeContactId?: string,
  ): Promise<void> {
    await tx.contact.updateMany({
      where: {
        organizationId,
        isPrimary: true,
        ...(excludeContactId !== undefined && { id: { not: excludeContactId } }),
      },
      data: { isPrimary: false },
    });
  }

  private toListItemResponse(contact: ContactWithOrganization): ContactListItemResponseDto {
    return {
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      position: contact.position,
      isPrimary: contact.isPrimary,
      createdAt: contact.createdAt,
      organization: {
        id: contact.organization.id,
        name: contact.organization.name,
        type: contact.organization.type,
      },
    };
  }

  private toOrganizationContactResponse(contact: Contact): OrganizationContactResponseDto {
    return {
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      position: contact.position,
      isPrimary: contact.isPrimary,
      createdAt: contact.createdAt,
    };
  }
}
