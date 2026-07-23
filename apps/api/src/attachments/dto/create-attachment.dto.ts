import { ApiProperty } from '@nestjs/swagger';
import { ContentOwnerType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsString, Min, MinLength } from 'class-validator';

const MIN_ID_LENGTH = 1;
const MIN_FILENAME_LENGTH = 1;
const MIN_CONTENT_TYPE_LENGTH = 1;
const MIN_OBJECT_KEY_LENGTH = 1;
const MIN_SIZE = 1;

export class CreateAttachmentDto {
  @ApiProperty({ enum: ContentOwnerType })
  @IsEnum(ContentOwnerType)
  ownerType!: ContentOwnerType;

  @ApiProperty()
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  ownerId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(MIN_OBJECT_KEY_LENGTH)
  objectKey!: string;

  @ApiProperty()
  @IsString()
  @MinLength(MIN_FILENAME_LENGTH)
  originalFilename!: string;

  @ApiProperty()
  @IsString()
  @MinLength(MIN_CONTENT_TYPE_LENGTH)
  contentType!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(MIN_SIZE)
  size!: number;
}
