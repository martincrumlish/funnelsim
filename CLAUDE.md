# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FunnelSim is a visual sales funnel modeling tool for marketers. Users design multi-step funnels with drag-and-drop nodes (ReactFlow), input traffic sources and costs, and see real-time revenue/profit calculations. The app features a public landing page, protected dashboard for authenticated users, an admin area, subscription-based access tiers with Stripe integration, and PDF/PNG export capabilities. Supports one-click deployment to Vercel/Netlify with a guided setup wizard.

## Development Commands

```bash
# Development
npm run dev          # Start dev server on port 8080 (or 8081 if 8080 in use)

# Building
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint

# Testing
npm run test:run     # Run all tests once
npm run test:run -- src/__tests__/<file>.test.tsx  # Run specific test file
```

## Architecture

### Frontend Structure

**Three distinct sections:**
1. **Landing Page** (`/` route) - Marketing site with dark theme, custom animations
   - Components in `src/components/landing/`
   - Custom Button component at `src/components/landing/ui/Button.tsx`
   - Uses hardcoded dark colors (`dark-900: #0a0a0f`)
   - Custom CSS animations in `src/index.css` (`.animate-float`, `.gradient-text`, `.bg-grid`)
   - Dynamic content via whitelabel configuration

2. **App** (`/dashboard`, `/funnel/:id` routes) - Main application
   - Uses shadcn/ui components from `src/components/ui/`
   - Theme-aware with light/dark mode toggle
   - Uses CSS variables for colors (`bg-background`, `text-foreground`)
   - Subscription-based funnel limits

3. **Admin Area** (`/admin/*` routes) - Management interface
   - Protected by admin role check
   - Uses `useAdmin` hook for access control
   - Shared layout with sidebar navigation

**Routing:**
- `/` → Landing page (public)
- `/auth` → Sign in/sign up (public)
- `/setup` → Setup wizard for new deployments (public, standalone)
- `/checkout/success` → Post-checkout flow for guest/lifetime purchases (public)
- `/dashboard` → Funnel list (protected, respects subscription limits)
- `/funnel/:id` → Funnel builder (protected)
- `/profile` → User profile with subscription management (protected)
- `/reset-password` → Password reset flow
- `/admin` → Admin dashboard (admin-only)
- `/admin/users` → User management (admin-only)
- `/admin/products` → Subscription tier management (admin-only)
- `/admin/subscriptions` → Subscription overview (admin-only)
- `/admin/settings` → Whitelabel configuration (admin-only)

### Subscription System

**Tier Structure:**
- `Free` - 3 funnels, no payment required
- `Pro` - 25 funnels, monthly/yearly billing
- `Enterprise` - Unlimited funnels (-1), monthly/yearly billing

**Key Hooks:**
- `src/hooks/useSubscription.tsx` - Subscription context providing:
  - `subscription`, `tier` - Current subscription data
  - `canCreateFunnel` - Whether user can create new funnels
  - `funnelCount`, `funnelLimit` - Usage tracking
  - `isUnlimited`, `isOverLimit` - Limit state flags
  - `initiateCheckout(priceId)` - Start Stripe Checkout
  - `openCustomerPortal()` - Open Stripe Customer Portal

**Subscription Components:**
- `src/components/subscription/SubscriptionCard.tsx` - Profile subscription display
- `src/components/subscription/FunnelUsage.tsx` - Progress bar indicator
- `src/components/subscription/UpgradePrompt.tsx` - Limit reached prompt

### Whitelabel System

**Configuration Sources (in order of precedence):**
1. Environment variables (`VITE_BRAND_NAME`, `VITE_LOGO_URL`, etc.)
2. Database table `whitelabel_config` (single-row)
3. Default FunnelSim branding

**Key Hook:**
- `src/hooks/useWhitelabel.tsx` - Whitelabel context providing:
  - `config` - Merged configuration object (includes `hero_video_embed` for landing video)
  - `isLoading` - Loading state
  - `refreshConfig()` - Reload configuration

**Configurable Fields:**
- Brand name, tagline, colors, logos
- Hero headline, subheadline, badge text
- `hero_video_embed` - Embeddable video code for landing hero section
- CTA button text, footer text
- Features, testimonials, FAQ arrays

