import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateSpaceAreaDto } from './dto/create-space-area.dto';
import { CreateVenuePlanDto } from './dto/create-venue-plan.dto';
import { GetVenuePlanQueryDto } from './dto/get-venue-plan-query.dto';
import { PresignVenuePlanImageDto } from './dto/presign-venue-plan-image.dto';
import { PresignVenuePlanImageResponseDto } from './dto/presign-venue-plan-image-response.dto';
import { SetVenuePlanImageDto } from './dto/set-venue-plan-image.dto';
import { SpaceAreaResponseDto } from './dto/space-area-response.dto';
import { UpdateVenuePlanDto } from './dto/update-venue-plan.dto';
import { VenuePlanEnvelopeResponseDto, VenuePlanResponseDto } from './dto/venue-plan-response.dto';
import { SpaceAreasService } from './space-areas.service';
import { VenuePlansService } from './venue-plans.service';

@ApiCookieAuth()
@ApiTags('venue-plans')
@Controller('venue-plans')
export class VenuePlansController {
  constructor(
    private readonly venuePlansService: VenuePlansService,
    private readonly spaceAreasService: SpaceAreasService,
  ) {}

  @Get()
  findByCycle(@Query() query: GetVenuePlanQueryDto): Promise<VenuePlanEnvelopeResponseDto> {
    return this.venuePlansService.findByCycle(query.cycleId);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateVenuePlanDto): Promise<VenuePlanResponseDto> {
    return this.venuePlansService.create(dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVenuePlanDto): Promise<VenuePlanResponseDto> {
    return this.venuePlansService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/image/presign')
  presignImage(
    @Param('id') id: string,
    @Body() dto: PresignVenuePlanImageDto,
  ): Promise<PresignVenuePlanImageResponseDto> {
    return this.venuePlansService.presignImage(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/image')
  setImage(
    @Param('id') id: string,
    @Body() dto: SetVenuePlanImageDto,
  ): Promise<VenuePlanResponseDto> {
    return this.venuePlansService.setImage(id, dto);
  }

  @Post(':id/areas')
  createArea(
    @Param('id') id: string,
    @Body() dto: CreateSpaceAreaDto,
  ): Promise<SpaceAreaResponseDto> {
    return this.spaceAreasService.create(id, dto);
  }
}
