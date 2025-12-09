import { Controller, Get } from '@nestjs/common';
import { Public } from '../decorators/public.decorator';

@Controller()
export class HealthController {
  @Public()
  @Get(['health', 'healthcheck', '/health', '/healthcheck'])
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'budgetapp-backend',
    };
  }
}

