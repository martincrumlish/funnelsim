# Task Breakdown: Stripe Integration & Whitelabel System

## Overview
Total Tasks: 8 Task Groups with approximately 60 sub-tasks

This task breakdown covers integrating Stripe Checkout for subscription-based access tiers (Free, Pro, Enterprise), building an admin area, and implementing a whitelabel configuration system for FunnelSim.

---

## Task List

### Phase 1: Project Setup

#### Task Group 1: Environment and Branch Setup
**Dependencies:** None

- [ ] 1.0 Complete project setup
  - [ ] 1.1 Create new git branch `whitelabel` from main
  - [ ] 1.2 Update `.env.example` with new environment variables
    - Add `VITE_STRIPE_PUBLISHABLE_KEY`
    - Add `VITE_BRAND_NAME`, `VITE_BRAND_TAGLINE`, `VITE_PRIMARY_COLOR`
    - Add `VITE_LOGO_URL`, `VITE_LOGO_DARK_URL`, `VITE_FAVICON_URL`
  - [ ] 1.3 Document Supabase Edge Function secrets needed
    - `STRIPE_SECRET_KEY`
    - `STRIPE_WEBHOOK_SECRET`
  - [ ] 1.4 Verify development environment runs correctly
    - Run `npm run dev` and confirm app loads

**Acceptance Criteria:**
- `whitelabel` branch exists and is checked out
- `.env.example` documents all new environment variables
- Development server starts without errors

---

### Phase 2: Database Layer

#### Task Group 2: Database Schema and Migrations
**Dependencies:** Task Group 1

- [ ] 2.0 Complete database schema
  - [ ] 2.1 Write 4-6 focused tests for database models
    - Test subscription tier retrieval
    - Test user subscription creation and status updates
    - Test whitelabel config single-row constraint
    - Test admin user lookup
  - [ ] 2.2 Create `subscription_tiers` migration
    - File: `supabase/migrations/YYYYMMDD_subscription_tiers.sql`
    - Fields: `id`, `name`, `stripe_product_id`, `stripe_price_id_monthly`, `stripe_price_id_yearly`, `price_monthly`, `price_yearly`, `max_funnels`, `features` (jsonb), `sort_order`, `is_active`, `created_at`, `updated_at`
    - Add indexes on `is_active`, `sort_order`
    - Seed Free, Pro, Enterprise tiers
  - [ ] 2.3 Create `user_subscriptions` migration
    - File: `supabase/migrations/YYYYMMDD_user_subscriptions.sql`
    - Fields: `id`, `user_id` (FK to auth.users), `tier_id` (FK to subscription_tiers), `stripe_subscription_id`, `stripe_customer_id`, `status`, `current_period_start`, `current_period_end`, `cancel_at_period_end`, `created_at`, `updated_at`
    - Add indexes on `user_id`, `stripe_subscription_id`, `status`
    - Add unique constraint on `user_id` (one subscription per user)
  - [ ] 2.4 Create `whitelabel_config` migration
    - File: `supabase/migrations/YYYYMMDD_whitelabel_config.sql`
    - Fields: `id`, `brand_name`, `tagline`, `primary_color`, `logo_light_url`, `logo_dark_url`, `favicon_url`, `hero_headline`, `hero_subheadline`, `hero_badge_text`, `cta_button_text`, `features` (jsonb), `testimonials` (jsonb), `faq` (jsonb), `footer_text`, `email_sender_name`, `updated_at`
    - Add single-row constraint via check constraint or trigger
    - Seed default FunnelSim branding values
  - [ ] 2.5 Create `admin_users` migration
    - File: `supabase/migrations/YYYYMMDD_admin_users.sql`
    - Fields: `id`, `user_id` (FK to auth.users), `is_admin`, `created_at`
    - Add unique constraint on `user_id`
  - [ ] 2.6 Create RLS policies for all new tables
    - `subscription_tiers`: Public read, admin-only write
    - `user_subscriptions`: Users read own, service role writes
    - `whitelabel_config`: Public read, admin-only write
    - `admin_users`: Admin-only read/write
  - [ ] 2.7 Update TypeScript types
    - File: `src/integrations/supabase/types.ts`
    - Add interfaces for all new tables
  - [ ] 2.8 Ensure database tests pass
    - Run only the 4-6 tests from 2.1
    - Verify migrations apply successfully

