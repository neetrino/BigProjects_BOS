import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DealStage } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

const MIN_ID_LENGTH = 1;

export class ListDealsQueryDto {
  @ApiProperty({ description: 'Event cycle id (required).' })
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  cycleId!: string;

  @ApiPropertyOptional({ description: 'Case-insensitive substring match on organization name.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  assignedStaffId?: string;

  @ApiPropertyOptional({ enum: DealStage })
  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;
}
