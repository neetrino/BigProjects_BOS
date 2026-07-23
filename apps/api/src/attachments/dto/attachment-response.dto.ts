import { ApiProperty } from '@nestjs/swagger';

export class AttachmentUploaderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class AttachmentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  originalFilename!: string;

  @ApiProperty()
  contentType!: string;

  @ApiProperty()
  size!: number;

  @ApiProperty({ type: AttachmentUploaderResponseDto })
  uploader!: AttachmentUploaderResponseDto;

  @ApiProperty()
  createdAt!: Date;
}

export class PresignAttachmentResponseDto {
  @ApiProperty()
  objectKey!: string;

  @ApiProperty()
  uploadUrl!: string;
}

export class DownloadAttachmentResponseDto {
  @ApiProperty()
  downloadUrl!: string;
}