**Acceptance Criteria:**
- All 4 migrations created and apply without errors
- RLS policies enforce correct access patterns
- TypeScript types match database schema
- Database tests pass

---

### Phase 3: Stripe Edge Functions

#### Task Group 3: Stripe Integration Backend
**Dependencies:** Task Group 2

- [ ] 3.0 Complete Stripe edge functions
  - [ ] 3.1 Write 4-6 focused tests for edge functions
    - Test checkout session creation returns valid URL
    - Test portal session creation returns valid URL
    - Test webhook signature verification rejects invalid signatures
    - Test webhook updates subscription status correctly
  - [ ] 3.2 Create `create-checkout-session` edge function
    - File: `supabase/functions/create-checkout-session/index.ts`
    - Accept `price_id`, `user_id`, `user_email` parameters
    - Create Stripe Checkout Session with success/cancel URLs
    - Include `client_reference_id` for user identification
    - Return session URL for redirect
    - Follow pattern from `send-password-reset/index.ts`
  - [ ] 3.3 Create `create-portal-session` edge function
    - File: `supabase/functions/create-portal-session/index.ts`
    - Accept `customer_id` parameter
    - Create Stripe Customer Portal session
    - Return portal URL for redirect
  - [ ] 3.4 Create `stripe-webhook` edge function
    - File: `supabase/functions/stripe-webhook/index.ts`
    - Verify webhook signature using `STRIPE_WEBHOOK_SECRET`
    - Handle `checkout.session.completed`: Create/update user_subscriptions
    - Handle `customer.subscription.updated`: Update status, period dates
    - Handle `customer.subscription.deleted`: Set status to canceled
    - Handle `charge.refunded`: Revoke access (set status to refunded)
    - Log all events for debugging
    - Return 200 OK on success, 400 on verification failure
  - [ ] 3.5 Ensure Stripe edge function tests pass
    - Run only the 4-6 tests from 3.1
    - Verify functions deploy successfully

**Acceptance Criteria:**
- All 3 edge functions created and deploy
- Webhook signature verification works
- Subscription lifecycle events update database correctly
- Edge function tests pass

---

### Phase 4: Subscription Frontend

#### Task Group 4: Subscription Hooks and Components
**Dependencies:** Task Group 3

- [ ] 4.0 Complete subscription frontend
  - [ ] 4.1 Write 4-6 focused tests for subscription components
    - Test useSubscription hook returns correct tier data
    - Test SubscriptionCard displays plan info correctly
    - Test UpgradePrompt shows when at funnel limit
    - Test upgrade button initiates checkout flow
  - [ ] 4.2 Create `useSubscription` hook
    - File: `src/hooks/useSubscription.tsx`
    - Create SubscriptionContext and provider
    - Fetch user's subscription from `user_subscriptions` table
    - Fetch tier details from `subscription_tiers` table
    - Expose: `subscription`, `tier`, `isLoading`, `canCreateFunnel`, `funnelCount`, `funnelLimit`
    - Follow pattern from `useAuth.tsx`
  - [ ] 4.3 Create `SubscriptionCard` component
    - File: `src/components/subscription/SubscriptionCard.tsx`
    - Display current plan name and price
    - Display billing period end date
    - Display funnel usage (X of Y funnels used)
    - Show "Manage Subscription" button (for paid users)
    - Show "Upgrade" button (for free tier users)
    - Use shadcn/ui Card component
  - [ ] 4.4 Create `FunnelUsage` component
    - File: `src/components/subscription/FunnelUsage.tsx`
    - Progress bar showing funnel usage
    - Text: "X of Y funnels used"
    - Warning state when at 80%+ capacity
  - [ ] 4.5 Create `UpgradePrompt` component
    - File: `src/components/subscription/UpgradePrompt.tsx`
    - Display when user at funnel limit
    - Show tier comparison (current vs recommended)
    - "Upgrade Now" button triggers checkout
  - [ ] 4.6 Update Profile page with subscription section
    - File: `src/pages/Profile.tsx`
    - Add SubscriptionCard component
    - Add FunnelUsage component
    - Wire up "Manage Subscription" to Stripe Portal
    - Wire up "Upgrade" to checkout flow
  - [ ] 4.7 Ensure subscription component tests pass
    - Run only the 4-6 tests from 4.1

