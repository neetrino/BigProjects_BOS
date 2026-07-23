import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationType } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

const MIN_NAME_LENGTH = 1;

export class CreateOrganizationDto {
  @ApiProperty()
  @IsString()
  @MinLength(MIN_NAME_LENGTH)
  name!: string;

  @ApiProperty({ enum: OrganizationType })
  @IsEnum(OrganizationType)
  type!: OrganizationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  registrationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  website?: string;
}
