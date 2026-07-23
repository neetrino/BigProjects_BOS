import { ApiPropertyOptional } from '@nestjs/swagger';
import { PublicDisplayMode } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

const MIN_NAME_LENGTH = 1;

export class UpdateSpaceAreaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(MIN_NAME_LENGTH)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ enum: PublicDisplayMode })
  @IsOptional()
  @IsEnum(PublicDisplayMode)
  publicDisplayMode?: PublicDisplayMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customPublicLabel?: string;
}