**Acceptance Criteria:**
- useSubscription hook provides subscription data
- Profile page shows subscription status
- Users can access Stripe Portal for management
- Users can initiate upgrade via checkout
- Subscription component tests pass

---

### Phase 5: Funnel Limit Enforcement

#### Task Group 5: Funnel Creation Limits
**Dependencies:** Task Group 4

- [ ] 5.0 Complete funnel limit enforcement
  - [ ] 5.1 Write 2-4 focused tests for limit enforcement
    - Test "New Funnel" button disabled at limit
    - Test upgrade prompt appears at limit
    - Test user below limit can create funnel
  - [ ] 5.2 Update Dashboard with limit enforcement
    - File: `src/pages/Dashboard.tsx`
    - Wrap with SubscriptionProvider (or access via existing provider)
    - Query funnel count for current user
    - Compare against tier's `max_funnels`
    - Disable "New Funnel" button when at limit
    - Show UpgradePrompt when at limit
  - [ ] 5.3 Add funnel usage indicator to Dashboard header
    - Show FunnelUsage component in header area
    - Visual indicator of remaining capacity
  - [ ] 5.4 Handle edge case: user over limit after downgrade
    - Allow viewing existing funnels
    - Only block new funnel creation
    - Show informative message about limit
  - [ ] 5.5 Ensure funnel limit tests pass
    - Run only the 2-4 tests from 5.1

**Acceptance Criteria:**
- Users cannot create funnels beyond their tier limit
- Clear visual feedback when at limit
- Upgrade path is obvious and accessible
- Existing funnels remain accessible after downgrade
- Funnel limit tests pass

---

### Phase 6: Admin Area

#### Task Group 6: Admin Dashboard and Management
**Dependencies:** Task Group 5

