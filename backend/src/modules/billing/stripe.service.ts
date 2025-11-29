import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { User } from '../../database/entities/user.entity';
import { Plan } from '../../database/entities/plan.entity';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_dummy',
      {
        apiVersion: '2023-10-16',
      },
    );
  }

  async createCheckoutSession(
    user: User,
    plan: Plan,
    existingCustomerId?: string,
  ) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/billing/cancel`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planId: plan.id,
      },
    };

    if (existingCustomerId) {
      sessionParams.customer = existingCustomerId;
    }

    return this.stripe.checkout.sessions.create(sessionParams);
  }

  async getSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async cancelSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async constructEventFromPayload(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    ) || 'whsec_dummy';

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }

  async createSetupIntent(customerId: string) {
    return this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session', // For future payments after trial
    });
  }

  async createCustomer(email: string, name?: string) {
    return this.stripe.customers.create({
      email,
      name,
    });
  }

  async attachPaymentMethodToCustomer(
    paymentMethodId: string,
    customerId: string,
  ) {
    return this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    return this.stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  async createSubscriptionWithTrial(
    customerId: string,
    priceId: string,
    paymentMethodId: string,
    trialPeriodDays: number = 7,
  ) {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      trial_period_days: trialPeriodDays,
      expand: ['latest_invoice.payment_intent'],
    });
  }
}

