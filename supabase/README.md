# Supabase setup

This folder contains SQL migrations for the Spent Tracker schema.

## Apply migrations

### Option A: Supabase SQL Editor (quick)
- Open your project in Supabase.
- Go to **SQL Editor** → paste the contents of `supabase/migrations/0001_init.sql` → Run.

### Option B: Supabase CLI (recommended)
- Install Supabase CLI, link your project, then run migrations.
- Keep `.env` values in your local environment (do not commit secrets).