- [ ] 6.0 Complete admin area
  - [ ] 6.1 Write 4-6 focused tests for admin functionality
    - Test admin route protection (non-admins blocked)
    - Test user list displays correctly
    - Test tier editor saves changes
    - Test whitelabel editor saves changes
  - [ ] 6.2 Create `useAdmin` hook
    - File: `src/hooks/useAdmin.tsx`
    - Check `admin_users` table for current user
    - Expose: `isAdmin`, `isLoading`
  - [ ] 6.3 Create `AdminLayout` component
    - File: `src/pages/admin/AdminLayout.tsx`
    - Shared layout with sidebar navigation
    - Admin route protection (redirect non-admins)
    - Navigation: Dashboard, Users, Products, Subscriptions, Settings
  - [ ] 6.4 Create `AdminSidebar` component
    - File: `src/components/admin/AdminSidebar.tsx`
    - Navigation links to admin pages
    - Current page highlighting
    - Match app header styling
  - [ ] 6.5 Create `AdminDashboard` page
    - File: `src/pages/admin/AdminDashboard.tsx`
    - Overview cards: Total users, Active subscriptions, Revenue (from Stripe)
    - Quick links to management sections
    - Recent subscription activity
  - [ ] 6.6 Create `AdminUsers` page
    - File: `src/pages/admin/AdminUsers.tsx`
    - User list table with pagination
    - Show: email, subscription tier, status, funnel count
    - Search/filter functionality
    - Admin status toggle
  - [ ] 6.7 Create `UserTable` component
    - File: `src/components/admin/UserTable.tsx`
    - Reusable table for user listings
    - Sortable columns
    - Action buttons per row
  - [ ] 6.8 Create `AdminProducts` page
    - File: `src/pages/admin/AdminProducts.tsx`
    - List subscription tiers
    - Edit tier properties (name, prices, funnel limits)
    - Prevent deletion of tiers with active subscribers
  - [ ] 6.9 Create `TierEditor` component
    - File: `src/components/admin/TierEditor.tsx`
    - Form for editing tier properties
    - Validation for required fields
    - Save/Cancel buttons
  - [ ] 6.10 Create `AdminSubscriptions` page
    - File: `src/pages/admin/AdminSubscriptions.tsx`
    - List all subscriptions with status
    - Filter by status (active, canceled, past_due)
    - Show subscription details
  - [ ] 6.11 Create `SubscriptionTable` component
    - File: `src/components/admin/SubscriptionTable.tsx`
    - Reusable table for subscription listings
    - Status badges (color-coded)
    - Link to Stripe dashboard
  - [ ] 6.12 Add admin routes to App router
    - File: `src/App.tsx`
    - Add routes: `/admin`, `/admin/users`, `/admin/products`, `/admin/subscriptions`, `/admin/settings`
    - Wrap with AdminLayout
  - [ ] 6.13 Ensure admin area tests pass
    - Run only the 4-6 tests from 6.1

**Acceptance Criteria:**
- Admin routes protected from non-admin users
- Admin can view and manage users
- Admin can edit subscription tiers
- Admin can view all subscriptions
- Admin area tests pass

---

### Phase 7: Whitelabel System

#### Task Group 7: Whitelabel Configuration
**Dependencies:** Task Group 6

- [ ] 7.0 Complete whitelabel system
  - [ ] 7.1 Write 4-6 focused tests for whitelabel functionality
    - Test useWhitelabel hook loads config correctly
    - Test environment variables override database values
    - Test landing page renders dynamic content
    - Test admin editor saves whitelabel config
  - [ ] 7.2 Create `useWhitelabel` hook
    - File: `src/hooks/useWhitelabel.tsx`
    - Create WhitelabelContext and provider
    - Load config from `whitelabel_config` table
    - Merge with environment variable overrides
    - Env vars take precedence for: logo URLs, brand name, colors
    - Expose: `config`, `isLoading`
  - [ ] 7.3 Create `AdminSettings` page
    - File: `src/pages/admin/AdminSettings.tsx`
    - Whitelabel configuration form
    - Sections: Branding, Hero, Features, Testimonials, FAQ
    - Preview capabilities where feasible
  - [ ] 7.4 Create `WhitelabelEditor` component
    - File: `src/components/admin/WhitelabelEditor.tsx`
    - Tabbed interface for different content sections
    - JSON editor for complex fields (features, testimonials, FAQ)
    - Image URL inputs with preview
    - Color picker for primary color
  - [ ] 7.5 Update `Navbar.tsx` for dynamic logo
    - File: `src/components/landing/Navbar.tsx`
    - Use `useWhitelabel` hook for logo URLs
    - Fallback to default FunnelSim logo
  - [ ] 7.6 Update `Hero.tsx` for dynamic content
    - File: `src/components/landing/Hero.tsx`
    - Use `useWhitelabel` hook for headline, subheadline, badge text
    - Dynamic CTA button text
  - [ ] 7.7 Update `Features.tsx` for dynamic content
    - File: `src/components/landing/Features.tsx`
    - Use `useWhitelabel` hook for features array
    - Fallback to default features if not configured
  - [ ] 7.8 Update `Testimonials.tsx` for dynamic content
    - File: `src/components/landing/Testimonials.tsx`
    - Use `useWhitelabel` hook for testimonials array
    - Make pricing section dynamic from `subscription_tiers`
  - [ ] 7.9 Update `FAQ.tsx` for dynamic content
    - File: `src/components/landing/FAQ.tsx`
    - Use `useWhitelabel` hook for FAQ array
    - Fallback to default FAQ if not configured
  - [ ] 7.10 Update `Footer.tsx` for dynamic branding
    - File: `src/components/landing/Footer.tsx`
    - Use `useWhitelabel` hook for brand name, footer text
  - [ ] 7.11 Wrap landing page with WhitelabelProvider
    - File: `src/pages/Landing.tsx` or `src/App.tsx`
    - Ensure all landing components have access to whitelabel context
  - [ ] 7.12 Ensure whitelabel tests pass
    - Run only the 4-6 tests from 7.1

