-- Spent Tracker schema (MVP): categories, transactions, budgets, subscriptions, goals
-- Designed for Supabase Postgres + Auth with per-user Row Level Security.

-- Extensions
create extension if not exists pgcrypto;

-- Utility: updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text,
  color text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists categories_user_id_idx on public.categories(user_id);

create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

-- Accounts (optional: cash/card/upi)
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists accounts_user_id_idx on public.accounts(user_id);

create trigger set_accounts_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

-- Transactions (expenses/income)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('expense', 'income')),
  amount numeric(12,2) not null check (amount >= 0),
  category_id uuid references public.categories(id) on delete set null,
  account_id uuid references public.accounts(id) on delete set null,
  occurred_at timestamptz not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_user_id_occurred_at_idx
  on public.transactions(user_id, occurred_at desc);
create index if not exists transactions_user_id_category_id_occurred_at_idx
  on public.transactions(user_id, category_id, occurred_at desc);

create trigger set_transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

-- Monthly budgets (overall or per category)
create table if not exists public.monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,
  category_id uuid references public.categories(id) on delete cascade,
  limit_amount numeric(12,2) not null check (limit_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month, category_id)
);

create index if not exists monthly_budgets_user_id_month_idx
  on public.monthly_budgets(user_id, month);

create trigger set_monthly_budgets_updated_at
before update on public.monthly_budgets
for each row execute function public.set_updated_at();

-- Subscriptions (tracking)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(12,2) not null check (amount >= 0),
  category_id uuid references public.categories(id) on delete set null,
  cadence text not null check (cadence in ('weekly', 'monthly', 'yearly')),
  billing_day int check (billing_day between 1 and 31),
  next_due_at timestamptz not null,
  autopay boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_next_due_at_idx
  on public.subscriptions(user_id, next_due_at);

create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

