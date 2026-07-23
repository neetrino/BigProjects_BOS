import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationType } from '@prisma/client';
import { ArrayNotEmpty, IsArray, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { TOONEXPO_MODULES, ToonExpoModuleWire } from '../types/toonexpo-wire.types';

const MIN_ID_LENGTH = 1;
const ELIGIBLE_COMPANY_TYPES = [
  OrganizationType.BUILDER,
  OrganizationType.PARTNER,
  OrganizationType.BANK,
] as const;

export class CreateProvisioningRequestDto {
  @ApiProperty()
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  organizationId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  eventCycleId!: string;

  @ApiPropertyOptional({ enum: ELIGIBLE_COMPANY_TYPES })
  @IsOptional()
  @IsIn(ELIGIBLE_COMPANY_TYPES)
  companyType?: OrganizationType;

  @ApiProperty({ enum: TOONEXPO_MODULES, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(TOONEXPO_MODULES, { each: true })
  requestedModules!: ToonExpoModuleWire[];
}