**Acceptance Criteria:**
- Whitelabel config loads from database and env vars
- Landing page content is fully dynamic
- Admin can edit all whitelabel settings
- Fallbacks work when config is missing
- Whitelabel tests pass

---

### Phase 8: Testing & Polish

#### Task Group 8: Test Review and Integration Testing
**Dependencies:** Task Groups 1-7

- [ ] 8.0 Review existing tests and fill critical gaps
  - [ ] 8.1 Review tests from Task Groups 2-7
    - Review 4-6 database tests (Task 2.1)
    - Review 4-6 edge function tests (Task 3.1)
    - Review 4-6 subscription component tests (Task 4.1)
    - Review 2-4 funnel limit tests (Task 5.1)
    - Review 4-6 admin area tests (Task 6.1)
    - Review 4-6 whitelabel tests (Task 7.1)
    - Total existing tests: approximately 24-34 tests
  - [ ] 8.2 Analyze test coverage gaps for this feature only
    - Identify critical user workflows lacking coverage
    - Focus on end-to-end subscription flow
    - Focus on admin management workflows
    - Focus on whitelabel configuration flow
  - [ ] 8.3 Write up to 10 additional strategic tests maximum
    - End-to-end: User completes checkout and gains access
    - End-to-end: User cancels subscription and loses access
    - End-to-end: Webhook processes subscription update
    - Integration: Admin creates tier, user sees in pricing
    - Integration: Admin updates whitelabel, landing page reflects
    - Error handling: Invalid webhook signature rejected
    - Error handling: Checkout session creation failure
    - Edge case: User at limit sees upgrade prompt
  - [ ] 8.4 Run feature-specific tests only
    - Run all tests from 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, and 8.3
    - Expected total: approximately 34-44 tests
    - Do NOT run entire application test suite
    - Verify all critical workflows pass
  - [ ] 8.5 Manual testing checklist
    - [ ] Free user signup flow
    - [ ] Upgrade from Free to Pro via Stripe Checkout
    - [ ] View subscription in Profile
    - [ ] Access Stripe Customer Portal
    - [ ] Cancel subscription and verify access revoked
    - [ ] Admin login and dashboard access
    - [ ] Admin user management
    - [ ] Admin tier editing
    - [ ] Admin whitelabel configuration
    - [ ] Landing page reflects whitelabel config
    - [ ] Funnel limit enforcement
  - [ ] 8.6 Fix any critical bugs found during testing
  - [ ] 8.7 Code cleanup and documentation
    - Remove any console.log statements
    - Add JSDoc comments to public functions
    - Update CLAUDE.md with new routes and features

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 34-44 tests)
- Manual testing checklist completed
- No critical bugs remaining
- Code is clean and documented

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: Project Setup** - Create branch, configure environment
2. **Task Group 2: Database Schema** - Foundation for all other work
3. **Task Group 3: Stripe Edge Functions** - Backend payment processing
4. **Task Group 4: Subscription Frontend** - User-facing subscription features
5. **Task Group 5: Funnel Limit Enforcement** - Core business logic
6. **Task Group 6: Admin Area** - Management interface
7. **Task Group 7: Whitelabel System** - Customization capabilities
8. **Task Group 8: Testing & Polish** - Quality assurance

