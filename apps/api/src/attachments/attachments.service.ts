import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Attachment, ContentOwnerType, User, UserRole } from '@prisma/client';
import { assertContentOwnerExists } from '../common/content-owner/assert-content-owner-exists';
import { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { PrismaService } from '../prisma/prisma.service';
import {
  AttachmentResponseDto,
  DownloadAttachmentResponseDto,
  PresignAttachmentResponseDto,
} from './dto/attachment-response.dto';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { ListAttachmentsQueryDto } from './dto/list-attachments-query.dto';
import { PresignAttachmentDto } from './dto/presign-attachment.dto';
import { StorageService } from './storage.service';

/** Max upload size: 25 MB. */
export const MAX_ATTACHMENT_SIZE_BYTES = 25 * 1024 * 1024;

const ATTACHMENT_NOT_FOUND_MESSAGE = 'Attachment not found.';
const ATTACHMENT_DELETE_FORBIDDEN_MESSAGE =
  'Only the uploader or an admin can delete this attachment.';
const ATTACHMENT_SIZE_LIMIT_MESSAGE = `Attachment size must not exceed ${MAX_ATTACHMENT_SIZE_BYTES} bytes.`;
const OBJECT_KEY_MISMATCH_MESSAGE =
  'objectKey does not match the provided ownerType and ownerId.';
const MAX_SANITIZED_FILENAME_LENGTH = 200;

type AttachmentWithUploader = Attachment & { uploader: User };

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async list(query: ListAttachmentsQueryDto): Promise<AttachmentResponseDto[]> {
    const attachments = await this.prisma.attachment.findMany({
      where: {
        ownerType: query.ownerType,
        ownerId: query.ownerId,
      },
      include: { uploader: true },
      orderBy: { createdAt: 'desc' },
    });

    return attachments.map((attachment) => this.toResponse(attachment));
  }

  async presign(dto: PresignAttachmentDto): Promise<PresignAttachmentResponseDto> {
    this.assertSizeWithinLimit(dto.size);
    await assertContentOwnerExists(this.prisma, dto.ownerType, dto.ownerId);

    const objectKey = this.buildObjectKey(dto.ownerType, dto.ownerId, dto.filename);
    const uploadUrl = await this.storageService.createPresignedPutUrl(
      objectKey,
      dto.contentType,
    );

    return { objectKey, uploadUrl };
  }

  async create(
    dto: CreateAttachmentDto,
    uploader: AuthenticatedUser,
  ): Promise<AttachmentResponseDto> {
    this.assertSizeWithinLimit(dto.size);
    await assertContentOwnerExists(this.prisma, dto.ownerType, dto.ownerId);
    this.assertObjectKeyMatchesOwner(dto.objectKey, dto.ownerType, dto.ownerId);

    const attachment = await this.prisma.attachment.create({
      data: {
        ownerType: dto.ownerType,
        ownerId: dto.ownerId,
        objectKey: dto.objectKey,
        originalFilename: dto.originalFilename,
        contentType: dto.contentType,
        size: dto.size,
        uploaderId: uploader.id,
      },
      include: { uploader: true },
    });

    return this.toResponse(attachment);
  }

  async getDownloadUrl(id: string): Promise<DownloadAttachmentResponseDto> {
    const attachment = await this.prisma.attachment.findUnique({ where: { id } });
    if (!attachment) {
      throw new NotFoundException(ATTACHMENT_NOT_FOUND_MESSAGE);
    }

    const downloadUrl = await this.storageService.createPresignedGetUrl(attachment.objectKey);
    return { downloadUrl };
  }

  async remove(id: string, actor: AuthenticatedUser): Promise<void> {
    const attachment = await this.prisma.attachment.findUnique({ where: { id } });
    if (!attachment) {
      throw new NotFoundException(ATTACHMENT_NOT_FOUND_MESSAGE);
    }

    this.assertCanDelete(attachment.uploaderId, actor);

    await this.storageService.deleteObject(attachment.objectKey);
    await this.prisma.attachment.delete({ where: { id } });
  }

  assertSizeWithinLimit(size: number): void {
    if (size > MAX_ATTACHMENT_SIZE_BYTES) {
      throw new BadRequestException(ATTACHMENT_SIZE_LIMIT_MESSAGE);
    }
  }

  assertObjectKeyMatchesOwner(
    objectKey: string,
    ownerType: ContentOwnerType,
    ownerId: string,
  ): void {
    const expectedPrefix = `${ownerType}/${ownerId}/`;
    if (!objectKey.startsWith(expectedPrefix)) {
      throw new BadRequestException(OBJECT_KEY_MISMATCH_MESSAGE);
    }
  }

  assertCanDelete(uploaderId: string, actor: AuthenticatedUser): void {
    if (actor.role === UserRole.ADMIN || actor.id === uploaderId) {
      return;
    }

    throw new ForbiddenException(ATTACHMENT_DELETE_FORBIDDEN_MESSAGE);
  }

  private buildObjectKey(
    ownerType: ContentOwnerType,
    ownerId: string,
    filename: string,
  ): string {
    const sanitized = this.sanitizeFilename(filename);
    return `${ownerType}/${ownerId}/${randomUUID()}-${sanitized}`;
  }

  private sanitizeFilename(filename: string): string {
    const withoutPath = filename.replace(/[/\\]/g, '_');
    const sanitized = withoutPath.replace(/[^\w.\-+() ]/g, '_').trim();
    const fallback = sanitized.length > 0 ? sanitized : 'file';
    return fallback.slice(0, MAX_SANITIZED_FILENAME_LENGTH);
  }

  private toResponse(attachment: AttachmentWithUploader): AttachmentResponseDto {
    return {
      id: attachment.id,
      originalFilename: attachment.originalFilename,
      contentType: attachment.contentType,
      size: attachment.size,
      uploader: {
        id: attachment.uploader.id,
        name: attachment.uploader.name,
      },
      createdAt: attachment.createdAt,
    };
  }
}
