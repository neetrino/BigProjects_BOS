import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

const MIN_TITLE_LENGTH = 1;

export class UpdateVenuePlanDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(MIN_TITLE_LENGTH)
  title?: string;

  @ApiPropertyOptional({ description: 'Pixels per one meter; must be greater than zero.' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  pixelsPerMeter?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gridOriginX?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gridOriginY?: number;
}
