import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { CreateSpaceAllocationDto } from './dto/create-space-allocation.dto';
import { SpaceAllocationResponseDto } from './dto/space-allocation-response.dto';
import { SpaceAreaResponseDto } from './dto/space-area-response.dto';
import { UpdateSpaceAreaDto } from './dto/update-space-area.dto';
import { SpaceAllocationsService } from './space-allocations.service';
import { SpaceAreasService } from './space-areas.service';

@ApiCookieAuth()
@ApiTags('space-areas')
@Controller('space-areas')
export class SpaceAreasController {
  constructor(
    private readonly spaceAreasService: SpaceAreasService,
    private readonly spaceAllocationsService: SpaceAllocationsService,
  ) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSpaceAreaDto): Promise<SpaceAreaResponseDto> {
    return this.spaceAreasService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id') id: string): Promise<void> {
    return this.spaceAreasService.remove(id);
  }

  @Post(':id/allocations')
  assign(
    @Param('id') id: string,
    @Body() dto: CreateSpaceAllocationDto,
  ): Promise<SpaceAllocationResponseDto> {
    return this.spaceAllocationsService.assign(id, dto);
  }
}
