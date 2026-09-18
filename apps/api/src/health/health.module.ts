import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { ReadyController } from './ready.controller';

@Module({
  controllers: [HealthController, ReadyController],
  providers: [HealthService],
})
export class HealthModule {}
