import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PublicDisplayMode } from '@prisma/client';
import { ALLOCATION_KIND_VALUES, AllocationKind } from '../types/allocation-kind.type';

export class SpaceAreaCellResponseDto {
  @ApiProperty()
  x!: number;

  @ApiProperty()
  y!: number;
}

export class SpaceAreaAllocationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ALLOCATION_KIND_VALUES })
  kind!: AllocationKind;

  @ApiProperty()
  targetId!: string;

  @ApiProperty()
  organizationName!: string;
}

export class SpaceAreaResponseDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  code!: string | null;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  squareMeters!: number;

  @ApiProperty({ enum: PublicDisplayMode })
  publicDisplayMode!: PublicDisplayMode;

  @ApiPropertyOptional({ nullable: true, type: String })
  customPublicLabel!: string | null;

  @ApiProperty({ type: [SpaceAreaCellResponseDto] })
  cells!: SpaceAreaCellResponseDto[];

  @ApiPropertyOptional({ type: SpaceAreaAllocationResponseDto, nullable: true })
  allocation!: SpaceAreaAllocationResponseDto | null;

  @ApiProperty()
  createdAt!: Date;
}
