-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create funnels table
create table public.funnels (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  traffic_sources jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.funnels enable row level security;

create policy "Users can view own funnels"
  on public.funnels for select
  using (auth.uid() = user_id);

create policy "Users can create own funnels"
  on public.funnels for insert
  with check (auth.uid() = user_id);

create policy "Users can update own funnels"
  on public.funnels for update
  using (auth.uid() = user_id);

create policy "Users can delete own funnels"
  on public.funnels for delete
  using (auth.uid() = user_id);

-- Trigger for profiles
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger for updated_at on funnels
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_funnels_updated
  before update on public.funnels
  for each row execute procedure public.handle_updated_at();-- Fix search path for handle_updated_at function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);

-- Enable RLS
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies - only edge functions should access this table
CREATE POLICY "Service role can manage reset tokens"
  ON public.password_reset_tokens
  FOR ALL
  USING (true)
  WITH CHECK (true);-- Drop the overly permissive policy that allows public access
DROP POLICY IF EXISTS "Service role can manage reset tokens" ON public.password_reset_tokens;

-- No new policies needed - with RLS enabled and no policies, regular users cannot access the table
-- Edge functions using service role key will bypass RLS automatically-- Create storage bucket for funnel logos
insert into storage.buckets (id, name, public)
values ('funnel-logos', 'funnel-logos', true);

-- Add logo_url column to funnels table
alter table public.funnels
add column logo_url text;

-- Create RLS policies for funnel-logos bucket
create policy "Anyone can view funnel logos"
on storage.objects for select
using (bucket_id = 'funnel-logos');

create policy "Users can upload their own funnel logos"
on storage.objects for insert
with check (
  bucket_id = 'funnel-logos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own funnel logos"
on storage.objects for update
using (
  bucket_id = 'funnel-logos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own funnel logos"
on storage.objects for delete
using (
  bucket_id = 'funnel-logos' 
  and auth.uid()::text = (storage.foldername(name))[1]
);-- Create subscription_tiers table
-- Stores available subscription plans (Free, Pro, Enterprise)

create table public.subscription_tiers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  stripe_product_id text,
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  price_monthly numeric(10, 2) not null default 0,
  price_yearly numeric(10, 2) not null default 0,
  max_funnels integer not null default 1,
  features jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for common query patterns
create index idx_subscription_tiers_is_active on public.subscription_tiers(is_active);
create index idx_subscription_tiers_sort_order on public.subscription_tiers(sort_order);

-- Enable RLS
alter table public.subscription_tiers enable row level security;

-- Trigger for updated_at
create trigger on_subscription_tiers_updated
  before update on public.subscription_tiers
  for each row execute procedure public.handle_updated_at();

-- Seed default tiers
insert into public.subscription_tiers (name, price_monthly, price_yearly, max_funnels, features, sort_order, is_active)
values
  (
    'Free',
    0,
    0,
    3,
    '["Up to 3 funnels", "Basic analytics", "Community support"]'::jsonb,
    1,
    true
  ),
  (
    'Pro',
    29,
    290,
    25,
    '["Up to 25 funnels", "Advanced analytics", "Priority support", "Custom branding"]'::jsonb,
    2,
    true
  ),
  (
    'Enterprise',
    99,
    990,
    -1,
    '["Unlimited funnels", "Advanced analytics", "Dedicated support", "Custom branding", "API access", "White-label options"]'::jsonb,
    3,
    true
  );
-- Create user_subscriptions table
-- Tracks each user's subscription status

create table public.user_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  tier_id uuid references public.subscription_tiers on delete restrict not null,
  stripe_subscription_id text,
  stripe_customer_id text,
  status text not null default 'active',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for common query patterns
create index idx_user_subscriptions_user_id on public.user_subscriptions(user_id);
create index idx_user_subscriptions_stripe_subscription_id on public.user_subscriptions(stripe_subscription_id);
create index idx_user_subscriptions_status on public.user_subscriptions(status);

-- Add unique constraint - one subscription per user
create unique index idx_user_subscriptions_user_unique on public.user_subscriptions(user_id);

-- Enable RLS
alter table public.user_subscriptions enable row level security;

-- Trigger for updated_at
create trigger on_user_subscriptions_updated
  before update on public.user_subscriptions
  for each row execute procedure public.handle_updated_at();

-- Create a function to auto-create free subscription for new users
create or replace function public.handle_new_user_subscription()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  free_tier_id uuid;
begin
  -- Get the Free tier ID
  select id into free_tier_id from public.subscription_tiers where name = 'Free' limit 1;

  -- Create a subscription for the new user with the Free tier
  if free_tier_id is not null then
    insert into public.user_subscriptions (user_id, tier_id, status)
    values (new.id, free_tier_id, 'active');
  end if;

  return new;
end;
$$;

-- Trigger to auto-create subscription when user is created
create trigger on_auth_user_created_subscription
  after insert on auth.users
  for each row execute procedure public.handle_new_user_subscription();
-- Create whitelabel_config table
-- Single-row table for deployment configuration

create table public.whitelabel_config (
  id uuid default gen_random_uuid() primary key,
  brand_name text not null default 'FunnelSim',
  tagline text default 'Visual Sales Funnel Modeling',
  primary_color text default '#6366f1',
  logo_light_url text,
  logo_dark_url text,
  favicon_url text,
  hero_headline text default 'Model Your Sales Funnels Visually',
  hero_subheadline text default 'Design, analyze, and optimize your sales funnels with our intuitive drag-and-drop builder. See real-time revenue projections and make data-driven decisions.',
  hero_badge_text text default 'Sales Funnel Modeling Tool',
  cta_button_text text default 'Get Started Free',
  features jsonb default '[
    {"title": "Visual Funnel Builder", "description": "Drag-and-drop interface to design your sales funnels", "icon": "Workflow"},
    {"title": "Real-time Calculations", "description": "See revenue and profit projections instantly", "icon": "Calculator"},
    {"title": "Traffic Analysis", "description": "Model different traffic sources and costs", "icon": "TrendingUp"}
  ]'::jsonb,
  testimonials jsonb default '[
    {"quote": "FunnelSim helped us increase our conversion rate by 40%", "author": "Sarah Johnson", "role": "Marketing Director", "image": null}
  ]'::jsonb,
  faq jsonb default '[
    {"question": "What is FunnelSim?", "answer": "FunnelSim is a visual sales funnel modeling tool that helps you design, analyze, and optimize your sales funnels."},
    {"question": "Is there a free plan?", "answer": "Yes! Our Free plan lets you create up to 3 funnels with basic analytics."},
    {"question": "Can I cancel anytime?", "answer": "Absolutely. You can cancel your subscription at any time with no questions asked."}
  ]'::jsonb,
  footer_text text default 'FunnelSim - Visual Sales Funnel Modeling',
  email_sender_name text default 'FunnelSim',
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.whitelabel_config enable row level security;

