import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { OrganizationContactResponseDto } from '../contacts/dto/organization-contact-response.dto';
import { ContactsService } from '../contacts/contacts.service';
import { CreateContactDto } from '../contacts/dto/create-contact.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ListOrganizationsQueryDto } from './dto/list-organizations-query.dto';
import { OrganizationDetailResponseDto } from './dto/organization-detail-response.dto';
import { OrganizationListItemResponseDto } from './dto/organization-list-item-response.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './organizations.service';

@ApiCookieAuth()
@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly contactsService: ContactsService,
  ) {}

  @Get()
  list(@Query() query: ListOrganizationsQueryDto): Promise<OrganizationListItemResponseDto[]> {
    return this.organizationsService.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<OrganizationDetailResponseDto> {
    return this.organizationsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOrganizationDto): Promise<OrganizationListItemResponseDto> {
    return this.organizationsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationListItemResponseDto> {
    return this.organizationsService.update(id, dto);
  }

  @Post(':id/contacts')
  createContact(
    @Param('id') id: string,
    @Body() dto: CreateContactDto,
  ): Promise<OrganizationContactResponseDto> {
    return this.contactsService.createForOrganization(id, dto);
  }
}
