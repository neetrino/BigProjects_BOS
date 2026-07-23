import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerStage } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

const MIN_ID_LENGTH = 1;
const MAX_PARTNER_TYPE_LENGTH = 50;

export class UpdatePartnerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  eventCycleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  organizationId?: string;

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

  @ApiPropertyOptional({ enum: PartnerStage })
  @IsOptional()
  @IsEnum(PartnerStage)
  stage?: PartnerStage;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(MAX_PARTNER_TYPE_LENGTH)
  partnerType?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  description?: string | null;
}
