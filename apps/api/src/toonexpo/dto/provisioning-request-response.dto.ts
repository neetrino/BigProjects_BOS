import { ApiProperty } from '@nestjs/swagger';
import { OrganizationType, ToonExpoRequestStatus } from '@prisma/client';

export class ProvisioningRequestResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() organizationId!: string;
  @ApiProperty() eventCycleId!: string;
  @ApiProperty({ enum: OrganizationType }) companyType!: OrganizationType;
  @ApiProperty() contactName!: string;
  @ApiProperty() contactEmail!: string;
  @ApiProperty({ nullable: true }) contactPhone!: string | null;
  @ApiProperty({ type: [String] }) requestedModules!: string[];
  @ApiProperty({ enum: ToonExpoRequestStatus }) status!: ToonExpoRequestStatus;
  @ApiProperty({ nullable: true }) toonexpoCompanyId!: string | null;
  @ApiProperty({ nullable: true }) toonexpoUserId!: string | null;
  @ApiProperty({ nullable: true }) errorMessage!: string | null;
  @ApiProperty() attemptCount!: number;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
