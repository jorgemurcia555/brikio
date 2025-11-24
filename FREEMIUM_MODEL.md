# Freemium "Try-Before-Buy" Model Implementation

## Overview

**Brikio** now uses a **"Try-Before-Buy"** model where users can access and use the full application **without signing up**. Registration is only required when users want to download/export their estimates.

## User Flow

```
1. User visits landing page
   ↓
2. Clicks "Try Now" → Goes directly to /projects/new (no auth required)
   ↓
3. Creates full estimate:
   - Add project details
   - Define areas
   - Add line items
   - Preview calculations
   ↓
4. Tries to download PDF → Modal appears
   ↓
5. Registers for account
   ↓
6. Gets 7-day free trial (no credit card required)
   ↓
7. After 7 days → Auto-charge $7/month via Stripe
```

## Frontend Changes (✅ Completed)

### 1. Landing Page
- ✅ Updated hero CTA: "Start creating now" (goes to `/projects/new`)
- ✅ Updated nav CTA: "Try Now" instead of "Try Free"
- ✅ New pricing section explains "Try First" vs "Pro"
- ✅ Badge: "No signup required"

### 2. Routes (`App.tsx`)
- ✅ Added public route: `/projects/new` → `<GuestProjectPage />`
- ✅ No authentication required to access estimate creator

### 3. Guest Project Page (`GuestProjectPage.tsx`)
- ✅ Full-featured estimate creator (4-step wizard)
- ✅ Works completely offline/without backend
- ✅ Saves project data to `localStorage`
- ✅ On download attempt → Shows registration modal
- ✅ Modal highlights 7-day trial + benefits

### 4. i18n Translations
- ✅ English and Spanish translations updated
- ✅ Reflects new "Try-Before-Buy" messaging
- ✅ Pricing clearly shows trial period

## Backend Changes (⚠️ TODO)

### 1. Authentication Guards

**Current State:**
All routes are protected by `JwtAuthGuard`.

**Required Changes:**

```typescript
// backend/src/common/guards/public-routes.guard.ts (NEW)
// Allow specific endpoints to be public

export const PUBLIC_ENDPOINTS = [
  '/api/templates',  // Read-only template library
  '/api/materials/catalog',  // Read-only material catalog
  '/api/units',  // Read-only units
];
```

**Recommendation:**
- Keep all write operations protected
- Only allow READ operations publicly
- Templates and materials can be cached client-side for guest mode

### 2. User Registration with Project Data

**Required Change:**

```typescript
// backend/src/modules/auth/dto/register.dto.ts
export class RegisterDto {
  // ... existing fields
  
  @IsOptional()
  @IsObject()
  guestProjectData?: {
    projectName: string;
    areas: any[];
    lineItems: any[];
    total: number;
  };
}
```

```typescript
// backend/src/modules/auth/auth.service.ts
async register(registerDto: RegisterDto) {
  const user = await this.createUser(registerDto);
  
  // If user came from guest mode, convert guest project to real project
  if (registerDto.guestProjectData) {
    await this.projectsService.createFromGuestData(
      user.id,
      registerDto.guestProjectData
    );
  }
  
  return this.generateTokens(user);
}
```

### 3. Stripe Integration - 7-Day Trial

**Current State:**
Trial period not configured.

**Required Changes:**

```typescript
// backend/src/modules/billing/stripe.service.ts
async createSubscription(userId: string, paymentMethodId: string) {
  const subscription = await this.stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: this.proPlanPriceId }],
    payment_behavior: 'default_incomplete',
    trial_period_days: 7, // 👈 ADD THIS
    expand: ['latest_invoice.payment_intent'],
  });
  
  return subscription;
}
```

**Backend Flow:**
1. User registers → Creates user account
2. User adds payment method → No charge yet
3. Subscription created with `trial_period_days: 7`
4. After 7 days → Stripe automatically charges $29.99
5. Webhook receives `customer.subscription.updated` → Update user status

### 4. Subscription Status

```typescript
// backend/src/database/entities/subscription.entity.ts
export enum SubscriptionStatus {
  TRIALING = 'trialing',  // 👈 ADD THIS
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
}
```

### 5. Download/Export Guard

**New Guard:**

```typescript
// backend/src/common/guards/download.guard.ts (NEW)
@Injectable()
export class DownloadGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new UnauthorizedException('Please register to download estimates');
    }
    
    if (user.subscription.status === 'canceled') {
      throw new ForbiddenException('Active subscription required to download');
    }
    
    return true;
  }
}
```

**Apply to:**
- `POST /api/estimates/:id/export-pdf`
- `POST /api/estimates/:id/export-excel`
- `GET /api/estimates/:id/download`

## Database Schema Changes

### No changes required!
The existing schema already supports this model.

## Environment Variables

Add to `.env`:

```bash
# Stripe
STRIPE_TRIAL_DAYS=7
STRIPE_PRO_PLAN_PRICE_ID=price_xxxxx  # Your Stripe price ID
```

## Testing Checklist

### Frontend
- [ ] Landing page loads and CTAs work
- [ ] Guest can access `/projects/new` without auth
- [ ] Guest can create full estimate
- [ ] Download attempt shows registration modal
- [ ] Project data persists in localStorage
- [ ] After registration, guest data is restored

### Backend
- [ ] Public endpoints return data without auth
- [ ] Registration with `guestProjectData` creates project
- [ ] Subscription created with 7-day trial
- [ ] No charge occurs immediately
- [ ] After 7 days, Stripe webhook triggers charge
- [ ] Download endpoints require authentication

## Migration Plan

1. ✅ **Phase 1: Frontend** (Completed)
   - Landing page updates
   - Guest project page
   - Route changes

2. **Phase 2: Backend** (TODO)
   - Update auth guards
   - Add public endpoints
   - Configure Stripe trial
   - Add download guard

3. **Phase 3: Testing** (TODO)
   - E2E guest flow
   - Stripe webhook testing
   - Trial expiration testing

4. **Phase 4: Deployment** (TODO)
   - Deploy frontend
   - Deploy backend
   - Update Stripe configuration
   - Monitor conversion rates

## Conversion Funnel Metrics

Track these metrics to optimize the freemium model:

1. **Landing → Try Now**: % who click "Try Now"
2. **Try Now → Created Estimate**: % who complete wizard
3. **Created Estimate → Download Attempt**: % who try to download
4. **Download Attempt → Registered**: % who complete registration
5. **Registered → Added Payment**: % who add payment method
6. **Trial → Paid**: % who convert after 7 days

## Pricing Summary

| Plan | Price | Trial | Features |
|------|-------|-------|----------|
| **Try First** | $0 | Forever | Create unlimited estimates, preview everything, no downloads |
| **Pro** | $7/month | 7 days free | Everything + downloads, AI assistant, cost optimization |

## Notes

- **No credit card required** for trial signup
- Payment method only required for download (starts 7-day trial)
- After 7 days, automatic billing begins
- User can cancel anytime (Stripe handles prorated refunds)
- Guest data stored in `localStorage` (client-side only)
- Registration converts guest data to database records

