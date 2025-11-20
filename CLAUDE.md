# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FunnelSim is a visual sales funnel modeling tool for marketers. Users design multi-step funnels with drag-and-drop nodes (ReactFlow), input traffic sources and costs, and see real-time revenue/profit calculations. The app features a public landing page and protected dashboard for authenticated users.

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
```

## Architecture

### Frontend Structure

**Two distinct sections:**
1. **Landing Page** (`/` route) - Marketing site with dark theme, custom animations
   - Components in `src/components/landing/`
   - Custom Button component at `src/components/landing/ui/Button.tsx`
   - Uses hardcoded dark colors (`dark-900: #0a0a0f`)
   - Custom CSS animations in `src/index.css` (`.animate-float`, `.gradient-text`, `.bg-grid`)

2. **App** (`/dashboard`, `/funnel/:id` routes) - Main application
   - Uses shadcn/ui components from `src/components/ui/`
   - Theme-aware with light/dark mode toggle
   - Uses CSS variables for colors (`bg-background`, `text-foreground`)

**Routing:**
- `/` → Landing page (public)
- `/auth` → Sign in/sign up (public)
- `/dashboard` → Funnel list (protected)
- `/funnel/:id` → Funnel builder (protected)
- `/profile` → User profile (protected)
- `/reset-password` → Password reset flow

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
- `src/components/FunnelCanvas.tsx` - Main ReactFlow canvas wrapper
- `src/components/FunnelNode.tsx` - Custom node component
- `src/components/FunnelMetricsTable.tsx` - Metrics display
- `src/components/TrafficInput.tsx` - Traffic source management

### State Management

**ReactFlow State:**
- `useNodesState` - Node positions and data
- `useEdgesState` - Connections between nodes
- Auto-save on changes (debounced)

**Authentication:**
- `src/hooks/useAuth.tsx` - AuthContext provider
- Wraps Supabase auth with React context
- Provides `signIn`, `signUp`, `signOut`, `user`, `session`

**Data Fetching:**
- Tanstack Query for data fetching/caching
- Direct Supabase client calls in components

### Backend (Supabase)

**Database Tables:**
- `funnels` - Stores funnel data (nodes, edges, traffic_sources as JSONB)
- `profiles` - User profiles (links to auth.users)
- `password_reset_tokens` - Custom password reset flow

**Storage:**
- `funnel-logos` bucket - Public bucket for logo uploads

**Edge Functions:**
- `send-password-reset` - Generates reset token and sends email
- `reset-password-with-token` - Validates token and updates password
- Both deployed to: `https://lntraljilztlwwsggtfa.supabase.co/functions/v1/`

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
   - Used by: Dashboard, Auth, FunnelBuilder

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

## Common Issues

**Import Paths:** Always use `@/` alias for imports from `src/`:
```typescript
import { cn } from '@/lib/utils';  // ✓ Correct
import { cn } from '../../lib/utils';  // ✗ Wrong (breaks Vite)
```

**Button Components:** Two different Button components exist:
- `src/components/ui/button.tsx` - shadcn/ui button (for app)
- `src/components/landing/ui/Button.tsx` - Custom landing button (for landing page)

**Theme Context:** Landing page ignores ThemeProvider. It always renders dark.

**RLS Policies:** All database operations respect RLS. Users can only access their own data via `auth.uid() = user_id` policies.

## File Structure Notes

**Removed files:**
- `src/pages/Index.tsx` - Deleted (replaced by Landing.tsx)
- `bun.lockb` - Deleted (project uses npm, not bun)

**Important directories:**
- `src/components/landing/` - Landing page components (isolated from app)
- `src/components/ui/` - shadcn/ui components (66 files)
- `src/components/` - App-specific components
- `supabase/functions/` - Edge functions (Deno runtime)
- `supabase/migrations/` - Database migrations

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_PROJECT_ID="lntraljilztlwwsggtfa"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon-key>"
VITE_SUPABASE_URL="https://lntraljilztlwwsggtfa.supabase.co"
```

## Agent OS

This project uses Agent OS. Installed with:
- 15 standards in `agent-os/standards/`
- 6 Claude Code commands with subagent delegation
- 8 Claude Code agents
