import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { SpaceAllocationResponseDto } from './dto/space-allocation-response.dto';
import { SpaceAllocationsService } from './space-allocations.service';

@ApiCookieAuth()
@ApiTags('space-allocations')
@Controller('space-allocations')
export class SpaceAllocationsController {
  constructor(private readonly spaceAllocationsService: SpaceAllocationsService) {}

  @Post(':id/release')
  @HttpCode(HttpStatus.OK)
  release(@Param('id') id: string): Promise<SpaceAllocationResponseDto> {
    return this.spaceAllocationsService.release(id);
  }
}
