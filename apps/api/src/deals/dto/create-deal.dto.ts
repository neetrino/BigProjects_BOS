import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

const MIN_ID_LENGTH = 1;
const MIN_SQM = 0;
const MIN_AMOUNT = 0;

export class CreateDealDto {
  @ApiProperty()
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  eventCycleId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  organizationId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  primaryContactId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  assignedStaffId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(MIN_SQM)
  expectedSqm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(MIN_AMOUNT)
  agreedAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
