-- ============================================================
-- FINIO — Supabase Database Schema
-- Run this ONCE in Supabase → SQL Editor → New Query → Run
-- ============================================================

-- PROFILES (extends Supabase auth.users)
create table public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  fname           text not null default '',
  lname           text not null default '',
  monthly_income  numeric default 0,
  created_at      timestamptz default now()
);

-- TRANSACTIONS
create table public.transactions (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount      numeric not null,
  type        text not null check (type in ('income','expense')),
  category    text not null,
  date        date not null,
  created_at  timestamptz default now()
);

-- USER_SETTINGS (controls + category limits)
create table public.user_settings (
  user_id     uuid references auth.users(id) on delete cascade primary key,
  controls    jsonb default '{
    "daily":   {"on": false, "limit": 3000},
    "weekly":  {"on": false, "limit": 15000},
    "savings": {"on": true,  "limit": 20000},
    "nospend": {"on": false}
  }'::jsonb,
  cat_limits  jsonb default '{
    "Food": 15000, "Transport": 8000, "Shopping": 10000,
    "Entertainment": 5000, "Bills": 12000
  }'::jsonb,
  updated_at  timestamptz default now()
);

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────────────────
alter table public.profiles     enable row level security;
alter table public.transactions enable row level security;
alter table public.user_settings enable row level security;

-- Profiles
create policy "profiles: select own"  on public.profiles for select using (auth.uid() = id);
create policy "profiles: insert own"  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: update own"  on public.profiles for update using (auth.uid() = id);

-- Transactions
create policy "txns: select own"  on public.transactions for select using (auth.uid() = user_id);
create policy "txns: insert own"  on public.transactions for insert with check (auth.uid() = user_id);
create policy "txns: update own"  on public.transactions for update using (auth.uid() = user_id);
create policy "txns: delete own"  on public.transactions for delete using (auth.uid() = user_id);

-- Settings
create policy "settings: select own"  on public.user_settings for select using (auth.uid() = user_id);
create policy "settings: insert own"  on public.user_settings for insert with check (auth.uid() = user_id);
create policy "settings: update own"  on public.user_settings for update using (auth.uid() = user_id);

-- ── AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, fname, lname, monthly_income)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'fname', ''),
    coalesce(new.raw_user_meta_data->>'lname', ''),
    coalesce((new.raw_user_meta_data->>'monthly_income')::numeric, 0)
  );
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── PERFORMANCE INDEXES ─────────────────────────────────────────────────────
create index idx_txns_user_id   on public.transactions(user_id);
create index idx_txns_date      on public.transactions(date desc);
create index idx_txns_user_date on public.transactions(user_id, date desc);
create index idx_txns_type      on public.transactions(user_id, type);
