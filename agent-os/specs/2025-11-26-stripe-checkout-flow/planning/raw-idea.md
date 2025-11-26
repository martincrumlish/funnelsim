# Raw Idea: Stripe Checkout Flow Fix

## Feature Description

Fix the checkout flow for Stripe integration. Currently the flow is backwards - users click buy, get sent to register, then have to find their way to checkout.

The desired flow:
1. Landing page shows products with buy buttons
2. Buy button should go directly to Stripe Checkout
3. After successful payment, user should be directed to a secure thank-you/registration page
4. Need to consider: auto-registration with emailed credentials vs manual registration form
5. Also need to handle the "upgrade" path for existing users in the profile page

The spec should cover:
- New user purchase flow (landing page → Stripe → registration)
- Existing user upgrade flow (profile page → Stripe → confirmation)
- Security considerations for post-payment registration
- Stripe webhook handling for account creation
