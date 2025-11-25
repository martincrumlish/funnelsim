# Spec Requirements: Stripe Integration & Whitelabel

## Initial Description

Adding Stripe integration to FunnelSim app with the following goals:
- Integrate Stripe for payments
- Allow users to create products with one-time price, free, or subscription pricing
- Easy product configuration
- Admin area for management
- Prepare the app as a whitelabel product that end users can rebrand, install on their own hosting, and sell access to
- Uses Supabase as the backend

## Requirements Discussion

### First Round Questions

**Q1:** Payment flow - Should we use Stripe Checkout (redirect to hosted payment page) or Stripe Elements (embedded forms)?
**Answer:** Use Stripe Checkout (redirect to hosted payment page)

**Q2:** Billing intervals - What subscription intervals are needed (monthly/yearly, weekly, custom)?
**Answer:** Monthly/yearly is fine

**Q3:** Products - Are these products for the FunnelSim app itself (access tiers like Free, Pro, Enterprise) or products that FunnelSim users create to sell?
**Answer:** These are access tiers for FunnelSim itself (Free, Pro, Enterprise plans)

**Q4:** Admin area - What admin capabilities are needed (user management, product/pricing management, subscription/payment history, whitelabel config)?
**Answer:** Yes to all (user management, product/pricing management, subscription/payment history, whitelabel config) - using Supabase for users and auth

**Q5:** Whitelabel customization - What elements should be customizable (logo, favicon, brand name, tagline, colors, email branding, landing page content)?
**Answer:** Yes to all (logo, favicon, brand name, tagline, colors, email branding, AND landing page content)

**Q6:** Deployment model - Is this a multi-tenant SaaS (one deployment, many brands) or standalone deployable app (each brand gets their own instance)?
**Answer:** Standalone deployable app with own Stripe account, own Supabase project, env vars for configuration

**Q7:** Free tier limits - Should free tier have usage limits (number of funnels, etc.)?
**Answer:** Products/tiers can have number of funnels as the limiting criteria

**Q8:** Exclusions - What should NOT be included (team features, usage-based billing, trials, coupons, invoices)?
**Answer:** No team features, no usage-based billing, no trials, no coupons, no invoices (all handled by Stripe). Refund or subscription cancellation should revoke app access

### Additional Information

**Development Branch:** Development should happen on a new git branch called "whitelabel"

### Existing Code to Reference

Based on codebase exploration, the following existing patterns should be referenced:

**Similar Features Identified:**
- Feature: Auth Flow - Path: `D:/dev/funnelsim/src/hooks/useAuth.tsx`
- Feature: Profile Management - Path: `D:/dev/funnelsim/src/pages/Profile.tsx`
- Feature: Dashboard Layout - Path: `D:/dev/funnelsim/src/pages/Dashboard.tsx`
- Feature: Landing Page Components - Path: `D:/dev/funnelsim/src/components/landing/`
- Feature: Supabase Edge Functions - Path: `D:/dev/funnelsim/supabase/functions/`
- Feature: Database Migrations - Path: `D:/dev/funnelsim/supabase/migrations/`
- Feature: Supabase Client - Path: `D:/dev/funnelsim/src/integrations/supabase/client.ts`
- Feature: Supabase Types - Path: `D:/dev/funnelsim/src/integrations/supabase/types.ts`

### Follow-up Questions

No follow-up questions needed - the initial answers were comprehensive.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A

## Codebase Analysis Findings

### Current Database Schema

**Tables:**
1. `profiles` - User profiles linked to auth.users
   - id (uuid, PK, references auth.users)
   - email (text)
   - created_at, updated_at (timestamps)

2. `funnels` - User's funnel data
   - id (uuid, PK)
   - user_id (uuid, FK to auth.users)
   - name (text)
   - nodes, edges, traffic_sources (jsonb)
   - logo_url (text, nullable)
   - created_at, updated_at (timestamps)

