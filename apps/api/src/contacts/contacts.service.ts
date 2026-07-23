import { Injectable, NotFoundException } from '@nestjs/common';
import { Contact, Prisma } from '@prisma/client';
import { OrganizationContactResponseDto } from './dto/organization-contact-response.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from '../prisma/prisma.service';

const ORGANIZATION_NOT_FOUND_MESSAGE = 'Organization not found.';
const CONTACT_NOT_FOUND_MESSAGE = 'Contact not found.';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

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
