import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { ListPartnersQueryDto } from './dto/list-partners-query.dto';
import { PartnerResponseDto } from './dto/partner-response.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PartnersService } from './partners.service';

@ApiCookieAuth()
@ApiTags('partners')
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  list(@Query() query: ListPartnersQueryDto): Promise<PartnerResponseDto[]> {
    return this.partnersService.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PartnerResponseDto> {
    return this.partnersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePartnerDto): Promise<PartnerResponseDto> {
    return this.partnersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePartnerDto): Promise<PartnerResponseDto> {
    return this.partnersService.update(id, dto);
  }
}