**Default Content Exports:**
- `DEFAULT_FEATURES` - Landing page features array
- `DEFAULT_TESTIMONIALS` - Landing page testimonials
- `DEFAULT_FAQ` - Landing page FAQ items

### Funnel Builder Architecture

**Core concept:** Visual node-based funnel with traffic flow and revenue calculations.

**Node Types:**
- `frontend` - First offer (primary color)
- `oto` - One-Time Offer upsell (green)
- `downsell` - Downgrade offer (orange)

**Node Handles:**
- `yes` - Buyer path (when user converts)
- `no` - Non-buyer path (when user declines)

**Traffic Flow Logic:**
- Traffic enters at frontend node
- At each node, traffic splits based on conversion rate
- `conversion * traffic` flows to "yes" path
- `(1 - conversion) * traffic` flows to "no" path
- Revenue = `buyers * price` at each node

**Key Files:**
- `src/lib/funnelCalculations.ts` - Revenue calculation logic (recursive node processing)
- `src/components/FunnelCanvas.tsx` - Main ReactFlow canvas wrapper (includes export functions)
- `src/components/FunnelNode.tsx` - Custom node component
- `src/components/FunnelMetricsTable.tsx` - Metrics display
- `src/components/TrafficInput.tsx` - Traffic source management
- `src/components/ExportMenu.tsx` - Export dropdown (PNG/PDF options)

**Export Functionality:**
- `exportToPNG()` - Exports funnel as high-res PNG image with logo
- `exportToPDF()` - Exports funnel as PDF document with logo
- Uses `html-to-image` and `jspdf` libraries
- Logo from whitelabel config included in exports

### State Management

**ReactFlow State:**
- `useNodesState` - Node positions and data
- `useEdgesState` - Connections between nodes
- Auto-save on changes (debounced)

**Authentication:**
- `src/hooks/useAuth.tsx` - AuthContext provider
- Wraps Supabase auth with React context
- Provides `signIn`, `signUp`, `signOut`, `user`, `session`

**Admin Access:**
- `src/hooks/useAdmin.tsx` - Admin status check
- Queries `admin_users` table
- Provides `isAdmin`, `isLoading`, `refreshAdminStatus`

**Data Fetching:**
- Tanstack Query for data fetching/caching
- Direct Supabase client calls in components

### Backend (Supabase)

**Database Tables:**
- `funnels` - Stores funnel data (nodes, edges, traffic_sources as JSONB)
- `profiles` - User profiles (links to auth.users)
- `password_reset_tokens` - Custom password reset flow
- `subscription_tiers` - Available plans (Free, Pro, Enterprise)
- `user_subscriptions` - User subscription status and Stripe IDs
- `whitelabel_config` - Single-row branding configuration
- `admin_users` - Admin role assignments

**Storage:**
- `funnel-logos` bucket - Public bucket for logo uploads

**Edge Functions:**
- `send-password-reset` - Generates reset token and sends email
- `reset-password-with-token` - Validates token and updates password
- `create-checkout-session` - Creates Stripe Checkout session
- `create-portal-session` - Creates Stripe Customer Portal session
- `stripe-webhook` - Handles Stripe webhook events
- `admin-create-user` - Admin API for creating users
- `admin-delete-user` - Admin API for deleting users
- `admin-reset-password` - Admin API for resetting user passwords
- `retrieve-checkout-session` - Retrieves Stripe checkout session data
- `link-pending-subscription` - Links pending subscriptions to users (guest checkout)

All deployed to: `https://lntraljilztlwwsggtfa.supabase.co/functions/v1/`

**Current Supabase Project:**
- Project ID: `lntraljilztlwwsggtfa`
- Region: `us-east-1`
- URL: `https://lntraljilztlwwsggtfa.supabase.co`

### Styling System

**Global Styles:**
- `src/index.css` - All CSS (shadcn theme + landing page utilities)
- Imported once in `src/main.tsx`

**Two CSS Systems Coexist:**
1. **App Theme** (lines 9-109 in index.css)
   - CSS variables for light/dark mode
   - Used by: Dashboard, Auth, FunnelBuilder, Admin

