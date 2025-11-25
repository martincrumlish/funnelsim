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
