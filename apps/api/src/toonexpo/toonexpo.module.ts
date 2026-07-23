import { Module } from '@nestjs/common';
import { AttachmentsModule } from '../attachments/attachments.module';
import { ProvisioningRequestsService } from './provisioning-requests.service';
import { ToonExpoClientService } from './toonexpo-client.service';
import { ToonExpoController } from './toonexpo.controller';
import { VenueMapPublicationsService } from './venue-map-publications.service';

@Module({
  imports: [AttachmentsModule],
  controllers: [ToonExpoController],
  providers: [ProvisioningRequestsService, VenueMapPublicationsService, ToonExpoClientService],
})
export class ToonExpoModule {}
