import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { CycleResponseDto } from './dto/cycle-response.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';
import { CyclesService } from './cycles.service';

@ApiCookieAuth()
@ApiTags('cycles')
@Controller('cycles')
export class CyclesController {
  constructor(private readonly cyclesService: CyclesService) {}

  @Get()
  list(): Promise<CycleResponseDto[]> {
    return this.cyclesService.list();
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateCycleDto): Promise<CycleResponseDto> {
    return this.cyclesService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCycleDto): Promise<CycleResponseDto> {
    return this.cyclesService.update(id, dto);
  }
}
