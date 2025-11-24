import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Headers,
  RawBodyRequest,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly stripeService: StripeService,
  ) {}

  @Get('plans')
  async getPlans() {
    return this.billingService.getPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscription')
  async getSubscription(@CurrentUser('id') userId: string) {
    return this.billingService.getUserSubscription(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckoutSession(
    @CurrentUser('id') userId: string,
    @Body('planId') planId: string,
  ) {
    return this.billingService.createCheckoutSession(userId, planId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel')
  async cancelSubscription(@CurrentUser('id') userId: string) {
    return this.billingService.cancelSubscription(userId);
  }

  @Public()
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    try {
      if (!request.rawBody) {
        throw new BadRequestException('Missing request body');
      }
      const event = await this.stripeService.constructEventFromPayload(
        signature,
        request.rawBody,
      );

      await this.billingService.handleStripeWebhook(event);

      return { received: true };
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }
}