3. `password_reset_tokens` - Custom password reset flow
   - id (uuid, PK)
   - user_id (uuid)
   - token (text, unique)
   - expires_at (timestamp)
   - used (boolean)
   - created_at (timestamp)

**RLS Policies:**
- profiles: Users can view/update own profile
- funnels: Users can CRUD own funnels
- password_reset_tokens: Service role only (no public policies)

**Storage:**
- `funnel-logos` bucket (public) with RLS policies for user-scoped uploads

### Current Authentication Flow
- Supabase Auth with email/password
- AuthContext provider in `useAuth.tsx`
- Custom password reset via Edge Functions (using Elastic Email)
- Protected routes redirect to `/auth` if not authenticated

### Current Routing Structure
- `/` - Landing page (public)
- `/auth` - Sign in/sign up (public)
- `/dashboard` - Funnel list (protected)
- `/funnel/:id` - Funnel builder (protected)
- `/profile` - User profile (protected)
- `/reset-password` - Password reset flow

### Current Landing Page Structure
Components in `src/components/landing/`:
- `Navbar.tsx` - Navigation with logo, links, Sign In/Get Started buttons
- `Hero.tsx` - Main hero section with headline, subheadline, CTA buttons, app screenshot
- `Features.tsx` - Feature grid (6 features)
- `ProductShowcase.tsx` - Product demonstration
- `Comparison.tsx` - Spreadsheet vs FunnelSim comparison
- `Testimonials.tsx` - Testimonials + Pricing section (contains hardcoded plans)
- `FAQ.tsx` - Frequently asked questions
- `CTA.tsx` - Final call to action
- `Footer.tsx` - Footer with logo and copyright

**Current Hardcoded Pricing (in Testimonials.tsx):**
- Starter: $0/month - 3 Active Funnels, Basic Analytics, Export to PNG, Standard Nodes
- Pro: $29/month - Unlimited Funnels, Advanced ROI Calculation, Team Sharing, Prioritized Support, White-label Exports

### UI Component Patterns
- shadcn/ui components in `src/components/ui/`
- Custom landing page button in `src/components/landing/ui/Button.tsx`
- Theme system with light/dark mode (next-themes)
- CSS variables for colors in `src/index.css`
- Tailwind config with custom dark colors (`dark-900`, `dark-800`, `dark-700`)

### Assets
- Logo: `src/assets/logo.png` (light mode)
- Logo Dark: `src/assets/logo-dark.png` (dark mode)
- Hero image: `src/assets/hero-funnel.jpg`
- Public images: `public/images/screens1.png`

### Environment Variables (Current)
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

### Edge Functions (Current)
- `send-password-reset` - Sends password reset email via Elastic Email
- `reset-password-with-token` - Validates token and updates password

## Requirements Summary

### Functional Requirements

**Stripe Integration:**
- Integrate Stripe Checkout for payment processing
- Support Free, Pro, and Enterprise subscription tiers
- Monthly and yearly billing intervals
- Webhook handling for subscription lifecycle events (created, updated, canceled, payment_failed)
- Subscription cancellation should immediately revoke app access
- Refund processing should revoke app access

**Subscription Tiers:**
- Each tier defines a maximum number of funnels
- Enforce funnel limits based on active subscription
- Display current plan and usage in user dashboard/profile

**Admin Area:**
- User management (view users, view subscription status)
- Product/pricing management (define tiers, set prices, set funnel limits)
- Subscription/payment history viewing
- Whitelabel configuration management

**Whitelabel System:**
- Configurable via environment variables for standalone deployments
- Each deployment uses its own Stripe account
- Each deployment uses its own Supabase project

**Whitelabel Customizable Elements:**
- Logo (light and dark versions)
- Favicon
- Brand name
- Tagline
- Primary colors/color scheme
- Email branding (sender name, email templates)
- Landing page content:
  - Hero headline and subheadline
  - Feature descriptions
  - Testimonials
  - Pricing plans display
  - FAQ content
  - CTA text
  - Footer content

