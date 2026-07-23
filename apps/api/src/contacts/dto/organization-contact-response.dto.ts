import { ApiProperty } from '@nestjs/swagger';

/** Contact shape embedded in organization detail responses. */
export class OrganizationContactResponseDto {
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
}
