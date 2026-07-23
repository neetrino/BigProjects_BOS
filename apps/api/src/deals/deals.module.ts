import { Module } from '@nestjs/common';
import { VenueMapModule } from '../venue-map/venue-map.module';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';

@Module({
  imports: [VenueMapModule],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}
