import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CreateProvisioningRequestDto } from './dto/create-provisioning-request.dto';
import { ListProvisioningRequestsQueryDto } from './dto/list-provisioning-requests-query.dto';
import { ProvisioningRequestResponseDto } from './dto/provisioning-request-response.dto';
import { VenueMapPublicationResponseDto } from './dto/venue-map-publication-response.dto';
import { ProvisioningRequestsService } from './provisioning-requests.service';
import { VenueMapPublicationsService } from './venue-map-publications.service';

@ApiCookieAuth()
@ApiTags('toonexpo')
@Controller('toonexpo')
export class ToonExpoController {
  constructor(
    private readonly provisioningRequestsService: ProvisioningRequestsService,
    private readonly venueMapPublicationsService: VenueMapPublicationsService,
  ) {}

  @Post('provisioning-requests')
  createProvisioningRequest(
    @Body() dto: CreateProvisioningRequestDto,
  ): Promise<ProvisioningRequestResponseDto> {
    return this.provisioningRequestsService.create(dto);
  }

  @Post('provisioning-requests/:id/retry')
  retryProvisioningRequest(@Param('id') id: string): Promise<ProvisioningRequestResponseDto> {
    return this.provisioningRequestsService.retry(id);
  }

  @Get('provisioning-requests')
  listProvisioningRequests(
    @Query() query: ListProvisioningRequestsQueryDto,
  ): Promise<ProvisioningRequestResponseDto[]> {
    return this.provisioningRequestsService.list(query);
  }

  @Post('venue-plans/:planId/publish')
  publishVenueMap(@Param('planId') planId: string): Promise<VenueMapPublicationResponseDto> {
    return this.venueMapPublicationsService.publish(planId);
  }

  @Get('venue-plans/:planId/publications')
  listVenueMapPublications(
    @Param('planId') planId: string,
  ): Promise<VenueMapPublicationResponseDto[]> {
    return this.venueMapPublicationsService.list(planId);
  }
}
