import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ALLOCATION_KIND_VALUES, AllocationKind } from '../types/allocation-kind.type';

export class SpaceAllocationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  spaceAreaId!: string;

  @ApiProperty({ enum: ALLOCATION_KIND_VALUES })
  kind!: AllocationKind;

  @ApiProperty()
  targetId!: string;

  @ApiProperty()
  active!: boolean;

  @ApiProperty()
  assignedAt!: Date;

  @ApiPropertyOptional({ nullable: true, type: Date })
  releasedAt!: Date | null;
}
