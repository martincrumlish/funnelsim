# Stripe Checkout Flow - Requirements

## Problem Statement
Current checkout flow is backwards: users click buy → sent to register → then checkout. This causes drop-off.

## Desired Flows

### Flow 1: New User Purchase (Landing Page)
1. User clicks "Get Started" on paid plan (e.g., Pro)
2. Goes directly to Stripe Checkout (no auth required)
3. Completes payment in Stripe (enters email + card)
4. Redirected to `/checkout/success` with session ID
5. Sees "Complete Your Account" form with:
   - Email pre-filled (from Stripe, read-only)
   - Password field
   - Confirm password field
6. Submits form → Account created → "Check your email to verify" message
7. After email verification → Can log in and access Dashboard

### Flow 2: Existing User Upgrade (Profile Page)
- Keep current flow: Upgrade button → Plan dialog → Checkout → Stripe → Profile
- Must verify this works with Stripe test mode

### Flow 3: Free Plan Selection
- No change: Goes to /auth (register) or /dashboard (if logged in)

## Email Collision Handling
When Stripe checkout email already exists in system:
- **Same or lower tier**: Show error - "This email already has an account"
- **Higher tier**: Show message - "This email already has an account. Please log in and upgrade from your Profile page"

## Thank You Page (`/checkout/success`)
- New dedicated route
- Validates Stripe session ID (security)
- Displays purchased plan details
- Shows "Complete Your Account" form
- After account creation: "Get Started" button to Dashboard

## Post-Registration
- Standard Supabase email verification flow
- User receives verification email
- Must verify before accessing dashboard

## Technical Changes Required

### Edge Function: `create-checkout-session`
- Allow unauthenticated requests (no user_id required)
- Use `allow_promotion_codes` if desired
- Set success_url to `/checkout/success?session_id={CHECKOUT_SESSION_ID}`

### New Route: `/checkout/success`
- Fetch session details from Stripe via edge function
- Pre-fill email from session
- Handle account creation
- Handle email collision cases

### Webhook: `stripe-webhook`
- May need adjustment to handle subscriptions without existing user_id
- Store pending subscription data until account is created

### Database
- Consider: `pending_subscriptions` table or metadata approach

## Out of Scope
- Changing pricing display
- Adding new payment methods
- Additional features beyond fixing the flow
- Modifying existing user upgrade UX (beyond testing)

## Visual Assets
None provided - use existing app styling patterns
