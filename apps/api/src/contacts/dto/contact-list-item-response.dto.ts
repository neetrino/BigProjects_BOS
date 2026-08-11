import { ApiProperty } from '@nestjs/swagger';
import { OrganizationType } from '@prisma/client';

export class ContactListItemOrganizationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: OrganizationType })
  type!: OrganizationType;
}

export class ContactListItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true, type: String })
  phone!: string | null;

  @ApiProperty({ nullable: true, type: String })
  email!: string | null;

  @ApiProperty({ nullable: true, type: String })
  position!: string | null;

  @ApiProperty()
  isPrimary!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ type: ContactListItemOrganizationDto })
  organization!: ContactListItemOrganizationDto;
}
