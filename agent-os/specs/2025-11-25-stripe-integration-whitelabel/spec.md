# Specification: Stripe Integration & Whitelabel System

## Goal

Integrate Stripe Checkout for subscription-based access tiers (Free, Pro, Enterprise) with funnel limits, build an admin area for user/subscription/product management, and implement a whitelabel configuration system that allows standalone deployments with custom branding, landing page content, and email settings.

## User Stories

- As a user, I want to subscribe to a plan so that I can access more funnels and features
- As a user, I want to see my current subscription status and funnel usage in my profile
- As a user, I want to manage my subscription (view plan, cancel) from within the app
- As an admin, I want to manage users and view their subscription status
- As an admin, I want to configure subscription tiers with pricing and funnel limits
- As an admin, I want to customize the branding (logo, colors, name) for my deployment
- As an admin, I want to customize landing page content (hero, features, testimonials, FAQ)
- As a whitelabel operator, I want to deploy my own instance with my Stripe account and branding

## Core Requirements

- Stripe Checkout redirect flow for payment processing
- Monthly and yearly billing intervals for Pro and Enterprise tiers
- Free tier with limited funnels (no payment required)
- Funnel creation limit enforcement based on subscription tier
- Subscription lifecycle handling (create, cancel, refund revokes access)
- Webhook processing for Stripe events
- Admin dashboard with user management, subscription overview, product configuration
- Whitelabel configuration for branding and landing page content
- Environment variable-based configuration for standalone deployments

## Visual Design

No mockups provided. Follow existing design patterns:
- Admin area should follow Dashboard card-based layout patterns
- Use shadcn/ui components consistent with Profile.tsx and Dashboard.tsx
- Maintain existing landing page dark theme styling for whitelabel customization

## Reusable Components

### Existing Code to Leverage

- `src/hooks/useAuth.tsx` - Extend to include subscription status in auth context
- `src/pages/Profile.tsx` - Add subscription management section (pattern for card layouts)
- `src/pages/Dashboard.tsx` - Pattern for protected page layout, funnel limit enforcement
- `src/components/landing/Testimonials.tsx` - Make pricing section dynamic from whitelabel config
- `src/components/landing/Hero.tsx` - Make content dynamic from whitelabel config
- `src/components/landing/Features.tsx` - Make features array configurable
- `src/components/landing/Navbar.tsx` - Use whitelabel logo
- `supabase/functions/send-password-reset/index.ts` - Pattern for edge function structure
- `src/components/ui/*` - shadcn/ui component library for admin area
- `src/integrations/supabase/client.ts` - Supabase client pattern
- `src/integrations/supabase/types.ts` - TypeScript types pattern for new tables

### New Components Required

- `src/hooks/useSubscription.tsx` - Subscription context (cannot reuse useAuth directly as it needs separate concerns)
- `src/hooks/useWhitelabel.tsx` - Whitelabel config context for app-wide branding access
- `src/pages/admin/*` - Admin pages (new protected area, no existing admin structure)
- `supabase/functions/stripe-webhook/index.ts` - Webhook handler (new Stripe integration)
- `supabase/functions/create-checkout-session/index.ts` - Checkout session creation (new Stripe integration)
- `supabase/functions/create-portal-session/index.ts` - Customer portal for subscription management

## Technical Approach

### Database Schema

Four new tables required:

**subscription_tiers**
- Stores available plans (Free, Pro, Enterprise)
- Links to Stripe product/price IDs
- Defines funnel limits per tier

**user_subscriptions**
- Tracks each user's subscription status
- References Stripe subscription and customer IDs
- Stores billing period dates and cancellation status

**whitelabel_config**
- Single-row table for deployment configuration
- Stores branding (logo URLs, colors, brand name)
- Stores landing page content (hero, features, testimonials, FAQ as JSONB)

**admin_users**
- Tracks which users have admin access
- Simple user_id reference with is_admin flag

### Stripe Integration Flow

1. **Checkout Flow**
   - User clicks upgrade button on pricing section or profile
   - Frontend calls `create-checkout-session` edge function
   - Edge function creates Stripe Checkout Session with success/cancel URLs
   - User redirected to Stripe hosted checkout page
   - On success, redirected back to app with session_id

