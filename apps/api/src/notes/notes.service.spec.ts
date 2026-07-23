import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { NotesService } from './notes.service';

const author: AuthenticatedUser = {
  id: 'author-1',
  name: 'Author',
  email: 'author@example.com',
  role: UserRole.STAFF,
  locale: 'en',
};

const otherStaff: AuthenticatedUser = {
  id: 'staff-2',
  name: 'Other Staff',
  email: 'other@example.com',
  role: UserRole.STAFF,
  locale: 'en',
};

const admin: AuthenticatedUser = {
  id: 'admin-1',
  name: 'Admin',
  email: 'admin@example.com',
  role: UserRole.ADMIN,
  locale: 'en',
};

describe('NotesService', () => {
  let service: NotesService;
  let prisma: {
    note: { findUnique: jest.Mock; delete: jest.Mock; findMany: jest.Mock; create: jest.Mock };
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      note: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(NotesService);
  });

  describe('assertCanDelete', () => {
    it('allows the author to delete', () => {
      expect(() => service.assertCanDelete(author.id, author)).not.toThrow();
    });

    it('allows an admin to delete another users note', () => {
      expect(() => service.assertCanDelete(author.id, admin)).not.toThrow();
    });

    it('forbids a non-author staff member from deleting', () => {
      expect(() => service.assertCanDelete(author.id, otherStaff)).toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('deletes when the actor is the author', async () => {
      prisma.note.findUnique.mockResolvedValue({ id: 'note-1', authorId: author.id });
      prisma.note.delete.mockResolvedValue({});

      await expect(service.remove('note-1', author)).resolves.toBeUndefined();
      expect(prisma.note.delete).toHaveBeenCalledWith({ where: { id: 'note-1' } });
    });

    it('rejects when a different staff member tries to delete', async () => {
      prisma.note.findUnique.mockResolvedValue({ id: 'note-1', authorId: author.id });

      await expect(service.remove('note-1', otherStaff)).rejects.toThrow(ForbiddenException);
      expect(prisma.note.delete).not.toHaveBeenCalled();
    });
  });
});