### Database Schema Additions Needed

**New Tables:**
1. `subscription_tiers` - Define available subscription plans
   - id, name, stripe_product_id, stripe_price_id_monthly, stripe_price_id_yearly
   - max_funnels, features (jsonb), sort_order, is_active

2. `user_subscriptions` - Track user subscription status
   - id, user_id, tier_id, stripe_subscription_id, stripe_customer_id
   - status (active, canceled, past_due, etc.)
   - current_period_start, current_period_end
   - cancel_at_period_end

3. `whitelabel_config` - Store whitelabel settings (single row table)
   - brand_name, tagline, primary_color, logo_light_url, logo_dark_url, favicon_url
   - hero_headline, hero_subheadline, features (jsonb), testimonials (jsonb)
   - faq (jsonb), cta_text, footer_text, email_sender_name

4. `payment_history` - For admin viewing (optional, may use Stripe directly)
   - id, user_id, stripe_invoice_id, amount, currency, status, created_at

### Environment Variables Needed (New)

**Stripe:**
- `VITE_STRIPE_PUBLISHABLE_KEY` - For frontend
- `STRIPE_SECRET_KEY` - For backend/edge functions
- `STRIPE_WEBHOOK_SECRET` - For webhook validation

**Whitelabel (alternatives to database config):**
- `VITE_BRAND_NAME`
- `VITE_BRAND_TAGLINE`
- `VITE_PRIMARY_COLOR`
- `VITE_LOGO_URL`
- `VITE_LOGO_DARK_URL`
- `VITE_FAVICON_URL`

### Reusability Opportunities

**Existing Components to Extend:**
- `useAuth.tsx` - Add subscription status to auth context
- `Profile.tsx` - Add subscription management section
- `Dashboard.tsx` - Add funnel count limit enforcement
- `Testimonials.tsx` - Make pricing section dynamic from config

**Existing Patterns to Follow:**
- Edge function structure from password reset functions
- Database migration format
- RLS policy patterns
- Toast notification patterns
- Card-based UI layout from Dashboard/Profile

**New Admin Routes Needed:**
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/products` - Product/tier management
- `/admin/subscriptions` - Subscription overview
- `/admin/settings` - Whitelabel configuration

### Scope Boundaries

**In Scope:**
- Stripe Checkout integration for subscriptions
- Free/Pro/Enterprise tier system with funnel limits
- Admin area for user, product, subscription, and whitelabel management
- Whitelabel configuration (logo, colors, brand name, landing page content)
- Subscription lifecycle management (create, cancel, refund = revoke access)
- Webhook handling for Stripe events
- Environment variable based configuration for standalone deployments

**Out of Scope:**
- Team features / multi-user accounts
- Usage-based billing
- Trial periods
- Coupon/discount system
- Invoice generation (handled by Stripe)
- Multi-tenant architecture (each brand is separate deployment)
- Stripe Elements embedded forms (using Checkout instead)
- Weekly or custom billing intervals

### Technical Considerations

**Integration Points:**
- Stripe API for payment processing
- Stripe Webhooks for event handling
- Supabase Edge Functions for server-side Stripe operations
- Supabase RLS for subscription-aware data access

**Existing System Constraints:**
- Must maintain backward compatibility with existing users/funnels
- Must work with existing Supabase Auth flow
- Must maintain existing light/dark theme system
- Landing page has separate styling system (dark-900 colors)

**Technology Preferences:**
- Continue using Supabase Edge Functions (Deno runtime)
- Use existing shadcn/ui component library
- Use existing Tailwind CSS configuration
- Use React Query for data fetching

**Similar Code Patterns to Follow:**
- Auth context pattern from `useAuth.tsx`
- Form patterns from `Auth.tsx` and `Profile.tsx`
- Card layouts from `Dashboard.tsx`
- Edge function patterns from `send-password-reset`
- Migration patterns from existing migrations

### Development Branch
All development should occur on a new git branch named `whitelabel`