2. **Webhook Processing**
   - Stripe sends events to `stripe-webhook` edge function
   - Handle: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`
   - Update `user_subscriptions` table based on events
   - On cancellation/refund: set status to revoke access

3. **Subscription Management**
   - Users can view current plan in Profile page
   - Use Stripe Customer Portal for cancellation (via `create-portal-session`)
   - No in-app cancellation form needed

### Admin Area Routes

- `/admin` - Dashboard overview (user count, subscription stats)
- `/admin/users` - User list with subscription status, search/filter
- `/admin/products` - Subscription tier management (edit prices, funnel limits)
- `/admin/subscriptions` - Subscription overview (active, canceled, past due)
- `/admin/settings` - Whitelabel configuration editor

### Funnel Limit Enforcement

- Query user's active subscription tier on Dashboard load
- Compare funnel count to tier's `max_funnels` limit
- Disable "New Funnel" button when limit reached
- Show upgrade prompt when limit reached

### Whitelabel Configuration System

Configuration loaded from:
1. Environment variables (for deployment-specific overrides)
2. `whitelabel_config` database table (for admin-editable content)

Environment variables take precedence for deployment secrets (Stripe keys) and basic branding. Database config used for content that admins can edit without redeployment.

## Security Considerations

### RLS Policies

- `subscription_tiers`: Public read, admin-only write
- `user_subscriptions`: Users can read own subscription, service role writes via webhooks
- `whitelabel_config`: Public read, admin-only write
- `admin_users`: Admin-only read/write

### Webhook Verification

- Verify Stripe webhook signature using `STRIPE_WEBHOOK_SECRET`
- Reject requests with invalid signatures
- Log all webhook events for debugging

### Admin Access

- Check `admin_users` table for admin status
- Protect all `/admin/*` routes with admin check
- Return 403 for non-admin users attempting admin actions

## UI/UX Specifications

### Profile Page Additions

- New "Subscription" card section showing:
  - Current plan name and price
  - Funnel usage (X of Y funnels used)
  - Billing period end date
  - "Manage Subscription" button (opens Stripe portal)
  - "Upgrade" button for Free tier users

### Dashboard Changes

- Show funnel count vs limit in header area
- When at limit: disable "New Funnel" button, show upgrade prompt
- Progress indicator for funnel usage

### Landing Page Dynamic Content

- Hero: headline, subheadline, badge text, CTA button text
- Features: array of feature objects (title, description, icon name)
- Testimonials: array of testimonial objects (quote, author, role, image)
- Pricing: display tiers from `subscription_tiers` table
- FAQ: array of question/answer pairs

### Admin Area Design

- Sidebar navigation matching app header style
- Card-based layouts for data display
- Tables for user/subscription lists with pagination
- Form-based editors for whitelabel config
- Toast notifications for save success/errors

## Environment Variables Needed

### Frontend (VITE_* prefix)

```
# Existing
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_URL

# New - Stripe
VITE_STRIPE_PUBLISHABLE_KEY

# New - Whitelabel Overrides (optional)
VITE_BRAND_NAME
VITE_BRAND_TAGLINE
VITE_PRIMARY_COLOR
VITE_LOGO_URL
VITE_LOGO_DARK_URL
VITE_FAVICON_URL
```

### Backend (Edge Functions)

```
# Existing
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ELASTIC_EMAIL_API_KEY

# New - Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

## File Structure for New Code

```
src/
  hooks/
    useSubscription.tsx      # Subscription context and hooks
    useWhitelabel.tsx        # Whitelabel config context
    useAdmin.tsx             # Admin status check hook
  pages/
    admin/
      AdminLayout.tsx        # Shared admin layout with sidebar
      AdminDashboard.tsx     # Admin home/overview
      AdminUsers.tsx         # User management
      AdminProducts.tsx      # Tier/pricing management
      AdminSubscriptions.tsx # Subscription list
      AdminSettings.tsx      # Whitelabel config editor
  components/
    subscription/
      SubscriptionCard.tsx   # Profile subscription display
      UpgradePrompt.tsx      # Upgrade CTA component
      FunnelUsage.tsx        # Usage indicator
    admin/
      UserTable.tsx          # User list table
      SubscriptionTable.tsx  # Subscription list table
      TierEditor.tsx         # Tier configuration form
      WhitelabelEditor.tsx   # Whitelabel config form
      AdminSidebar.tsx       # Admin navigation sidebar

supabase/
  functions/
    create-checkout-session/
      index.ts               # Create Stripe Checkout session
    create-portal-session/
      index.ts               # Create Stripe Customer Portal session
    stripe-webhook/
      index.ts               # Handle Stripe webhook events
  migrations/
    YYYYMMDD_subscription_tiers.sql
    YYYYMMDD_user_subscriptions.sql
    YYYYMMDD_whitelabel_config.sql
    YYYYMMDD_admin_users.sql
```

## Edge Cases and Error Handling

### Subscription Edge Cases

- User downgrades while over funnel limit: Allow existing funnels, prevent new creation
- Payment fails after initial subscription: Update status to `past_due`, show warning in app
- User deletes account with active subscription: Cancel Stripe subscription first
- Webhook arrives before checkout redirect: Handle gracefully, user sees updated status on return

### Whitelabel Edge Cases

- Missing logo URL: Fall back to default FunnelSim logo
- Invalid color value: Fall back to default indigo primary color
- Empty content arrays: Show sensible defaults
- Database config missing: Use environment variable values

### Admin Edge Cases

- Last admin tries to remove own admin status: Prevent action, show error
- Admin deletes tier with active subscribers: Prevent action, show count of affected users
- Concurrent config edits: Last write wins, show updated_at timestamp

### Error Handling Patterns

- Stripe API errors: Log error, show user-friendly message, retry webhook processing
- Database errors: Log error, show toast notification, prevent partial state
- Missing config: Graceful fallback to defaults, log warning

## Out of Scope

- Team features / multi-user accounts
- Usage-based billing
- Trial periods
- Coupon/discount system
- Invoice generation (handled by Stripe)
- Multi-tenant architecture (each brand is separate deployment)
- Stripe Elements embedded forms (using Checkout instead)
- Weekly or custom billing intervals
- Prorated upgrades/downgrades (Stripe handles automatically)

## Success Criteria

- Users can subscribe to Pro/Enterprise tiers via Stripe Checkout
- Funnel creation is blocked when user exceeds tier limit
- Subscription cancellation immediately revokes access to paid features
- Admins can view and manage all users and subscriptions
- Admins can configure whitelabel branding without code changes
- Landing page content is fully configurable via admin settings
- Standalone deployment works with new Stripe account and Supabase project

## Development Branch

All development for this feature should occur on a new git branch named `whitelabel`.
