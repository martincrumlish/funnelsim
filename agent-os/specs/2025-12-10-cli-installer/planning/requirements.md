# Spec Requirements: CLI Installer

## Initial Description

Create an interactive CLI installer script that automates the deployment process for buyers who purchase FunnelSim as a white-label product. The installer should guide users through setting up their own Supabase backend, deploying to Vercel, and configuring all necessary environment variables with minimal manual intervention.

## Requirements Discussion

### First Round Questions

**Q1:** Should the installer be run from within an already-cloned project directory, or should it handle git cloning as part of the installation?
**Answer:** Run from within an already-cloned project directory. The buyer will have already downloaded/cloned the repo.

**Q2:** Should the installer offer to auto-install missing CLIs (Supabase, Vercel) or just check and prompt the user to install them manually?
**Answer:** Offer to auto-install missing CLIs (Supabase, Vercel).

**Q3:** For Supabase project creation, should the installer prompt for organization selection, or auto-select the first/default org?
**Answer:** Prompt for Supabase org interactively. User sets database password during setup.

**Q4:** Should the installer create the `funnel-logos` storage bucket programmatically, or leave that as a manual step?
**Answer:** Create the `funnel-logos` storage bucket programmatically with RLS policies.

**Q5:** Should the installer support multiple deployment targets (Vercel, Netlify) or focus on Vercel only?
**Answer:** Vercel only (no Netlify support).

**Q6:** For environment variables, should the installer set all optional variables with placeholder values, or only the required ones?
**Answer:** Set required env vars only (Supabase URL/keys, Stripe placeholder).

**Q7:** Should the installer support a "resume" feature if it fails partway through (e.g., save state to a file)?
**Answer:** Yes, support resume via a state file that tracks completed steps.

**Q8:** Is there anything that should explicitly NOT be included in this installer?
**Answer:** Do not include Netlify support. Focus on Vercel deployment only.

### Follow-up Questions

**Follow-up 1:** For test admin credentials (admin@test.com / testpassword123), should the installer always create this exact user, or prompt for preferred admin email/password during installation?
**Answer:** (A) Always create the exact hardcoded user (admin@test.com / testpassword123) - simplicity over security concern.

**Follow-up 2:** For the `.funnelsim-install` state file that tracks progress for resumption, should this be in the project root or a hidden directory?
**Answer:** (A) In project root as `.funnelsim-install` - visible, easy to find/delete.

**Follow-up 3:** When creating the Supabase project, should the installer prompt for a custom project name or auto-generate?
**Answer:** (B) Auto-generate based on folder name or pattern like `funnelsim-{random-suffix}` - user can rename later if they want.

### Existing Code to Reference

**Similar Features Identified:**
- Edge functions in `supabase/functions/` - for understanding Supabase function deployment patterns
- Migrations in `supabase/migrations/` - for database schema setup order
- `.env` structure documented in CLAUDE.md - for required environment variables
- `supabase/config.toml` - Supabase project configuration reference

**Backend patterns to reference:**
- Storage bucket creation with RLS policies (funnel-logos bucket)
- Admin user creation via `admin_users` table
- Subscription tier setup via `subscription_tiers` table

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
N/A - CLI tool does not require visual design.

## Requirements Summary

### Functional Requirements

**Pre-flight Checks:**
- Verify running from within a valid FunnelSim project directory
- Check for required CLIs (Node.js, npm, Supabase CLI, Vercel CLI)
- Offer to auto-install missing Supabase and Vercel CLIs
- Verify user is logged into Supabase and Vercel CLIs

**Supabase Setup:**
- Prompt user to select Supabase organization
- Auto-generate project name from folder name + random suffix (e.g., `funnelsim-a1b2c3`)
- Prompt user to set database password
- Create new Supabase project programmatically
- Run all migrations in order from `supabase/migrations/`
- Deploy edge functions from `supabase/functions/`
- Create `funnel-logos` storage bucket with appropriate RLS policies
- Create test admin user (admin@test.com / testpassword123) in auth and admin_users table
- Retrieve and store project URL and anon key

**Vercel Deployment:**
- Link project to Vercel (or create new Vercel project)
- Set required environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_PROJECT_ID`
  - `VITE_STRIPE_PUBLISHABLE_KEY` (placeholder value)
- Deploy to Vercel production

**State Management:**
- Create `.funnelsim-install` file in project root
- Track completed steps for resume capability
- On restart, detect state file and offer to resume or start fresh
- Clean up state file on successful completion

**Post-Installation Output:**
- Display deployment URL
- Output manual steps checklist:
  - Configure Stripe (add secret key, webhook secret to Supabase)
  - Set up custom domain in Vercel (optional)
  - Change admin password from default test credentials
  - Configure whitelabel settings in admin panel

### Reusability Opportunities

- Supabase CLI commands for project/migration/function management
- Vercel CLI commands for deployment and env var management
- Existing migration files define complete database schema
- Edge function deployment patterns already established

### Scope Boundaries

**In Scope:**
- Interactive CLI script (Node.js based)
- Supabase project creation and configuration
- Database migrations and edge function deployment
- Storage bucket creation with RLS
- Test admin user creation with hardcoded credentials
- Vercel project linking and deployment
- Environment variable configuration (required vars only)
- Resume/checkpoint functionality via state file
- Post-installation manual steps checklist

**Out of Scope:**
- Netlify deployment support
- Stripe full configuration (manual step)
- Custom domain configuration (manual step)
- Optional environment variables (whitelabel overrides)
- GUI installer
- Windows-specific installation paths (assume standard CLI availability)

### Technical Considerations

**Technology:**
- Node.js script (matches project stack)
- Uses Supabase CLI (`supabase` commands)
- Uses Vercel CLI (`vercel` commands)
- Interactive prompts via inquirer or similar library

**CLI Dependencies:**
- Node.js 18+ (required, must be pre-installed)
- npm (required, comes with Node.js)
- Supabase CLI (can be auto-installed)
- Vercel CLI (can be auto-installed)

**State File Format (.funnelsim-install):**
- JSON format for easy parsing
- Track: completed steps, Supabase project ID, Vercel project ID, timestamps
- Allow manual deletion to force fresh start

**Error Handling:**
- Clear error messages with suggested fixes
- Graceful failure with state preservation
- Option to retry failed step or skip (where safe)

**Security Notes:**
- Database password entered by user (not stored in state file)
- Supabase/Vercel credentials managed by respective CLIs
- Test admin credentials are intentionally simple (documented as needing change)