-- Subscription occurrences (history + upcoming)
create table if not exists public.subscription_occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  due_at timestamptz not null,
  paid_at timestamptz,
  amount numeric(12,2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscription_occurrences_user_id_due_at_idx
  on public.subscription_occurrences(user_id, due_at desc);
create index if not exists subscription_occurrences_subscription_id_due_at_idx
  on public.subscription_occurrences(subscription_id, due_at desc);

create trigger set_subscription_occurrences_updated_at
before update on public.subscription_occurrences
for each row execute function public.set_updated_at();

-- Goals
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null check (target_amount >= 0),
  target_date date,
  current_amount numeric(12,2) not null default 0 check (current_amount >= 0),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists goals_user_id_idx on public.goals(user_id);

create trigger set_goals_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

-- Goal contributions
create table if not exists public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  contributed_at timestamptz not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists goal_contributions_goal_id_contributed_at_idx
  on public.goal_contributions(goal_id, contributed_at desc);

create trigger set_goal_contributions_updated_at
before update on public.goal_contributions
for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.monthly_budgets enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_occurrences enable row level security;
alter table public.goals enable row level security;
alter table public.goal_contributions enable row level security;

-- Profiles: owner is id
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own on public.profiles
  for delete using (id = auth.uid());

-- Generic user-owned tables
create or replace function public.is_owner(row_user_id uuid)
returns boolean
language sql
stable
as $$
  select row_user_id = auth.uid()
$$;

-- Categories policies
drop policy if exists categories_select_own on public.categories;
create policy categories_select_own on public.categories
  for select using (public.is_owner(user_id));
drop policy if exists categories_insert_own on public.categories;
create policy categories_insert_own on public.categories
  for insert with check (public.is_owner(user_id));
drop policy if exists categories_update_own on public.categories;
create policy categories_update_own on public.categories
  for update using (public.is_owner(user_id)) with check (public.is_owner(user_id));
drop policy if exists categories_delete_own on public.categories;
create policy categories_delete_own on public.categories
  for delete using (public.is_owner(user_id));

-- Accounts policies
drop policy if exists accounts_select_own on public.accounts;
create policy accounts_select_own on public.accounts
  for select using (public.is_owner(user_id));
drop policy if exists accounts_insert_own on public.accounts;
create policy accounts_insert_own on public.accounts
  for insert with check (public.is_owner(user_id));
drop policy if exists accounts_update_own on public.accounts;
create policy accounts_update_own on public.accounts
  for update using (public.is_owner(user_id)) with check (public.is_owner(user_id));
drop policy if exists accounts_delete_own on public.accounts;
create policy accounts_delete_own on public.accounts
  for delete using (public.is_owner(user_id));

-- Transactions policies
drop policy if exists transactions_select_own on public.transactions;
create policy transactions_select_own on public.transactions
  for select using (public.is_owner(user_id));
drop policy if exists transactions_insert_own on public.transactions;
create policy transactions_insert_own on public.transactions
  for insert with check (public.is_owner(user_id));
drop policy if exists transactions_update_own on public.transactions;
create policy transactions_update_own on public.transactions
  for update using (public.is_owner(user_id)) with check (public.is_owner(user_id));
drop policy if exists transactions_delete_own on public.transactions;
create policy transactions_delete_own on public.transactions
  for delete using (public.is_owner(user_id));

-- Monthly budgets policies
drop policy if exists monthly_budgets_select_own on public.monthly_budgets;
create policy monthly_budgets_select_own on public.monthly_budgets
  for select using (public.is_owner(user_id));
drop policy if exists monthly_budgets_insert_own on public.monthly_budgets;
create policy monthly_budgets_insert_own on public.monthly_budgets
  for insert with check (public.is_owner(user_id));
drop policy if exists monthly_budgets_update_own on public.monthly_budgets;
create policy monthly_budgets_update_own on public.monthly_budgets
  for update using (public.is_owner(user_id)) with check (public.is_owner(user_id));
drop policy if exists monthly_budgets_delete_own on public.monthly_budgets;
create policy monthly_budgets_delete_own on public.monthly_budgets
  for delete using (public.is_owner(user_id));

-- Subscriptions policies
drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
  for select using (public.is_owner(user_id));
drop policy if exists subscriptions_insert_own on public.subscriptions;
create policy subscriptions_insert_own on public.subscriptions
  for insert with check (public.is_owner(user_id));
drop policy if exists subscriptions_update_own on public.subscriptions;
create policy subscriptions_update_own on public.subscriptions
  for update using (public.is_owner(user_id)) with check (public.is_owner(user_id));
drop policy if exists subscriptions_delete_own on public.subscriptions;
create policy subscriptions_delete_own on public.subscriptions
  for delete using (public.is_owner(user_id));

-- Subscription occurrences policies
drop policy if exists subscription_occurrences_select_own on public.subscription_occurrences;
create policy subscription_occurrences_select_own on public.subscription_occurrences
  for select using (public.is_owner(user_id));
drop policy if exists subscription_occurrences_insert_own on public.subscription_occurrences;
create policy subscription_occurrences_insert_own on public.subscription_occurrences
  for insert with check (public.is_owner(user_id));
drop policy if exists subscription_occurrences_update_own on public.subscription_occurrences;
create policy subscription_occurrences_update_own on public.subscription_occurrences
  for update using (public.is_owner(user_id)) with check (public.is_owner(user_id));
drop policy if exists subscription_occurrences_delete_own on public.subscription_occurrences;
create policy subscription_occurrences_delete_own on public.subscription_occurrences
  for delete using (public.is_owner(user_id));

-- Goals policies
drop policy if exists goals_select_own on public.goals;
create policy goals_select_own on public.goals
  for select using (public.is_owner(user_id));
drop policy if exists goals_insert_own on public.goals;
create policy goals_insert_own on public.goals
  for insert with check (public.is_owner(user_id));
drop policy if exists goals_update_own on public.goals;
create policy goals_update_own on public.goals
  for update using (public.is_owner(user_id)) with check (public.is_owner(user_id));
drop policy if exists goals_delete_own on public.goals;
create policy goals_delete_own on public.goals
  for delete using (public.is_owner(user_id));

-- Goal contributions policies
drop policy if exists goal_contributions_select_own on public.goal_contributions;
create policy goal_contributions_select_own on public.goal_contributions
  for select using (public.is_owner(user_id));
drop policy if exists goal_contributions_insert_own on public.goal_contributions;
create policy goal_contributions_insert_own on public.goal_contributions
  for insert with check (public.is_owner(user_id));
drop policy if exists goal_contributions_update_own on public.goal_contributions;
create policy goal_contributions_update_own on public.goal_contributions
  for update using (public.is_owner(user_id)) with check (public.is_owner(user_id));
drop policy if exists goal_contributions_delete_own on public.goal_contributions;
create policy goal_contributions_delete_own on public.goal_contributions
  for delete using (public.is_owner(user_id));

-- Helpful view: current month range can be computed client-side; no views required for MVP.

