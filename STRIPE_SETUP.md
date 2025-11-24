# 💳 Stripe Setup Guide - Brikio

Complete guide to set up Stripe for payments and webhooks.

## 📋 Table of Contents

1. [Create Stripe Account](#1-create-stripe-account)
2. [Create Products and Prices](#2-create-products-and-prices)
3. [Get API Keys](#3-get-api-keys)
4. [Configure Webhooks](#4-configure-webhooks)
5. [Test in Development](#5-test-in-development)
6. [Test in Production](#6-test-in-production)

---

## 1. Create Stripe Account

### Step 1: Sign Up
1. Go to https://stripe.com
2. Click "Sign up" or "Start now"
3. Fill in your business information
4. Verify your email

### Step 2: Activate Account
1. Complete business verification
2. Add bank account (for payouts)
3. Set business details

**Note:** You can start testing immediately without full verification!

---

## 2. Create Products and Prices

### Option A: Via Stripe Dashboard (Recommended)

#### Create Basic Plan ($7/month)

1. **Go to Products**
   - Dashboard → Products → "+ Add product"

2. **Fill Product Details**
   ```
   Name: Basic Plan
   Description: Essential features for small builders
   
   Pricing:
   - Type: Recurring
   - Amount: $7.00 USD
   - Billing period: Monthly
   ```

3. **Save and Copy Price ID**
   - After saving, you'll see: `price_xxxxxxxxxxxxx`
   - Copy this! You'll need it for `STRIPE_BASIC_PLAN_PRICE_ID`

#### Create Premium Plan ($18/month)

1. **Add another product**
   ```
   Name: Premium Plan
   Description: Advanced features with AI assistant
   
   Pricing:
   - Type: Recurring
   - Amount: $18.00 USD
   - Billing period: Monthly
   ```

2. **Save and Copy Price ID**
   - Copy: `price_yyyyyyyyyyyyy`
   - You'll need it for `STRIPE_PREMIUM_PLAN_PRICE_ID`

### Option B: Via Stripe CLI (Advanced)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Create Basic Plan
stripe products create \
  --name="Basic Plan" \
  --description="Essential features for small builders"

# Get product ID (prod_xxxxx) and create price
stripe prices create \
  --product=prod_xxxxx \
  --unit-amount=700 \
  --currency=usd \
  --recurring[interval]=month

# Create Premium Plan
stripe products create \
  --name="Premium Plan" \
  --description="Advanced features with AI assistant"

stripe prices create \
  --product=prod_yyyyy \
  --unit-amount=1800 \
  --currency=usd \
  --recurring[interval]=month
```

---

## 3. Get API Keys

### Development Keys (Test Mode)

1. **Go to Developers → API keys**
   - https://dashboard.stripe.com/test/apikeys

2. **Find Test Keys**
   ```
   Publishable key: pk_test_xxxxxxxxxxxxx
   Secret key: sk_test_xxxxxxxxxxxxx (Click "Reveal test key")
   ```

3. **Copy Secret Key**
   - Copy `sk_test_xxxxxxxxxxxxx`
   - Add to `.env` or `.env.production`:
   ```env
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   ```

### Production Keys (Live Mode)

1. **Toggle to Live Mode** (top right)
2. **Go to Developers → API keys**
   - https://dashboard.stripe.com/apikeys

3. **Find Live Keys**
   ```
   Publishable key: pk_live_xxxxxxxxxxxxx
   Secret key: sk_live_xxxxxxxxxxxxx (Click "Reveal live key")
   ```

4. **⚠️ Important:**
   - NEVER commit live keys to git
   - Use live keys ONLY in production
   - Keep them secret!

---

## 4. Configure Webhooks

### What are Webhooks?

Webhooks are automatic notifications from Stripe to your server when events happen:
- ✅ Payment succeeded
- ❌ Payment failed
- 📝 Subscription created
- 🔄 Subscription renewed
- ❌ Subscription canceled

### Development Webhooks (Testing Locally)

#### Option A: Using Stripe CLI (Recommended for Local Testing)

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe
   
   # Linux
   wget https://github.com/stripe/stripe-cli/releases/download/vX.X.X/stripe_X.X.X_linux_x86_64.tar.gz
   tar -xvf stripe_X.X.X_linux_x86_64.tar.gz
   ```

2. **Login to Stripe**
   ```bash
   stripe login
   ```
   - Opens browser to authorize
   - Connects CLI to your Stripe account

3. **Forward Webhooks to Local Server**
   ```bash
   # Start your backend first (npm run start:dev)
   
   # Then forward webhooks
   stripe listen --forward-to localhost:3000/api/v1/billing/webhook
   ```

4. **Copy Webhook Secret**
   - The CLI will show: `whsec_xxxxxxxxxxxxx`
   - Copy this to your `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

5. **Test Webhook**
   ```bash
   # In another terminal
   stripe trigger customer.subscription.created
   stripe trigger payment_intent.succeeded
   ```

#### Option B: Using ngrok (Testing from Stripe Dashboard)

1. **Install ngrok**
   ```bash
   npm install -g ngrok
   # or
   brew install ngrok
   ```

2. **Expose Local Server**
   ```bash
   # Start your backend first
   npm run start:dev
   
   # Then expose it
   ngrok http 3000
   ```

3. **Copy ngrok URL**
   - You'll see: `https://xxxx-xx-xx-xx-xx.ngrok.io`
   - This is your temporary public URL

4. **Create Webhook in Stripe Dashboard**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click "+ Add endpoint"
   - Endpoint URL: `https://xxxx-xx-xx-xx-xx.ngrok.io/api/v1/billing/webhook`
   - Select events (see list below)
   - Click "Add endpoint"

5. **Copy Webhook Secret**
   - Click on your webhook
   - Click "Reveal" next to "Signing secret"
   - Copy `whsec_xxxxxxxxxxxxx`
   - Add to `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Production Webhooks (Live Server)

1. **Go to Stripe Webhooks**
   - Toggle to **Live Mode** (top right)
   - Go to: https://dashboard.stripe.com/webhooks
   - Click "+ Add endpoint"

2. **Configure Endpoint**
   ```
   Endpoint URL: https://api.yourdomain.com/api/v1/billing/webhook
   Description: Brikio Production Webhooks
   Version: Latest API version
   ```

3. **Select Events**
   Check these events (minimum required):
   ```
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
   ✅ customer.subscription.trial_will_end (optional, for 7-day trial reminders)
   ```

4. **Save and Get Secret**
   - Click "Add endpoint"
   - Click on your new webhook
   - Click "Reveal" next to "Signing secret"
   - Copy `whsec_live_xxxxxxxxxxxxx`

5. **Add to Production Environment**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_live_xxxxxxxxxxxxx
   ```

6. **Restart Your Server**
   ```bash
   # Docker
   docker-compose -f docker-compose.prod.yml restart backend
   
   # Or full redeploy
   ./deploy.sh
   ```

---

## 5. Test in Development

### Test Payment Flow

1. **Start Your Application**
   ```bash
   # Backend
   cd backend && npm run start:dev
   
   # Frontend
   cd frontend && npm run dev
   
   # Stripe webhook forwarding
   stripe listen --forward-to localhost:3000/api/v1/billing/webhook
   ```

2. **Test Card Numbers**
   Use these test cards in your app:
   
   | Card Number | Result |
   |-------------|--------|
   | 4242 4242 4242 4242 | Success ✅ |
   | 4000 0000 0000 0002 | Card declined ❌ |
   | 4000 0000 0000 9995 | Insufficient funds ❌ |
   | 4000 0025 0000 3155 | Requires authentication (3D Secure) |
   
   **Other test details:**
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

3. **Test Subscription Flow**
   - Go to: http://localhost:5173/billing
   - Click "Upgrade to Basic" or "Upgrade to Premium"
   - Use test card: `4242 4242 4242 4242`
   - Complete payment
   - Check webhook received in terminal
   - Verify subscription is active in app

4. **Check Stripe Dashboard**
   - Go to: https://dashboard.stripe.com/test/payments
   - You should see your test payment
   - Go to: https://dashboard.stripe.com/test/subscriptions
   - You should see your test subscription

5. **Test Webhook Events Manually**
   ```bash
   # Trigger events manually
   stripe trigger customer.subscription.created
   stripe trigger customer.subscription.updated
   stripe trigger customer.subscription.deleted
   stripe trigger invoice.payment_succeeded
   stripe trigger invoice.payment_failed
   ```

### Verify Webhook Logs

```bash
# Check backend logs
docker logs brikio-backend-prod | grep webhook

# Or if running locally
# Check your terminal for webhook events
```

---

## 6. Test in Production

### Pre-Production Checklist

- [ ] Live API keys configured
- [ ] Production webhook created with live secret
- [ ] Product prices created in live mode
- [ ] Environment variables updated
- [ ] Application redeployed

### Test with Real Payment (Small Amount)

1. **Use Your Own Card**
   - Make a real payment with your card
   - Subscribe to Basic plan ($7)
   - Verify charge appears in bank statement
   - Check it appears in Stripe Dashboard (Live Mode)

2. **Verify Webhook Delivery**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click on your webhook
   - Check "Recent deliveries" tab
   - All should show ✅ Success

3. **Test in Your App**
   - Login to your account
   - Check subscription is active
   - Check features are unlocked
   - Try AI features (Premium only)

4. **Cancel and Verify**
   - Cancel subscription in app
   - Verify webhook received
   - Verify features locked
   - Check cancellation in Stripe Dashboard

### Monitor Webhooks

1. **Failed Webhooks**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click on webhook
   - Check "Recent deliveries"
   - If failed (❌), click to see error

2. **Common Issues**
   ```
   ❌ 404 Not Found
   → Check endpoint URL is correct
   
   ❌ 401 Unauthorized
   → Check STRIPE_WEBHOOK_SECRET is correct
   
   ❌ 500 Server Error
   → Check backend logs for errors
   
   ❌ Timeout
   → Webhook must respond in < 5 seconds
   ```

3. **Retry Failed Webhooks**
   - Click on failed event
   - Click "Retry"
   - Stripe will send it again

---

## 📊 Summary of Keys Needed

Add these to your `.env.production`:

```env
# Stripe API Keys (Get from: https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# Webhook Secret (Get from: https://dashboard.stripe.com/webhooks)
STRIPE_WEBHOOK_SECRET=whsec_live_xxxxxxxxxxxxx

# Product Price IDs (Get from: https://dashboard.stripe.com/products)
STRIPE_BASIC_PLAN_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PREMIUM_PLAN_PRICE_ID=price_yyyyyyyyyyyyy
```

---

## 🔒 Security Best Practices

1. **Never commit secrets to git**
   ```bash
   # Already in .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use environment variables**
   - Never hardcode keys in code
   - Use `.env.production` for production
   - Use `.env` for development

3. **Verify webhook signatures**
   - Already implemented in `billing.service.ts`
   - Never skip signature verification

4. **Use HTTPS in production**
   - Webhooks only work over HTTPS
   - Use Let's Encrypt for free SSL

5. **Rotate keys periodically**
   - Generate new keys every 6-12 months
   - Update in all environments

---

## 🐛 Troubleshooting

### Webhook Not Receiving Events

**Check Endpoint URL:**
```bash
curl -X POST https://api.yourdomain.com/api/v1/billing/webhook \
  -H "Content-Type: application/json" \
  -d '{}'
```
Should return 200 OK (even with empty data)

**Check Firewall:**
- Ensure port 3000 (or 443) is open
- Allow Stripe IPs (or all IPs for webhooks)

**Check Logs:**
```bash
docker logs brikio-backend-prod -f | grep webhook
```

### Signature Verification Failed

**Wrong Secret:**
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Make sure it's the webhook secret, not API key

**Restart Required:**
- After changing webhook secret, restart backend:
```bash
docker-compose -f docker-compose.prod.yml restart backend
```

### Payment Succeeded but User Not Upgraded

**Check Database:**
```bash
docker exec -it brikio-db-prod psql -U brikio_prod_user -d brikio_production

# Check subscriptions table
SELECT * FROM subscriptions WHERE "userId" = 'user-id-here';
```

**Check Webhook Processing:**
```bash
# View recent webhook logs
docker logs brikio-backend-prod --tail=100 | grep webhook
```

---

## 📞 Need Help?

- **Stripe Documentation**: https://stripe.com/docs/webhooks
- **Stripe Support**: https://support.stripe.com
- **Test Cards**: https://stripe.com/docs/testing
- **Webhook Tester**: https://stripe.com/docs/webhooks/test

---

## 🎯 Quick Reference

| Action | Command/URL |
|--------|-------------|
| Stripe Dashboard | https://dashboard.stripe.com |
| Test Mode | https://dashboard.stripe.com/test |
| Live Mode | https://dashboard.stripe.com |
| API Keys (Test) | https://dashboard.stripe.com/test/apikeys |
| API Keys (Live) | https://dashboard.stripe.com/apikeys |
| Webhooks (Test) | https://dashboard.stripe.com/test/webhooks |
| Webhooks (Live) | https://dashboard.stripe.com/webhooks |
| Products | https://dashboard.stripe.com/products |
| Forward Webhooks | `stripe listen --forward-to localhost:3000/api/v1/billing/webhook` |
| Test Event | `stripe trigger customer.subscription.created` |

---

**¡Ya puedes aceptar pagos en Brikio! 💳✨**

