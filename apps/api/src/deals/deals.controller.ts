import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { CreateDealDto } from './dto/create-deal.dto';
import { DealDetailResponseDto, DealResponseDto } from './dto/deal-response.dto';
import { ListDealsQueryDto } from './dto/list-deals-query.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { DealsService } from './deals.service';

@ApiCookieAuth()
@ApiTags('deals')
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  list(@Query() query: ListDealsQueryDto): Promise<DealResponseDto[]> {
    return this.dealsService.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<DealDetailResponseDto> {
    return this.dealsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDealDto): Promise<DealResponseDto> {
    return this.dealsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDealDto): Promise<DealResponseDto> {
    return this.dealsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.dealsService.remove(id);
  }
}
