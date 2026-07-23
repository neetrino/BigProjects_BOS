import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsString, Min, MinLength } from 'class-validator';
import { ALLOWED_PLAN_IMAGE_CONTENT_TYPES } from '../venue-map.constants';

const MIN_FILENAME_LENGTH = 1;
const MIN_SIZE = 1;

export class PresignVenuePlanImageDto {
  @ApiProperty()
  @IsString()
  @MinLength(MIN_FILENAME_LENGTH)
  filename!: string;

  @ApiProperty({ enum: ALLOWED_PLAN_IMAGE_CONTENT_TYPES })
  @IsIn(ALLOWED_PLAN_IMAGE_CONTENT_TYPES)
  contentType!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(MIN_SIZE)
  size!: number;
}
