import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Note, User, UserRole } from '@prisma/client';
import { assertContentOwnerExists } from '../common/content-owner/assert-content-owner-exists';
import { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { ListNotesQueryDto } from './dto/list-notes-query.dto';
import { NoteResponseDto } from './dto/note-response.dto';

const NOTE_NOT_FOUND_MESSAGE = 'Note not found.';
const NOTE_DELETE_FORBIDDEN_MESSAGE = 'Only the author or an admin can delete this note.';

type NoteWithAuthor = Note & { author: User };

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListNotesQueryDto): Promise<NoteResponseDto[]> {
    const notes = await this.prisma.note.findMany({
      where: {
        ownerType: query.ownerType,
        ownerId: query.ownerId,
      },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });

    return notes.map((note) => this.toResponse(note));
  }

  async create(dto: CreateNoteDto, author: AuthenticatedUser): Promise<NoteResponseDto> {
    await assertContentOwnerExists(this.prisma, dto.ownerType, dto.ownerId);

    const note = await this.prisma.note.create({
      data: {
        ownerType: dto.ownerType,
        ownerId: dto.ownerId,
        body: dto.body,
        authorId: author.id,
      },
      include: { author: true },
    });

    return this.toResponse(note);
  }

  async remove(id: string, actor: AuthenticatedUser): Promise<void> {
    const note = await this.prisma.note.findUnique({ where: { id } });
    if (!note) {
      throw new NotFoundException(NOTE_NOT_FOUND_MESSAGE);
    }

    this.assertCanDelete(note.authorId, actor);

    await this.prisma.note.delete({ where: { id } });
  }

  assertCanDelete(authorId: string, actor: AuthenticatedUser): void {
    if (actor.role === UserRole.ADMIN || actor.id === authorId) {
      return;
    }

    throw new ForbiddenException(NOTE_DELETE_FORBIDDEN_MESSAGE);
  }

  private toResponse(note: NoteWithAuthor): NoteResponseDto {
    return {
      id: note.id,
      body: note.body,
      author: {
        id: note.author.id,
        name: note.author.name,
      },
      createdAt: note.createdAt,
    };
  }
}