2. **Landing Theme** (lines 111-162 in index.css)
   - Custom utility classes
   - Fixed dark colors
   - Custom keyframe animations

**Tailwind Config:**
- Custom colors: `dark-900`, `dark-800`, `dark-700`
- Font families: `sans` (Inter), `display` (Cal Sans)

## Important Patterns

### Funnel Auto-Save

Funnels auto-save to Supabase when nodes/edges/traffic change:
```typescript
// In FunnelCanvas.tsx
const saveFunnel = async () => {
  await supabase.from('funnels').update({
    nodes: nodes,
    edges: edges,
    traffic_sources: trafficSources
  }).eq('id', funnelId);
};
```

### Revenue Calculation

The core calculation in `funnelCalculations.ts` uses recursive tree traversal:
1. Start at frontend node with total traffic
2. Calculate buyers at current node (`traffic * conversion`)
3. Pass buyers to "yes" edge, non-buyers to "no" edge
4. Recurse through all connected nodes
5. Sum all revenue, subtract traffic costs

### Authentication Flow

1. User signs up/in → Supabase Auth creates session
2. `AuthContext` stores user/session in React context
3. Protected routes check `user` from context
4. RLS policies filter data by `auth.uid()`
5. Free subscription auto-created for new users via DB trigger

### Subscription Flow

**Logged-in User Upgrade:**
1. User views pricing on landing page or profile
2. Clicks upgrade → `initiateCheckout(priceId)` called
3. Redirects to Stripe Checkout hosted page
4. On success, redirects back with `?checkout=success`
5. Webhook updates `user_subscriptions` table
6. User gains access to higher tier limits

**Guest/Lifetime Purchase (no account required):**
1. Visitor clicks pricing on landing page
2. Redirects to Stripe Checkout (no auth required)
3. On success, redirects to `/checkout/success?session_id=xxx`
4. `CheckoutSuccess` page prompts for password to create account
5. `link-pending-subscription` edge function links purchase to new user
6. User can sign in with new account

**Direct Registration URL (for non-Stripe countries):**
1. Admin sets a secret `registration_token` on a tier via Admin → Products → Edit
2. Admin shares URL: `https://yourapp.com/auth?token=SECRET_TOKEN`
3. Customer pays via PayPal/bank transfer, receives URL as "thank you" page
4. Customer signs up using the URL → automatically gets that tier
5. Invalid/shared tokens silently fall back to Free tier (no error shown)
6. Admin can rotate token anytime if compromised

### Password Reset Flow

