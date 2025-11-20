# FunnelSim

A visual sales funnel modeling and optimization tool that helps marketers and entrepreneurs plan and validate their funnel strategy before investing in development or traffic.

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

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication system
  - Row Level Security (RLS)
  - Edge Functions (Deno runtime)
  - Storage buckets

## Local Setup

### Prerequisites

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm)
- **npm** package manager
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
   ```

3. **Environment Configuration**

   The `.env` file should contain your Supabase credentials:
   ```env
   VITE_SUPABASE_PROJECT_ID="your-project-id"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**

   Open your browser to `http://localhost:8080`

## Project Structure

```
funnelsim/
├── src/
│   ├── components/         # React components
│   │   ├── landing/       # Landing page components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── FunnelCanvas.tsx
│   │   ├── FunnelNode.tsx
│   │   └── ...
│   ├── pages/             # Route pages
│   │   ├── Landing.tsx    # Landing page
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

## Development Commands

```bash
# Development
npm run dev          # Start dev server

# Building
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## Deployment

### Option 1: Vercel

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

### Option 2: Netlify

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

### Option 3: Self-Hosted (Docker)

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

## Setting Up Your Own Supabase Instance

To move from a shared Supabase instance to your own:

### Step 1: Create Your Supabase Project

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Note your credentials (URL, anon key, service role key)

### Step 2: Migrate Database Schema

Apply migrations from `supabase/migrations/`:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

Or manually run the SQL migrations in your Supabase dashboard SQL Editor.

### Step 3: Create Storage Bucket

1. Navigate to Storage in Supabase dashboard
2. Create bucket named `funnel-logos`
3. Make it public
4. Set up RLS policies:
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

### Step 4: Deploy Edge Functions

```bash
# Configure Supabase CLI
supabase login
supabase link --project-ref your-project-ref

# Set up secrets (if using custom email service)
supabase secrets set ELASTIC_EMAIL_API_KEY=your-key-here

# Deploy edge functions
supabase functions deploy send-password-reset
supabase functions deploy reset-password-with-token
```

### Step 5: Update Frontend Configuration

Update `.env`:
```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
```

Update `supabase/config.toml`:
```toml
project_id = "your-project-id"

[functions.send-password-reset]
verify_jwt = false

[functions.reset-password-with-token]
verify_jwt = false
```

### Step 6: Configure Authentication

1. Enable Email/Password auth in Supabase dashboard
2. Configure email templates
3. Set up SMTP for password resets (or use Supabase's default)
4. Update auth settings:
   - Site URL: Your production URL
   - Redirect URLs: Add your domain URLs

## Environment Variables Reference

| Variable | Description | Where to Use |
|----------|-------------|--------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Frontend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Frontend |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | Frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret!) | Edge Functions only |
| `ELASTIC_EMAIL_API_KEY` | Elastic Email API key (optional) | Edge Functions only |

## License

[Your chosen license]

## Contributing

[Your contribution guidelines]
