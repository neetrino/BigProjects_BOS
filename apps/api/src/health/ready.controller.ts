import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';

@Controller('ready')
export class ReadyController {
  @Public()
  @SkipThrottle()
  @Get()
  getReady(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
