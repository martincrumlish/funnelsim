# Raw Idea: CLI Installer for FunnelSim

## Feature Description

Create an interactive CLI installer script (npx create-funnelsim or similar) that automates the deployment process for whitelabel owners. The installer should:

1. Check prerequisites (Node, Git, Supabase CLI, Vercel CLI)
2. Walk through logins interactively (Supabase, Vercel)
3. Create Supabase project + run migrations + deploy edge functions
4. Deploy to Vercel + set environment variables
5. Output remaining manual steps (Stripe setup, domain configuration, first admin user)

## Goal

Reduce setup time from ~45 minutes to ~15 minutes by automating the parts that can be automated (about 70%) while providing clear instructions for the manual steps that remain (Stripe, DNS, etc.).

## Submission Date

2025-12-10
