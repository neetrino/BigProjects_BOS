import { ApiProperty } from '@nestjs/swagger';
import { OrganizationType } from '@prisma/client';

export class OrganizationListItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: OrganizationType })
  type!: OrganizationType;

  @ApiProperty({ nullable: true, type: String })
  registrationId!: string | null;

  @ApiProperty({ nullable: true, type: String })
  phone!: string | null;

  @ApiProperty({ nullable: true, type: String })
  email!: string | null;

  @ApiProperty({ nullable: true, type: String })
  website!: string | null;

  @ApiProperty({ nullable: true, type: String })
  toonexpoCompanyId!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty()
  contactCount!: number;
}
