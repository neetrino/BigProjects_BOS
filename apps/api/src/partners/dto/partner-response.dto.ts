import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationType, PartnerStage } from '@prisma/client';

export class PartnerOrganizationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: OrganizationType })
  type!: OrganizationType;
}

export class PartnerPrimaryContactResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  phone!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  email!: string | null;
}

export class PartnerAssignedStaffResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class PartnerAreasSummaryResponseDto {
  @ApiProperty()
  count!: number;

  @ApiProperty()
  totalSqm!: number;

  @ApiProperty({ type: [String] })
  labels!: string[];
}

export class PartnerResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  eventCycleId!: string;

  @ApiProperty()
  organizationId!: string;

  @ApiProperty({ type: PartnerOrganizationResponseDto })
  organization!: PartnerOrganizationResponseDto;

  @ApiPropertyOptional({ type: PartnerPrimaryContactResponseDto, nullable: true })
  primaryContact!: PartnerPrimaryContactResponseDto | null;

  @ApiPropertyOptional({ type: PartnerAssignedStaffResponseDto, nullable: true })
  assignedStaff!: PartnerAssignedStaffResponseDto | null;

  @ApiProperty({ enum: PartnerStage })
  stage!: PartnerStage;

  @ApiPropertyOptional({ nullable: true, type: String })
  partnerType!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty({ type: PartnerAreasSummaryResponseDto })
  areasSummary!: PartnerAreasSummaryResponseDto;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PartnerAreaItemResponseDto {
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

export class PartnerDetailResponseDto extends PartnerResponseDto {
  @ApiProperty({ type: [PartnerAreaItemResponseDto] })
  areas!: PartnerAreaItemResponseDto[];
}
