import { ApiProperty } from '@nestjs/swagger';
import { ContentOwnerType } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

const MIN_ID_LENGTH = 1;

export class ListAttachmentsQueryDto {
  @ApiProperty({ enum: ContentOwnerType })
  @IsEnum(ContentOwnerType)
  ownerType!: ContentOwnerType;

  @ApiProperty()
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  ownerId!: string;
}