---

## Specialist Assignments (Suggested)

| Task Group | Primary Specialist | Skills Required |
|------------|-------------------|-----------------|
| 1 | Any | Git, Environment setup |
| 2 | Database Engineer | SQL, Supabase, RLS policies |
| 3 | Backend Engineer | Deno, Stripe API, Edge Functions |
| 4 | Frontend Engineer | React, TypeScript, shadcn/ui |
| 5 | Frontend Engineer | React, State management |
| 6 | Full Stack Engineer | React, Supabase, Admin UI |
| 7 | Full Stack Engineer | React, Context API, Dynamic content |
| 8 | QA Engineer | Testing, Integration verification |

---

## Files Created/Modified Summary

### New Files (approximately 25 files)

**Migrations:**
- `supabase/migrations/YYYYMMDD_subscription_tiers.sql`
- `supabase/migrations/YYYYMMDD_user_subscriptions.sql`
- `supabase/migrations/YYYYMMDD_whitelabel_config.sql`
- `supabase/migrations/YYYYMMDD_admin_users.sql`

**Edge Functions:**
- `supabase/functions/create-checkout-session/index.ts`
- `supabase/functions/create-portal-session/index.ts`
- `supabase/functions/stripe-webhook/index.ts`

**Hooks:**
- `src/hooks/useSubscription.tsx`
- `src/hooks/useWhitelabel.tsx`
- `src/hooks/useAdmin.tsx`

**Subscription Components:**
- `src/components/subscription/SubscriptionCard.tsx`
- `src/components/subscription/UpgradePrompt.tsx`
- `src/components/subscription/FunnelUsage.tsx`

**Admin Pages:**
- `src/pages/admin/AdminLayout.tsx`
- `src/pages/admin/AdminDashboard.tsx`
- `src/pages/admin/AdminUsers.tsx`
- `src/pages/admin/AdminProducts.tsx`
- `src/pages/admin/AdminSubscriptions.tsx`
- `src/pages/admin/AdminSettings.tsx`

**Admin Components:**
- `src/components/admin/AdminSidebar.tsx`
- `src/components/admin/UserTable.tsx`
- `src/components/admin/SubscriptionTable.tsx`
- `src/components/admin/TierEditor.tsx`
- `src/components/admin/WhitelabelEditor.tsx`

### Modified Files (approximately 10 files)

- `src/integrations/supabase/types.ts` - Add new table types
- `src/pages/Profile.tsx` - Add subscription section
- `src/pages/Dashboard.tsx` - Add funnel limit enforcement
- `src/components/landing/Navbar.tsx` - Dynamic logo
- `src/components/landing/Hero.tsx` - Dynamic content
- `src/components/landing/Features.tsx` - Dynamic content
- `src/components/landing/Testimonials.tsx` - Dynamic content + pricing
- `src/components/landing/FAQ.tsx` - Dynamic content
- `src/components/landing/Footer.tsx` - Dynamic branding
- `src/App.tsx` - Add admin routes
- `.env.example` - New environment variables
- `CLAUDE.md` - Document new features

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Stripe webhook timing issues | Implement idempotency, handle out-of-order events |
| RLS policy conflicts | Test each policy individually before combining |
| Whitelabel config missing | Always provide sensible defaults |
| Admin lockout | Prevent last admin from removing own status |
| Migration failures | Test migrations on staging before production |

---

## Definition of Done

A task group is complete when:
- All sub-tasks are checked off
- Acceptance criteria are met
- Tests from that task group pass
- Code follows existing patterns and standards
- No TypeScript errors or lint warnings
