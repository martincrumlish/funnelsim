# FunnelSim Documentation

## Overview

FunnelSim is a visual funnel modeling and optimization tool that helps marketers and entrepreneurs plan and validate their sales funnel strategy before investing in development or traffic. Built with React, TypeScript, and Supabase, it provides an interactive canvas for designing multi-step funnels with traffic modeling, conversion tracking, and revenue calculations.

## Features

- **Visual Funnel Builder**: Drag-and-drop interface using ReactFlow for creating complex funnel structures
- **Traffic Modeling**: Define multiple traffic sources with visit counts and costs
- **Real-time Calculations**: Automatic calculation of conversions, revenue, and EPC (Earnings Per Click)
- **Metrics Dashboard**: Comprehensive table view of funnel performance metrics
- **Export Options**: Export funnels as images (PNG) or PDF reports
- **User Authentication**: Secure sign-up/login system with email-based password reset
- **Cloud Storage**: Store funnel designs and logos in the cloud
- **Auto-save**: Automatic saving of funnel changes

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **ReactFlow** - Interactive node-based diagrams
- **React Router** - Client-side routing
- **Tanstack Query** - Data fetching and caching

### Backend (Lovable Cloud/Supabase)
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication system
  - Row Level Security (RLS)
  - Edge Functions (Deno runtime)
  - Storage buckets

## Local Setup

### Prerequisites

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm)
- **npm** or **bun** package manager
- **Git** for version control

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd funnelsim
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Configuration**
   
   The `.env` file is already configured with Lovable Cloud credentials:
   ```env
   VITE_SUPABASE_PROJECT_ID="ptlnggjaxhmsqztsjaoe"
   VITE_SUPABASE_PUBLISHABLE_KEY="..."
   VITE_SUPABASE_URL="https://ptlnggjaxhmsqztsjaoe.supabase.co"
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Access the application**
   
   Open your browser to `http://localhost:8080`

### Project Structure

```
funnelsim/
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── FunnelCanvas.tsx
│   │   ├── FunnelNode.tsx
│   │   └── ...
│   ├── pages/             # Route pages
│   │   ├── Index.tsx      # Landing page
│   │   ├── Dashboard.tsx  # Funnel list
│   │   ├── FunnelBuilder.tsx
│   │   └── Auth.tsx
│   ├── hooks/             # Custom React hooks
│   │   └── useAuth.tsx
│   ├── integrations/      # External service integrations
│   │   └── supabase/
│   ├── lib/               # Utility functions
│   └── main.tsx           # App entry point
├── supabase/
│   ├── functions/         # Edge functions
│   │   ├── send-password-reset/
│   │   └── reset-password-with-token/
│   ├── migrations/        # Database migrations
│   └── config.toml        # Supabase configuration
├── public/                # Static assets
└── package.json
```

## Database Schema

### Tables

**funnels**
- `id` (uuid, primary key)
- `user_id` (uuid) - Links to authenticated user
- `name` (text)
- `nodes` (jsonb) - Funnel step data
- `edges` (jsonb) - Connections between steps
- `traffic_sources` (jsonb) - Traffic source configurations
- `logo_url` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**profiles**
- `id` (uuid, primary key) - Matches auth.users.id
- `email` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**password_reset_tokens**
- `id` (uuid, primary key)
- `token` (text)
- `user_id` (uuid)
- `expires_at` (timestamp)
- `used` (boolean)
- `created_at` (timestamp)

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data:

- **funnels**: Users can CRUD only their own funnels (`auth.uid() = user_id`)
- **profiles**: Users can view and update only their own profile
- **password_reset_tokens**: No RLS policies (managed server-side)

### Storage Buckets

- **funnel-logos** (public): Stores uploaded funnel logo images

## Deployment

### Option 1: Lovable Platform (Easiest)

1. **Connect GitHub** (if not already connected)
   - Click GitHub → Connect to GitHub in Lovable editor
   - Authorize the Lovable GitHub App
   - Create repository

2. **Publish**
   - Click the "Publish" button in top-right corner
   - Your app deploys to `yoursite.lovable.app`
   - Backend changes deploy automatically
   - Frontend changes require clicking "Update" in publish dialog

3. **Custom Domain** (Pro/Business plans)
   - Navigate to Project → Settings → Domains
   - Click "Connect Domain"
   - Follow DNS configuration instructions

### Option 2: Vercel

1. **Prepare the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel
   ```

3. **Configure environment variables** in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`

### Option 3: Netlify

1. **Create `netlify.toml`**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy via Netlify CLI or Git integration**
   ```bash
   npm run build
   netlify deploy --prod
   ```

### Option 4: Self-Hosted (Docker)

1. **Create `Dockerfile`**
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create `nginx.conf`**
   ```nginx
   server {
     listen 80;
     location / {
       root /usr/share/nginx/html;
       index index.html;
       try_files $uri $uri/ /index.html;
     }
   }
   ```

3. **Build and run**
   ```bash
   docker build -t funnelsim .
   docker run -p 80:80 funnelsim
   ```

## Decoupling from Lovable Cloud

To move from Lovable Cloud to your own self-hosted Supabase instance:

### Step 1: Create Your Own Supabase Project

