import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { StripeService } from './stripe.service';
import { Plan } from '../../database/entities/plan.entity';
import { Subscription } from '../../database/entities/subscription.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plan, Subscription, User]),
    ConfigModule,
  ],
  controllers: [BillingController],
  providers: [BillingService, StripeService],
  exports: [BillingService, StripeService],
})
export class BillingModule {}

