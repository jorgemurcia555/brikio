import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { RequiresPro } from '../../common/decorators/requires-pro.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze-project')
  @RequiresPro()
  async analyzeProject(@Body('description') description: string) {
    return this.aiService.analyzeProjectDescription(description);
  }

  @Post('check-coherence')
  @RequiresPro()
  async checkCoherence(@Body('estimate') estimate: any) {
    return this.aiService.checkCoherence(estimate);
  }

  @Post('optimize-costs')
  @RequiresPro()
  async optimizeCosts(@Body('estimate') estimate: any) {
    return this.aiService.optimizeCosts(estimate);
  }

  @Post('generate-description')
  @RequiresPro()
  async generateDescription(@Body('estimate') estimate: any) {
    return this.aiService.generateDescription(estimate);
  }
}