Custom implementation (not using Supabase's built-in):
1. User requests reset → `send-password-reset` edge function
2. Function generates token, stores in DB, sends email
3. User clicks link → redirects to `/reset-password?token=xxx`
4. Frontend calls `reset-password-with-token` edge function
5. Function validates token, updates password

## Working with Migrations

Migrations are in `supabase/migrations/`. To apply:

```bash
# Using Supabase MCP (if available)
# Create migration
mcp__supabase__apply_migration --name "description" --query "SQL here"

# List migrations
mcp__supabase__list_migrations --project_id "lntraljilztlwwsggtfa"
```

**Stripe Integration Migrations:**
- `20251125000001_subscription_tiers.sql` - Tier definitions
- `20251125000002_user_subscriptions.sql` - User subscriptions
- `20251125000003_whitelabel_config.sql` - Branding config
- `20251125000004_admin_users.sql` - Admin roles
- `20251125000005_rls_policies.sql` - Row Level Security

## Common Issues

**Import Paths:** Always use `@/` alias for imports from `src/`:
```typescript
import { cn } from '@/lib/utils';  // Correct
import { cn } from '../../lib/utils';  // Wrong (breaks Vite)
```

**Button Components:** Two different Button components exist:
- `src/components/ui/button.tsx` - shadcn/ui button (for app)
- `src/components/landing/ui/Button.tsx` - Custom landing button (for landing page)

**Theme Context:** Landing page ignores ThemeProvider. It always renders dark.

**RLS Policies:** All database operations respect RLS. Users can only access their own data via `auth.uid() = user_id` policies.

**Subscription Context:** Must wrap components with `SubscriptionProvider` to use `useSubscription` hook.

**Whitelabel Context:** Must wrap components with `WhitelabelProvider` to use `useWhitelabel` hook.

## File Structure Notes

**Removed files:**
- `src/pages/Index.tsx` - Deleted (replaced by Landing.tsx)
- `bun.lockb` - Deleted (project uses npm, not bun)

**Important directories:**
- `src/components/landing/` - Landing page components (isolated from app)
- `src/components/ui/` - shadcn/ui components (66 files)
- `src/components/subscription/` - Subscription-related components
- `src/components/admin/` - Admin area components
- `src/pages/admin/` - Admin pages
- `src/hooks/` - Custom React hooks including useSubscription, useWhitelabel, useAdmin
- `supabase/functions/` - Edge functions (Deno runtime)
- `supabase/migrations/` - Database migrations
- `src/__tests__/` - Test files
- `docs/` - Setup guides and documentation
- `scripts/` - Installation scripts

## Environment Variables

Required in `.env`:
```
# Supabase
VITE_SUPABASE_PROJECT_ID="lntraljilztlwwsggtfa"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon-key>"
VITE_SUPABASE_URL="https://lntraljilztlwwsggtfa.supabase.co"

# Stripe (optional - for payment processing)
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Whitelabel Overrides (optional)
VITE_BRAND_NAME="YourBrand"
VITE_BRAND_TAGLINE="Your tagline"
VITE_PRIMARY_COLOR="#6366f1"
VITE_LOGO_URL="https://..."
VITE_LOGO_DARK_URL="https://..."
VITE_FAVICON_URL="https://..."
```

**Edge Function Secrets (set in Supabase Dashboard):**
```
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
ELASTIC_EMAIL_API_KEY="..."
```

## Testing

**Test Files:**
- `src/__tests__/subscription-components.test.tsx` - Subscription UI tests
- `src/__tests__/funnel-limit-enforcement.test.tsx` - Limit enforcement tests
- `src/__tests__/admin-area.test.tsx` - Admin functionality tests
- `src/__tests__/admin-shared-components.test.tsx` - Admin shared component tests
- `src/__tests__/whitelabel.test.tsx` - Whitelabel system tests
- `src/__tests__/whitelabel-editors.test.tsx` - Whitelabel editor tests
- `src/__tests__/integration-tests.test.tsx` - Integration tests
- `src/__tests__/checkout-success.test.tsx` - Checkout success page tests
- `src/__tests__/landing-checkout.test.tsx` - Landing page checkout tests
- `src/__tests__/lifetime-pricing-ui.test.tsx` - Lifetime pricing UI tests
- `src/__tests__/products-management.test.tsx` - Products management tests
- `src/__tests__/users-management.test.tsx` - User management tests
- `src/__tests__/canvas-analytics.test.tsx` - Canvas analytics tests
- `src/__tests__/cli-installer.test.ts` - CLI installer tests
- `supabase/tests/database-schema.test.sql` - Database verification queries
- `supabase/tests/stripe-edge-functions.test.ts` - Edge function tests

**Running Tests:**
```bash
# Run all frontend tests
npm run test:run

# Run specific test file
npm run test:run -- src/__tests__/subscription-components.test.tsx

# Run edge function tests (requires Deno)
deno test --allow-net --allow-env supabase/tests/stripe-edge-functions.test.ts
```

## Deployment

**One-Click Deploy Options:**
- Vercel: Deploy button in README, uses `vercel.json` for SPA routing
- Netlify: Uses `netlify.toml` for build config and SPA routing

**Setup Wizard:**
- Available at `/setup` route after deployment
- Guides through: Supabase project, Edge Functions, migrations, secrets, env vars, auth URL, admin user
- Steps are tracked with checkboxes
- References `docs/manual.html` for detailed instructions

**Deployment Files:**
- `vercel.json` - Vercel SPA rewrites configuration
- `netlify.toml` - Netlify build and redirect configuration
- `docs/manual.html` - Comprehensive setup guide
- `docs/netlify-install.html` - Netlify-specific installation guide
- `docs/endusermanual.html` - End user documentation

## Agent OS

This project uses Agent OS. Installed with:
- 15 standards in `agent-os/standards/`
- 6 Claude Code commands with subagent delegation
- 8 Claude Code agents
