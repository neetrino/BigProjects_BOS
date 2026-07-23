import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';

const MIN_ID_LENGTH = 1;
const MAX_PARTNER_TYPE_LENGTH = 50;

export class CreatePartnerDto {
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
  @IsString()
  @MaxLength(MAX_PARTNER_TYPE_LENGTH)
  partnerType?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  description?: string | null;
}
