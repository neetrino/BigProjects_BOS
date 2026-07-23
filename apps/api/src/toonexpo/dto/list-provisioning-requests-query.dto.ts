import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

const MIN_ID_LENGTH = 1;

export class ListProvisioningRequestsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  organizationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  cycleId?: string;
}
