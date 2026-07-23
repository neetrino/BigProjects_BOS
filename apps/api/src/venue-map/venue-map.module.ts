import { Module } from '@nestjs/common';
import { AttachmentsModule } from '../attachments/attachments.module';
import { SpaceAllocationsController } from './space-allocations.controller';
import { SpaceAllocationsQueryService } from './space-allocations-query.service';
import { SpaceAllocationsService } from './space-allocations.service';
import { SpaceAreasController } from './space-areas.controller';
import { SpaceAreasService } from './space-areas.service';
import { VenuePlansController } from './venue-plans.controller';
import { VenuePlansService } from './venue-plans.service';

@Module({
  imports: [AttachmentsModule],
  controllers: [VenuePlansController, SpaceAreasController, SpaceAllocationsController],
  providers: [
    VenuePlansService,
    SpaceAreasService,
    SpaceAllocationsService,
    SpaceAllocationsQueryService,
  ],
  exports: [SpaceAllocationsQueryService],
})
export class VenueMapModule {}
