import { ApiPropertyOptional } from '@nestjs/swagger';
import { PublicDisplayMode } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { SpaceAreaCellDto } from './space-area-cell.dto';

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

  @ApiPropertyOptional({ type: [SpaceAreaCellDto], description: 'Replace the area rectangle.' })
  @IsOptional()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SpaceAreaCellDto)
  cells?: SpaceAreaCellDto[];
}
