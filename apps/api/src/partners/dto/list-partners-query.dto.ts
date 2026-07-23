import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerStage } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const MIN_ID_LENGTH = 1;
const MAX_PARTNER_TYPE_LENGTH = 50;

export class ListPartnersQueryDto {
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

  @ApiPropertyOptional({ enum: PartnerStage })
  @IsOptional()
  @IsEnum(PartnerStage)
  stage?: PartnerStage;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(MAX_PARTNER_TYPE_LENGTH)
  partnerType?: string;
}
