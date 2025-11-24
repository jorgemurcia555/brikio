import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRES_PRO_KEY } from '../decorators/requires-pro.decorator';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiresPro = this.reflector.getAllAndOverride<boolean>(
      REQUIRES_PRO_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiresPro) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.subscription) {
      throw new ForbiddenException(
        'This feature requires an active subscription',
      );
    }

    const subscription = user.subscription;

    // Check if subscription is active
    if (subscription.status !== 'active') {
      throw new ForbiddenException(
        'Your subscription is not active. Please upgrade to access this feature.',
      );
    }

    // Check if plan includes required features (Premium only)
    const plan = subscription.plan;
    if (!plan.features?.aiEnabled) {
      throw new ForbiddenException(
        'This feature is only available for Premium users ($18/month). Please upgrade your plan to access AI features.',
      );
    }

    return true;
  }
}

