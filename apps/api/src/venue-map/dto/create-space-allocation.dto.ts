import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

const MIN_ID_LENGTH = 1;

/**
 * Exactly one of `builderDealId` / `partnerParticipationId` must be provided.
 * Enforced in `SpaceAllocationsService.assign` (not expressible cleanly as a single
 * class-validator decorator) so the resulting error message stays readable.
 */
export class CreateSpaceAllocationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  builderDealId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(MIN_ID_LENGTH)
  partnerParticipationId?: string;
}
