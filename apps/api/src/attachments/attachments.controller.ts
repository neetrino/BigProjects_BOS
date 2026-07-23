import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { AttachmentsService } from './attachments.service';
import {
  AttachmentResponseDto,
  DownloadAttachmentResponseDto,
  PresignAttachmentResponseDto,
} from './dto/attachment-response.dto';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { ListAttachmentsQueryDto } from './dto/list-attachments-query.dto';
import { PresignAttachmentDto } from './dto/presign-attachment.dto';

@ApiCookieAuth()
@ApiTags('attachments')
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get()
  list(@Query() query: ListAttachmentsQueryDto): Promise<AttachmentResponseDto[]> {
    return this.attachmentsService.list(query);
  }

  @Post('presign')
  presign(@Body() dto: PresignAttachmentDto): Promise<PresignAttachmentResponseDto> {
    return this.attachmentsService.presign(dto);
  }

  @Post()
  create(
    @Body() dto: CreateAttachmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AttachmentResponseDto> {
    return this.attachmentsService.create(dto, user);
  }

  @Get(':id/download')
  getDownloadUrl(@Param('id') id: string): Promise<DownloadAttachmentResponseDto> {
    return this.attachmentsService.getDownloadUrl(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser): Promise<void> {
    return this.attachmentsService.remove(id, user);
  }
}
