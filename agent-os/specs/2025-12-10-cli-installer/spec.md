# Specification: CLI Installer

## Goal

Create an interactive Node.js CLI installer that automates FunnelSim deployment for whitelabel owners, reducing setup time from ~45 minutes to ~15 minutes by handling Supabase backend creation, database migrations, edge function deployment, and Vercel hosting configuration.

## User Stories

- As a whitelabel purchaser, I want to run a single command to deploy my own instance so that I do not need to manually configure Supabase and Vercel.
- As a non-technical user, I want clear prompts and progress indicators so that I understand what is happening during installation.
- As a user experiencing an error, I want the installer to resume from where it left off so that I do not have to restart the entire process.
- As a new instance owner, I want an admin account created automatically so that I can log in and configure my application immediately.

## Core Requirements

- Run from within an already-cloned FunnelSim project directory
- Check for and offer to auto-install missing CLIs (Supabase CLI, Vercel CLI)
- Verify user is logged into both Supabase and Vercel CLIs before proceeding
- Create a new Supabase project with user-selected organization and user-provided database password
- Auto-generate project name from folder name + random 4-character suffix (e.g., `funnelsim-a3b7`)
- Run all 13 migrations from `supabase/migrations/` in order
- Deploy all 8 edge functions from `supabase/functions/`
- Create `funnel-logos` storage bucket with public access RLS policies
- Create test admin user (admin@test.com / testpassword123) in auth and admin_users table
- Link project to Vercel and set required environment variables
- Deploy to Vercel production
- Support resume via `.funnelsim-install` state file for interrupted installations
- Display post-installation checklist of manual steps

## Visual Design

N/A - CLI tool does not require visual design.

## Reusable Components

### Existing Code to Leverage

- **Migrations**: All 13 SQL files in `supabase/migrations/` define complete database schema
- **Edge Functions**: All 8 functions in `supabase/functions/` ready for deployment:
  - admin-create-user
  - admin-delete-user
  - admin-reset-password
  - create-checkout-session
  - create-portal-session
  - link-pending-subscription
  - retrieve-checkout-session
  - stripe-webhook
- **Config Reference**: `supabase/config.toml` structure for function settings
- **Admin User Pattern**: `admin-create-user/index.ts` shows how to create users and add to admin_users table via Supabase Admin API

### New Components Required

- **CLI Script**: `scripts/install.js` - Main installer entry point
- **State File**: `.funnelsim-install` - JSON file tracking completed steps
- No existing CLI scripts exist in project; this is new functionality

## Technical Approach

### Script Location and Execution

- Create `scripts/install.js` as the installer entry point
- Add npm script: `"install:deploy": "node scripts/install.js"`
- Use ES modules (project already uses `"type": "module"`)

### CLI Dependencies

The installer script itself should use minimal dependencies available in Node.js:
- `readline` (built-in) for basic prompts
- `child_process` (built-in) for executing CLI commands
- `fs/promises` (built-in) for state file management
- `crypto` (built-in) for random suffix generation

### Installation Steps (in order)

1. **Pre-flight Checks**
   - Verify running from valid FunnelSim directory (check for package.json with correct name)
   - Check Node.js version >= 18
   - Check for Supabase CLI; offer to install via `npm install -g supabase`
   - Check for Vercel CLI; offer to install via `npm install -g vercel`
   - Verify Supabase login status via `supabase projects list`
   - Verify Vercel login status via `vercel whoami`

2. **Supabase Project Creation**
   - Fetch organization list via `supabase orgs list --output json`
   - Present interactive org selection prompt
   - Prompt for database password (hidden input)
   - Generate project name: `{folder-name}-{random-4-char}`
   - Create project via `supabase projects create {name} --org-id {org} --db-password {pass} --region us-east-1`
   - Store project ref in state file

3. **Database Setup**
   - Link local project: `supabase link --project-ref {ref}`
   - Push all migrations: `supabase db push`
   - Verify migration success

4. **Edge Function Deployment**
   - Deploy all functions: `supabase functions deploy --no-verify-jwt` (individual per function with specific verify_jwt settings from config.toml)
   - Functions requiring `verify_jwt = false`: send-password-reset, reset-password-with-token

5. **Storage Bucket Creation**
   - Create bucket via Supabase Management API or SQL:
   ```sql
   INSERT INTO storage.buckets (id, name, public) VALUES ('funnel-logos', 'funnel-logos', true);
   ```
   - Add RLS policy for public read access

6. **Admin User Creation**
   - Create auth user via Supabase Admin API (using service role key)
   - Email: admin@test.com
   - Password: testpassword123
   - Auto-confirm email
   - Insert into admin_users table

7. **Retrieve Supabase Credentials**
   - Get project URL: `https://{project-ref}.supabase.co`
   - Get anon key via `supabase status` or API

8. **Vercel Deployment**
   - Link project: `vercel link` (interactive or with flags)
   - Set environment variables:
     - `VITE_SUPABASE_PROJECT_ID={project-ref}`
     - `VITE_SUPABASE_URL=https://{project-ref}.supabase.co`
     - `VITE_SUPABASE_PUBLISHABLE_KEY={anon-key}`
     - `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder`
   - Deploy: `vercel --prod`

9. **Completion**
   - Remove state file on success
   - Display deployment URL
   - Display manual steps checklist

### State File Format (.funnelsim-install)

```json
{
  "version": 1,
  "startedAt": "2025-12-10T10:00:00Z",
  "completedSteps": [
    "preflight",
    "supabase-project",
    "migrations"
  ],
  "supabaseProjectRef": "abc123xyz",
  "supabaseProjectUrl": "https://abc123xyz.supabase.co",
  "vercelProjectId": "prj_xxx"
}
```

### Error Handling

- Clear error messages with suggested fixes for common failures
- Graceful failure with state preservation (write state before each step)
- On re-run, detect state file and offer: "Resume from step X?" or "Start fresh?"
- Database password never stored in state file (re-prompt if needed on resume)

### CLI Output Style

- Use colored output for status (green checkmarks, red X, yellow warnings)
- Show spinner/progress during long operations
- Clear step numbering: `[1/9] Checking prerequisites...`

## Out of Scope

- Netlify deployment support (Vercel only in v1)
- Full Stripe configuration (requires manual setup in Stripe dashboard)
- Custom domain configuration (manual step in Vercel)
- Optional environment variables (whitelabel overrides set via admin panel post-deploy)
- GUI installer
- npx remote execution (must clone repo first)
- Custom admin credentials (hardcoded for simplicity)

## Success Criteria

- Complete installation in under 15 minutes for a user with CLI tools already installed
- Successfully resume interrupted installations without data loss
- All 13 migrations applied and verified
- All 8 edge functions deployed and accessible
- Storage bucket created with correct permissions
- Admin user can log in immediately after installation
- Vercel deployment accessible and functional
- Clear post-installation checklist displayed for remaining manual steps
