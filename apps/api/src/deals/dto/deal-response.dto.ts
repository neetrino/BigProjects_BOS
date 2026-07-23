import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DealStage, OrganizationType } from '@prisma/client';

export class DealOrganizationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: OrganizationType })
  type!: OrganizationType;
}

export class DealPrimaryContactResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  phone!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  email!: string | null;
}

export class DealAssignedStaffResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class DealAreasSummaryResponseDto {
  @ApiProperty()
  count!: number;

  @ApiProperty()
  totalSqm!: number;

  @ApiProperty({ type: [String] })
  labels!: string[];
}

export class DealResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  eventCycleId!: string;

  @ApiProperty()
  organizationId!: string;

  @ApiProperty({ type: DealOrganizationResponseDto })
  organization!: DealOrganizationResponseDto;

  @ApiPropertyOptional({ type: DealPrimaryContactResponseDto, nullable: true })
  primaryContact!: DealPrimaryContactResponseDto | null;

  @ApiPropertyOptional({ type: DealAssignedStaffResponseDto, nullable: true })
  assignedStaff!: DealAssignedStaffResponseDto | null;

  @ApiProperty({ enum: DealStage })
  stage!: DealStage;

  @ApiPropertyOptional({ nullable: true, type: Number })
  expectedSqm!: number | null;

  @ApiPropertyOptional({ nullable: true, type: Number })
  agreedAmount!: number | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty({ type: DealAreasSummaryResponseDto })
  areasSummary!: DealAreasSummaryResponseDto;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class DealAreaItemResponseDto {
  @ApiProperty()
  allocationId!: string;

  @ApiProperty()
  areaId!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  code!: string | null;

  @ApiProperty()
  squareMeters!: number;
}

export class DealDetailResponseDto extends DealResponseDto {
  @ApiProperty({ type: [DealAreaItemResponseDto] })
  areas!: DealAreaItemResponseDto[];
}
