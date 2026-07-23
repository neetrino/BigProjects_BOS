import { Module } from '@nestjs/common';
import { VenueMapModule } from '../venue-map/venue-map.module';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';

@Module({
  imports: [VenueMapModule],
  controllers: [PartnersController],
  providers: [PartnersService],
  exports: [PartnersService],
})
export class PartnersModule {}