1. **Sign up for Supabase**
   - Go to [supabase.com](https://supabase.com)
   - Create a free account
   - Create a new project

2. **Note your credentials**
   - Project URL: `https://xxxxx.supabase.co`
   - Anon/Public Key: `eyJhbGc...`
   - Service Role Key: `eyJhbGc...` (keep secret!)

### Step 2: Migrate Database Schema

1. **Export current schema** (if possible, otherwise use migration files)
   
   If you have access to the Lovable Cloud database, export the schema. Otherwise, use the migration files in `supabase/migrations/`.

2. **Apply migrations to your Supabase project**
   
   Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

   Link to your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

   Push migrations:
   ```bash
   supabase db push
   ```

   Or manually run the SQL migrations in your Supabase dashboard SQL Editor.

### Step 3: Migrate Storage Buckets

1. **Create storage bucket** in Supabase dashboard:
   - Navigate to Storage
   - Create bucket named `funnel-logos`
   - Make it public
   - Set up RLS policies:
     ```sql
     -- Allow public read
     CREATE POLICY "Public read access"
     ON storage.objects FOR SELECT
     USING (bucket_id = 'funnel-logos');

     -- Allow authenticated users to upload
     CREATE POLICY "Authenticated users can upload"
     ON storage.objects FOR INSERT
     WITH CHECK (
       bucket_id = 'funnel-logos' AND
       auth.uid()::text = (storage.foldername(name))[1]
     );
     ```

2. **Migrate existing files** (if any):
   - Download from Lovable Cloud storage
   - Upload to your Supabase storage bucket

### Step 4: Deploy Edge Functions

1. **Configure Supabase CLI**
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```

2. **Set up secrets**
   ```bash
   # For password reset emails (if using Elastic Email)
   supabase secrets set ELASTIC_EMAIL_API_KEY=your-key-here
   
   # Supabase credentials (auto-set, but verify)
   supabase secrets set SUPABASE_URL=https://your-project.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Deploy edge functions**
   ```bash
   supabase functions deploy send-password-reset
   supabase functions deploy reset-password-with-token
   ```

### Step 5: Update Frontend Configuration

1. **Update `.env` file**
   ```env
   VITE_SUPABASE_PROJECT_ID="your-project-id"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   ```

2. **Update `supabase/config.toml`**
   ```toml
   project_id = "your-project-id"

   [functions.send-password-reset]
   verify_jwt = false

   [functions.reset-password-with-token]
   verify_jwt = false
   ```

3. **Rebuild and redeploy** your frontend with new environment variables

### Step 6: Migrate User Data

1. **Export users** from Lovable Cloud (if possible)
2. **Import users** to your Supabase project:
   ```bash
   supabase db dump --data-only > data.sql
   # Edit data.sql to include only necessary data
   psql your-database-url < data.sql
   ```

3. **Or create new user accounts** if data export isn't possible

### Step 7: Configure Authentication

1. **Enable auth providers** in Supabase dashboard:
   - Email/Password (enabled by default)
   - Configure email templates
   - Set up SMTP for password resets (or use Supabase's default)

2. **Update auth settings**:
   - Site URL: Your production URL
   - Redirect URLs: Add your domain URLs

### Step 8: Test Everything

- [ ] User sign-up and login
- [ ] Password reset flow
- [ ] Creating and saving funnels
- [ ] Uploading funnel logos
- [ ] Exporting funnels
- [ ] All RLS policies working correctly

## Environment Variables Reference

| Variable | Description | Where to Use |
|----------|-------------|--------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Frontend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Frontend |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | Frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret!) | Edge Functions only |
| `ELASTIC_EMAIL_API_KEY` | Elastic Email API key (optional) | Edge Functions only |

## Development Workflow

### Making Database Changes

1. **Create a migration file**
   ```bash
   supabase migration new your_migration_name
   ```

2. **Write your SQL** in the generated migration file

3. **Apply locally**
   ```bash
   supabase db reset  # Resets and applies all migrations
   ```

4. **Push to production** (when using your own Supabase)
   ```bash
   supabase db push
   ```

### Working with Edge Functions

1. **Create new function**
   ```bash
   supabase functions new your-function-name
   ```

2. **Develop locally**
   ```bash
   supabase functions serve your-function-name
   ```

3. **Deploy to production**
   ```bash
   supabase functions deploy your-function-name
   ```

### Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production (test build)
npm run build
```

## Troubleshooting

### Common Issues

**Issue**: "Failed to fetch" errors when accessing the app
- **Solution**: Check that `VITE_SUPABASE_URL` is correct and Supabase project is running

**Issue**: Authentication not working
- **Solution**: Verify RLS policies are enabled and configured correctly

**Issue**: Edge functions failing
- **Solution**: Check secrets are set correctly with `supabase secrets list`

**Issue**: Storage uploads failing
- **Solution**: Verify storage bucket exists and RLS policies allow uploads

### Getting Help

- **Lovable Documentation**: [docs.lovable.dev](https://docs.lovable.dev)
- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Discord Community**: [Lovable Discord](https://discord.gg/lovable)

## License

[Your chosen license]

## Contributing

[Your contribution guidelines]
