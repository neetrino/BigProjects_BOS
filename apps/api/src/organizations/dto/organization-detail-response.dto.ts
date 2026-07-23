import { ApiProperty } from '@nestjs/swagger';
import { OrganizationContactResponseDto } from '../../contacts/dto/organization-contact-response.dto';
import { OrganizationListItemResponseDto } from './organization-list-item-response.dto';

export class OrganizationDetailResponseDto extends OrganizationListItemResponseDto {
  @ApiProperty({ type: [OrganizationContactResponseDto] })
  contacts!: OrganizationContactResponseDto[];
}
