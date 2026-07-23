import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ContactsService } from './contacts.service';

const organizationId = 'org-1';

const existingContact = {
  id: 'contact-1',
  organizationId,
  name: 'First Contact',
  phone: null,
  email: null,
  position: null,
  isPrimary: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ContactsService', () => {
  let service: ContactsService;
  let prisma: {
    organization: { findUnique: jest.Mock };
    contact: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      delete: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let tx: {
    contact: { create: jest.Mock; update: jest.Mock; updateMany: jest.Mock };
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    tx = {
      contact: { create: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    };
    prisma = {
      organization: { findUnique: jest.fn() },
      contact: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ContactsService);
  });

  describe('createForOrganization', () => {
    it('unsets other primary contacts in the same transaction when isPrimary is true', async () => {
      prisma.organization.findUnique.mockResolvedValue({ id: organizationId });
      tx.contact.create.mockResolvedValue({ ...existingContact, id: 'contact-2', isPrimary: true });

      await service.createForOrganization(organizationId, {
        name: 'Second Contact',
        isPrimary: true,
      });

      expect(tx.contact.updateMany).toHaveBeenCalledWith({
        where: { organizationId, isPrimary: true },
        data: { isPrimary: false },
      });
      expect(tx.contact.create).toHaveBeenCalledWith({
        data: {
          organizationId,
          name: 'Second Contact',
          phone: null,
          email: null,
          position: null,
          isPrimary: true,
        },
      });
    });

    it('throws when the organization does not exist', async () => {
      prisma.organization.findUnique.mockResolvedValue(null);

      await expect(
        service.createForOrganization(organizationId, { name: 'Missing Org Contact' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('unsets other primary contacts before promoting the updated contact', async () => {
      prisma.contact.findUnique.mockResolvedValue(existingContact);
      tx.contact.update.mockResolvedValue({ ...existingContact, isPrimary: true });

      await service.update('contact-2', { isPrimary: true });

      expect(tx.contact.updateMany).toHaveBeenCalledWith({
        where: { organizationId, isPrimary: true, id: { not: 'contact-2' } },
        data: { isPrimary: false },
      });
      expect(tx.contact.update).toHaveBeenCalledWith({
        where: { id: 'contact-2' },
        data: { isPrimary: true },
      });
    });

    it('throws when the contact does not exist', async () => {
      prisma.contact.findUnique.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
