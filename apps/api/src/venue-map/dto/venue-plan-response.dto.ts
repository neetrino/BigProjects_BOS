import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanPublishStatus } from '@prisma/client';
import { SpaceAreaResponseDto } from './space-area-response.dto';

export class VenuePlanResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  eventCycleId!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  imageKey!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Number })
  imageWidth!: number | null;

  @ApiPropertyOptional({ nullable: true, type: Number })
  imageHeight!: number | null;

  @ApiPropertyOptional({ nullable: true, type: Number })
  pixelsPerMeter!: number | null;

  @ApiProperty()
  gridOriginX!: number;

  @ApiProperty()
  gridOriginY!: number;

  @ApiProperty({ enum: PlanPublishStatus })
  publishStatus!: PlanPublishStatus;

  @ApiPropertyOptional({ nullable: true, type: String })
  imageUrl!: string | null;

  @ApiProperty({ type: [SpaceAreaResponseDto] })
  areas!: SpaceAreaResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class VenuePlanEnvelopeResponseDto {
  @ApiPropertyOptional({ type: VenuePlanResponseDto, nullable: true })
  plan!: VenuePlanResponseDto | null;
}
