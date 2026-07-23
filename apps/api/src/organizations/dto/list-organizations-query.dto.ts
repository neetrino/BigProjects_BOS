import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ListOrganizationsQueryDto {
  @ApiPropertyOptional({ description: 'Case-insensitive substring match on organization name.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: OrganizationType })
  @IsOptional()
  @IsEnum(OrganizationType)
  type?: OrganizationType;
}
