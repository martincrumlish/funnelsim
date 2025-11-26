# Specification: Stripe Checkout Flow Fix

## Goal
Reverse the checkout flow so new users can complete Stripe payment before creating an account, reducing drop-off by eliminating the registration barrier before purchase.

## User Stories
- As a new visitor, I want to pay for a plan directly from the landing page so that I can commit to the product before creating credentials
- As a returning user, I want to upgrade my subscription from my profile page so that I can access higher tier features

## Specific Requirements

**Unauthenticated Checkout from Landing Page**
- Landing page "Get Started" buttons for paid plans call the checkout edge function without requiring authentication
- Edge function creates Stripe Checkout session without user_id, using only price_id
- Stripe collects email during checkout (no pre-filled email needed)
- Success URL redirects to `/checkout/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL redirects back to landing page (`/`)

**New Checkout Success Page**
- Create new route `/checkout/success` with dedicated page component
- Validate session_id query parameter exists and is valid via edge function call
- Fetch Stripe session details to retrieve customer email and purchased plan info
- Display purchased plan name and confirmation message
- Show "Complete Your Account" form with email (pre-filled, read-only), password, and confirm password fields
- Form creates Supabase user account and links to existing Stripe customer/subscription

**Email Collision Handling**
- Before account creation, check if email already exists in auth.users
- If email exists with same or lower tier: Show error "This email already has an account. Please log in."
- If email exists with higher tier purchase: Show message "This email already has an account. Please log in and upgrade from your Profile page."
- Provide link to `/auth` login page in error state

**New Edge Function: retrieve-checkout-session**
- Create new edge function to securely retrieve Stripe session details
- Accept session_id parameter, validate it exists
- Return customer_email, payment_status, subscription status, tier info
- No authentication required (session_id acts as short-lived token)

**Modified Edge Function: create-checkout-session**
- Make user_id and user_email optional parameters
- When unauthenticated: do not create Stripe customer upfront, let Stripe Checkout create one
- When authenticated (existing user upgrade): keep current behavior with customer lookup/creation
- Set client_reference_id only when user_id is provided

**Modified Webhook: stripe-webhook**
- Handle checkout.session.completed for sessions without user_id in metadata
- Store pending subscription data when no user_id present (customer_id, tier_id, status)
- Create `pending_subscriptions` table entry for unlinked purchases
- When user account is created via success page, link pending subscription to new user

**Database: pending_subscriptions Table**
- New table to track purchases awaiting account creation
- Columns: id, stripe_customer_id, stripe_session_id, stripe_subscription_id, tier_id, customer_email, status, created_at, linked_user_id, linked_at
- Records deleted or marked linked after successful account creation
- Include expiration logic (e.g., 7 days) for cleanup

**Account Creation on Success Page**
- Call Supabase signUp with email and password
- After successful signup, call edge function to link pending subscription to new user_id
- Trigger standard Supabase email verification flow
- Show "Check your email to verify your account" message
- Provide "Go to Dashboard" button (dashboard will enforce email verification)

**Existing User Upgrade Flow**
- No changes to Profile page upgrade UX
- Verify existing flow works correctly with Stripe test mode
- initiateCheckout in useSubscription.tsx continues to pass user_id/user_email

## Visual Design
No visual assets provided - use existing app styling patterns from Auth.tsx and ResetPassword.tsx for the checkout success page layout.

## Existing Code to Leverage

**`src/pages/ResetPassword.tsx`**
- Page layout with centered Card component
- Form validation pattern (password match, min length)
- useSearchParams for query parameter extraction
- Loading state and error toast handling
- Whitelabel logo integration

**`supabase/functions/create-checkout-session/index.ts`**
- Existing Stripe session creation logic to modify
- CORS headers pattern
- Error response formatting
- Stripe SDK initialization pattern

**`supabase/functions/stripe-webhook/index.ts`**
- handleCheckoutSessionCompleted function structure
- getTierIdByPriceId helper for mapping prices to tiers
- Upsert pattern for user_subscriptions table
- Webhook signature verification

**`src/hooks/useAuth.tsx`**
- signUp function for account creation
- Navigation patterns after authentication
- Supabase auth integration

**`src/hooks/useSubscription.tsx`**
- initiateCheckout function as reference for checkout flow
- Subscription state management pattern
- Edge function calling pattern with authorization

## Out of Scope
- Changing pricing display or tier structure
- Adding new payment methods beyond card
- Modifying Stripe Customer Portal functionality
- Coupon/promotion code UI (Stripe handles natively)
- Changing existing user upgrade UX beyond verification
- Multi-currency support
- Subscription pause/resume functionality
- Refund processing UI
- Invoice history display
- Annual/lifetime billing toggle on landing page
