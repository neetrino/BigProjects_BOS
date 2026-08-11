import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { ContactListItemResponseDto } from './dto/contact-list-item-response.dto';
import { ListContactsQueryDto } from './dto/list-contacts-query.dto';
import { OrganizationContactResponseDto } from './dto/organization-contact-response.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactsService } from './contacts.service';

@ApiCookieAuth()
@ApiTags('organizations')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  list(@Query() query: ListContactsQueryDto): Promise<ContactListItemResponseDto[]> {
    return this.contactsService.list(query);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
  ): Promise<OrganizationContactResponseDto> {
    return this.contactsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.contactsService.remove(id);
  }
}