-- Trigger for updated_at
create trigger on_whitelabel_config_updated
  before update on public.whitelabel_config
  for each row execute procedure public.handle_updated_at();

-- Create function to enforce single-row constraint
create or replace function public.enforce_single_whitelabel_config()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.whitelabel_config) >= 1 then
    raise exception 'Only one whitelabel_config row is allowed. Use UPDATE instead of INSERT.';
  end if;
  return new;
end;
$$;

-- Trigger to enforce single-row constraint on insert
create trigger enforce_single_whitelabel_config_trigger
  before insert on public.whitelabel_config
  for each row execute procedure public.enforce_single_whitelabel_config();

-- Seed default configuration
insert into public.whitelabel_config (brand_name) values ('FunnelSim');
-- Create admin_users table
-- Tracks which users have admin access

create table public.admin_users (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  is_admin boolean not null default true,
  created_at timestamp with time zone default now()
);

-- Add unique constraint - one entry per user
create unique index idx_admin_users_user_unique on public.admin_users(user_id);

-- Enable RLS
alter table public.admin_users enable row level security;
-- RLS Policies for subscription and whitelabel tables

-- Helper function to check if user is admin
create or replace function public.is_admin(check_user_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  return exists (
    select 1 from public.admin_users
    where user_id = check_user_id and is_admin = true
  );
end;
$$;

-- ============================================
-- subscription_tiers policies
-- ============================================

-- Public read access - anyone can view subscription tiers
create policy "Anyone can view subscription tiers"
  on public.subscription_tiers for select
  using (true);

-- Admin-only insert
create policy "Admins can create subscription tiers"
  on public.subscription_tiers for insert
  with check (public.is_admin(auth.uid()));

-- Admin-only update
create policy "Admins can update subscription tiers"
  on public.subscription_tiers for update
  using (public.is_admin(auth.uid()));

-- Admin-only delete
create policy "Admins can delete subscription tiers"
  on public.subscription_tiers for delete
  using (public.is_admin(auth.uid()));

-- ============================================
-- user_subscriptions policies
-- ============================================

-- Users can read their own subscription
create policy "Users can view own subscription"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);

-- Admins can view all subscriptions
create policy "Admins can view all subscriptions"
  on public.user_subscriptions for select
  using (public.is_admin(auth.uid()));

-- Service role handles inserts via webhooks/triggers (no user policy needed for insert)
-- The trigger uses security definer, bypassing RLS

