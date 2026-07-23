import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

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

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  primaryContactId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  assignedStaffId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @Type(() => Number)
  @IsInt()
  @Min(MIN_SQM)
  expectedSqm?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @Type(() => Number)
  @IsNumber()
  @Min(MIN_AMOUNT)
  agreedAmount?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  description?: string | null;
}
