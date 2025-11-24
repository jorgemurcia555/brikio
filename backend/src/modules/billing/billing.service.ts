import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan, PlanName } from '../../database/entities/plan.entity';
import {
  Subscription,
  SubscriptionStatus,
} from '../../database/entities/subscription.entity';
import { User } from '../../database/entities/user.entity';
import { StripeService } from './stripe.service';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Plan)
    private plansRepository: Repository<Plan>,
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private stripeService: StripeService,
  ) {}

  async getPlans(): Promise<Plan[]> {
    return this.plansRepository.find({ where: { isActive: true } });
  }

  async getUserSubscription(userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['plan', 'user'],
    });

    if (!subscription) {
      // Create free subscription if doesn't exist
      return this.createFreeSubscription(userId);
    }

    return subscription;
  }

  async createFreeSubscription(userId: string): Promise<Subscription> {
    const freePlan = await this.plansRepository.findOne({
      where: { name: PlanName.TRIAL },
    });

    if (!freePlan) {
      throw new NotFoundException('Free plan not found');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const subscription = this.subscriptionsRepository.create({
      user,
      plan: freePlan,
      status: SubscriptionStatus.ACTIVE,
      usageCount: 0,
      lastUsageReset: new Date(),
    });

    return this.subscriptionsRepository.save(subscription);
  }

  async createCheckoutSession(userId: string, planId: string) {
    const plan = await this.plansRepository.findOne({ where: { id: planId } });

    if (!plan || !plan.stripePriceId) {
      throw new NotFoundException('Plan not found or not configured');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let subscription = await this.subscriptionsRepository.findOne({
      where: { user: { id: userId } },
    });

    // Create Stripe checkout session
    const session = await this.stripeService.createCheckoutSession(
      user,
      plan,
      subscription?.stripeCustomerId,
    );

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async handleStripeWebhook(event: any) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
    }
  }

  private async handleCheckoutCompleted(session: any) {
    const stripeCustomerId = session.customer;
    const stripeSubscriptionId = session.subscription;

    // Find user by email or customer ID
    const user = await this.usersRepository.findOne({
      where: { email: session.customer_email },
    });

    if (!user) return;

    // Get subscription details from Stripe
    const stripeSubscription =
      await this.stripeService.getSubscription(stripeSubscriptionId);

    // Find plan by Stripe price ID
    const plan = await this.plansRepository.findOne({
      where: { stripePriceId: stripeSubscription.items.data[0].price.id },
    });

    if (!plan) return;

    // Update or create subscription
    let subscription = await this.subscriptionsRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (subscription) {
      subscription.plan = plan;
      subscription.status = SubscriptionStatus.ACTIVE;
      subscription.stripeSubscriptionId = stripeSubscriptionId;
      subscription.stripeCustomerId = stripeCustomerId;
      subscription.currentPeriodStart = new Date(
        stripeSubscription.current_period_start * 1000,
      );
      subscription.currentPeriodEnd = new Date(
        stripeSubscription.current_period_end * 1000,
      );
    } else {
      subscription = this.subscriptionsRepository.create({
        user,
        plan,
        status: SubscriptionStatus.ACTIVE,
        stripeSubscriptionId,
        stripeCustomerId,
        currentPeriodStart: new Date(
          stripeSubscription.current_period_start * 1000,
        ),
        currentPeriodEnd: new Date(
          stripeSubscription.current_period_end * 1000,
        ),
        usageCount: 0,
        lastUsageReset: new Date(),
      });
    }

    await this.subscriptionsRepository.save(subscription);
  }

  private async handleSubscriptionUpdated(stripeSubscription: any) {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) return;

    subscription.status = this.mapStripeStatus(stripeSubscription.status);
    subscription.currentPeriodStart = new Date(
      stripeSubscription.current_period_start * 1000,
    );
    subscription.currentPeriodEnd = new Date(
      stripeSubscription.current_period_end * 1000,
    );
    subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;

    await this.subscriptionsRepository.save(subscription);
  }

  private async handleSubscriptionDeleted(stripeSubscription: any) {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { stripeSubscriptionId: stripeSubscription.id },
      relations: ['user'],
    });

    if (!subscription) return;

    // Downgrade to free plan
    await this.createFreeSubscription(subscription.user.id);

    // Delete old subscription
    await this.subscriptionsRepository.remove(subscription);
  }

  private async handlePaymentSucceeded(invoice: any) {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { stripeSubscriptionId: invoice.subscription },
    });

    if (!subscription) return;

    // Reset usage count on new billing period
    subscription.usageCount = 0;
    subscription.lastUsageReset = new Date();

    await this.subscriptionsRepository.save(subscription);
  }

  private async handlePaymentFailed(invoice: any) {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { stripeSubscriptionId: invoice.subscription },
    });

    if (!subscription) return;

    subscription.status = SubscriptionStatus.PAST_DUE;

    await this.subscriptionsRepository.save(subscription);
  }

  private mapStripeStatus(status: string): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      canceled: SubscriptionStatus.CANCELLED,
      past_due: SubscriptionStatus.PAST_DUE,
      trialing: SubscriptionStatus.TRIALING,
      incomplete: SubscriptionStatus.INCOMPLETE,
    };

    return statusMap[status] || SubscriptionStatus.CANCELLED;
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new BadRequestException('No active subscription found');
    }

    await this.stripeService.cancelSubscription(
      subscription.stripeSubscriptionId,
    );

    subscription.cancelAtPeriodEnd = true;

    await this.subscriptionsRepository.save(subscription);

    return { message: 'Subscription will be cancelled at period end' };
  }

  async checkUsageLimit(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);

    // Pro plan has unlimited usage
    if (subscription.plan.features.maxEstimates === null) {
      return true;
    }

    // Check if usage limit exceeded
    if (subscription.usageCount >= subscription.plan.features.maxEstimates) {
      return false;
    }

    return true;
  }

  async incrementUsage(userId: string) {
    const subscription = await this.getUserSubscription(userId);

    subscription.usageCount += 1;

    await this.subscriptionsRepository.save(subscription);
  }
}