-- Service role handles updates via webhooks (no user policy needed for update)
-- Admins can update any subscription
create policy "Admins can update subscriptions"
  on public.user_subscriptions for update
  using (public.is_admin(auth.uid()));

-- ============================================
-- whitelabel_config policies
-- ============================================

-- Public read access - anyone can view whitelabel config
create policy "Anyone can view whitelabel config"
  on public.whitelabel_config for select
  using (true);

-- Admin-only update (no insert since single-row constraint)
create policy "Admins can update whitelabel config"
  on public.whitelabel_config for update
  using (public.is_admin(auth.uid()));

-- ============================================
-- admin_users policies
-- ============================================

-- Admins can view admin users
create policy "Admins can view admin users"
  on public.admin_users for select
  using (public.is_admin(auth.uid()));

-- Admins can create admin users
create policy "Admins can create admin users"
  on public.admin_users for insert
  with check (public.is_admin(auth.uid()));

-- Admins can update admin users
create policy "Admins can update admin users"
  on public.admin_users for update
  using (public.is_admin(auth.uid()));

-- Admins can delete admin users (but not themselves - handled in app logic)
create policy "Admins can delete admin users"
  on public.admin_users for delete
  using (public.is_admin(auth.uid()));
-- Add lifetime pricing support to subscription system
-- Migration: 20251125000006_lifetime_pricing.sql

-- Add lifetime pricing columns to subscription_tiers table
ALTER TABLE public.subscription_tiers
ADD COLUMN IF NOT EXISTS stripe_price_id_lifetime text,
ADD COLUMN IF NOT EXISTS price_lifetime numeric(10, 2) NOT NULL DEFAULT 0;

-- Add is_lifetime column to user_subscriptions table
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS is_lifetime boolean NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.subscription_tiers.stripe_price_id_lifetime IS 'Stripe Price ID for one-time lifetime payment';
COMMENT ON COLUMN public.subscription_tiers.price_lifetime IS 'Display price for lifetime purchase option';
COMMENT ON COLUMN public.user_subscriptions.is_lifetime IS 'True if this is a lifetime (one-time payment) subscription';
-- Create pending_subscriptions table
-- Tracks purchases awaiting account creation for the reverse checkout flow
-- When users complete Stripe checkout before creating an account, their
-- subscription details are stored here until they complete registration

create table public.pending_subscriptions (
  id uuid default gen_random_uuid() primary key,
  stripe_customer_id text not null,
  stripe_session_id text unique not null,
  stripe_subscription_id text,
  tier_id uuid references public.subscription_tiers(id) on delete restrict,
  customer_email text not null,
  status text not null default 'pending',
  created_at timestamp with time zone default now(),
  linked_user_id uuid references auth.users(id) on delete set null,
  linked_at timestamp with time zone,
  expires_at timestamp with time zone default (now() + interval '7 days')
);

-- Create indexes for common query patterns
create index idx_pending_subscriptions_stripe_session_id on public.pending_subscriptions(stripe_session_id);
create index idx_pending_subscriptions_customer_email on public.pending_subscriptions(customer_email);
create index idx_pending_subscriptions_status on public.pending_subscriptions(status);
create index idx_pending_subscriptions_expires_at on public.pending_subscriptions(expires_at);

-- Enable RLS
alter table public.pending_subscriptions enable row level security;

-- RLS Policies for pending_subscriptions
-- Service role has full access (bypasses RLS by default in Supabase)
-- No direct user access needed - all operations go through edge functions

-- Policy to allow service role full access for edge functions
-- Note: In Supabase, service_role bypasses RLS by default, but we add
-- explicit policies for clarity and to handle any edge cases

-- Service role can select all pending subscriptions
create policy "Service role can select pending_subscriptions"
  on public.pending_subscriptions for select
  to service_role
  using (true);

-- Service role can insert pending subscriptions
create policy "Service role can insert pending_subscriptions"
  on public.pending_subscriptions for insert
  to service_role
  with check (true);

-- Service role can update pending subscriptions
create policy "Service role can update pending_subscriptions"
  on public.pending_subscriptions for update
  to service_role
  using (true);

-- Service role can delete pending subscriptions
create policy "Service role can delete pending_subscriptions"
  on public.pending_subscriptions for delete
  to service_role
  using (true);

-- Add comment on table for documentation
comment on table public.pending_subscriptions is 'Tracks Stripe subscriptions purchased before account creation. Records are linked to users upon registration or expire after 7 days.';
comment on column public.pending_subscriptions.status is 'Status of the pending subscription: pending (awaiting account creation) or linked (associated with a user account)';
comment on column public.pending_subscriptions.expires_at is 'Expiration timestamp for cleanup of unclaimed subscriptions (default: 7 days from creation)';
