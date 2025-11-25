# Specification: One-Time/Lifetime Pricing Support

## Goal

Add support for one-time/lifetime pricing options alongside the existing monthly/yearly subscription model, enabling users to make a single payment for permanent access to a subscription tier.

## User Stories

- As a customer, I want to purchase lifetime access to a plan so that I can avoid recurring payments
- As an admin, I want to configure lifetime pricing for subscription tiers so that I can offer one-time purchase options
- As a user with lifetime access, I want my subscription to display "Lifetime" status so that I know my access never expires
- As a customer, I want to see monthly, yearly, and lifetime pricing options when upgrading so that I can choose my preferred billing method

## Core Requirements

- Users can purchase lifetime access via Stripe one-time payments
- Admin can configure lifetime price and Stripe price ID per subscription tier
- Lifetime subscriptions never expire (no renewal date displayed)
- Profile page shows "Lifetime" badge for users with lifetime purchases
- Upgrade flow offers monthly, yearly, and lifetime billing options
- Webhook correctly processes one-time payment completion events

## Reusable Components

### Existing Code to Leverage

**Database Patterns:**
- `supabase/migrations/20251125000001_subscription_tiers.sql` - Existing tier structure pattern
- `supabase/migrations/20251125000002_user_subscriptions.sql` - Existing subscription tracking pattern

**Edge Functions:**
- `supabase/functions/create-checkout-session/index.ts` - Extend with `mode: 'payment'` support
- `supabase/functions/stripe-webhook/index.ts` - Extend with one-time payment event handling

**Frontend Components:**
- `src/components/admin/TierEditor.tsx` - Add lifetime price fields following existing field patterns
- `src/components/admin/TierCreator.tsx` - Add lifetime price fields following existing field patterns
- `src/components/subscription/SubscriptionCard.tsx` - Add lifetime badge logic following existing status badge pattern
- `src/pages/admin/AdminProducts.tsx` - Display lifetime pricing in card following existing pricing display pattern

**Hooks:**
- `src/hooks/useSubscription.tsx` - Extend `initiateCheckout` and add `isLifetime` derived value

**Types:**
- `src/integrations/supabase/types.ts` - Existing type export patterns for new columns

### New Components Required

None - all changes extend existing components and services.

## Technical Approach

### Database Migration

Create new migration `20251125000006_lifetime_pricing.sql`:

**subscription_tiers table changes:**
- Add `stripe_price_id_lifetime` column (text, nullable) - Stores Stripe one-time price ID
- Add `price_lifetime` column (numeric(10,2), default 0) - Display price for lifetime option

**user_subscriptions table changes:**
- Add `is_lifetime` column (boolean, default false) - Tracks if subscription is a lifetime purchase

### Edge Function: create-checkout-session

Update `CheckoutSessionRequest` interface to accept `billing_interval: 'monthly' | 'yearly' | 'lifetime'`

When `billing_interval === 'lifetime'`:
- Set `mode: 'payment'` instead of `mode: 'subscription'`
- Remove `subscription_data` block (not applicable for one-time payments)
- Add metadata to identify as lifetime purchase

### Edge Function: stripe-webhook

Update `handleCheckoutSessionCompleted` function:

- Check `session.mode` to determine payment type
- If `mode === 'payment'`:
  - Look up tier by `stripe_price_id_lifetime` column
  - Set `is_lifetime: true` on user_subscriptions record
  - Set `status: 'active'`
  - Set `current_period_end` to far-future date (e.g., 2099-12-31) or null
  - Clear `stripe_subscription_id` (no recurring subscription)

Update `getTierIdByPriceId` helper to also check `stripe_price_id_lifetime`.

### useSubscription Hook Updates

Add to context type:
- `isLifetime: boolean` - True if user has lifetime subscription

Update `initiateCheckout` signature:
- Accept `billingInterval: 'monthly' | 'yearly' | 'lifetime'`

Add derived value:
- `isLifetime = subscription?.is_lifetime === true`

### Admin UI Updates

**TierEditor.tsx:**
- Add `priceLifetime` state field
- Add `stripePriceIdLifetime` state field
- Add input fields in Stripe Configuration section

**TierCreator.tsx:**
- Add `priceLifetime` state field (default 0)
- Add `stripePriceIdLifetime` state field (default '')
- Add input fields matching TierEditor

**AdminProducts.tsx:**
- Display lifetime price in tier card pricing section
- Display lifetime Stripe price ID in Stripe IDs section

### SubscriptionCard Updates

Update `getStatusBadge` function:
- Add case for lifetime subscriptions returning "Lifetime" badge with distinct styling

Update billing period display:
- Hide renewal date for lifetime subscriptions
- Show "Lifetime access" text instead

### Profile Page Updates

Update upgrade handling:
- Show billing interval selector (monthly/yearly/lifetime)
- Pass selected interval to `initiateCheckout`

### TypeScript Types

Update `subscription_tiers` types:
- Add `stripe_price_id_lifetime: string | null`
- Add `price_lifetime: number`

Update `user_subscriptions` types:
- Add `is_lifetime: boolean`

Update `SubscriptionStatus` type:
- Add 'lifetime' as valid status display option

### Documentation Updates

Add new section to `docs/manual.html`:
- "Configuring Lifetime Pricing"
- How to create one-time price in Stripe Dashboard
- How to add lifetime price ID in admin
- How webhook processes one-time payments

## Out of Scope

- Refunds for lifetime purchases (handled via Stripe Dashboard)
- Converting lifetime to recurring subscription
- Prorated upgrades from recurring to lifetime
- Multiple lifetime tiers per user
- Lifetime-only products (all tiers still support recurring)

## Success Criteria

- User can complete lifetime purchase through Stripe Checkout
- Webhook successfully processes one-time payment and creates lifetime subscription
- Admin can configure lifetime pricing for any tier
- Profile page correctly displays "Lifetime" status without renewal date
- Existing monthly/yearly subscriptions continue working unchanged
- TypeScript types updated and type-safe across all changes
