import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventCycleStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

const MIN_FIELD_LENGTH = 1;

export class UpdateCycleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(MIN_FIELD_LENGTH)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(MIN_FIELD_LENGTH)
  code?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({ enum: EventCycleStatus })
  @IsOptional()
  @IsEnum(EventCycleStatus)
  status?: EventCycleStatus;
}
