-- ============================================================
-- Law Office Management System — Supabase Schema
-- Run this once in Supabase Dashboard → SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1) Office settings (singleton — one row per workspace)
-- ------------------------------------------------------------
create table if not exists public.office_settings (
  id uuid primary key default gen_random_uuid(),
  office_name text not null default 'مكتب المحاماة',
  short_name text not null default 'المكتب',
  logo_data_url text,
  -- theme
  theme_color text default 'teal',
  theme_mode text default 'light',
  font_family text default 'tajawal',
  sidebar_position text default 'right',
  sidebar_collapsed boolean default false,
  compact_mode boolean default false,
  -- contact info
  phone text,
  email text,
  website text,
  address text,
  cr_number text,
  tax_number text,
  -- metadata
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 2) Profiles (linked to auth.users)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_code text unique,                    -- USR-XXXXX display id
  type text,                                -- manager, lawyer, supervisor, ...
  full_name text,
  first_name text,
  middle_name text,
  third_name text,
  last_name text,
  email text,
  phone text,
  id_number text,
  nationality text,
  avatar_data_url text,
  status text default 'active' check (status in ('active','inactive')),
  created_at timestamptz default now()
);

-- Auto-create profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, user_code, type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'USR-' || lpad((floor(random()*89999)+10000)::text, 5, '0'),
    'manager'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 3) Clients
-- ------------------------------------------------------------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  client_code text unique not null,         -- CLT-XXXXX display id
  client_type text not null default 'individual',
  contract_type text default 'default',
  full_name text not null,
  first_name text,
  second_name text,
  third_name text,
  last_name text,
  id_number text,
  nationality text,
  email text,
  phone text,
  notes text,
  attachments jsonb default '[]'::jsonb,    -- [{name,size,type,dataUrl}]
  status text default 'active' check (status in ('active','inactive')),
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists clients_full_name_idx on public.clients(full_name);
create index if not exists clients_id_number_idx on public.clients(id_number);

-- ------------------------------------------------------------
-- 4) Cases
-- ------------------------------------------------------------
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  case_code text unique not null,           -- CSE-XXXXX
  client_id uuid references public.clients(id) on delete cascade,
  -- case details
  case_type text,
  court_type text,
  request_title text,
  description text,
  urgency text default 'normal',
  priority text default 'medium',
  -- other party
  other_party_name text,
  other_party_id text,
  other_party_phone text,
  other_party_address text,
  -- financial
  claim_type text default 'financial',
  estimated_fees numeric default 0,
  consultation_fees numeric default 0,
  expected_court_fees numeric default 0,
  payment_status text default 'unpaid',
  payment_method text,
  fees jsonb default '[]'::jsonb,           -- fee items
  fees_notes text,
  -- duration & admin
  start_date date,
  expected_end_date date,
  assigned_lawyer uuid references auth.users(id),
  linked_contract text,
  -- attachments & notes
  attachments jsonb default '[]'::jsonb,
  final_notes text,
  -- status
  status text default 'active',
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists cases_client_id_idx on public.cases(client_id);
create index if not exists cases_status_idx on public.cases(status);

-- ------------------------------------------------------------
-- 5) Tasks
-- ------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  task_code text unique not null,           -- TSK-XXXXX
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo','doing','review','done')),
  priority text default 'medium',
  due_date date,
  assigned_to uuid references auth.users(id),
  case_id uuid references public.cases(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  archived boolean default false,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_assigned_to_idx on public.tasks(assigned_to);

-- ------------------------------------------------------------
-- 6) Contracts
-- ------------------------------------------------------------
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  contract_code text unique not null,       -- CNT-XXXXX
  client_id uuid references public.clients(id) on delete set null,
  -- client (denormalized for manual-input contracts)
  client_source text default 'manual' check (client_source in ('manual','user','client')),
  client_full_name text,
  client_id_number text,
  client_phone text,
  client_email text,
  client_address text,
  client_type text default 'individual',
  -- contract
  title text not null,
  contract_type text,
  start_date date,
  end_date date,
  priority text default 'medium',
  description text,
  -- services & financial
  services jsonb default '[]'::jsonb,       -- [{id,name,qty,price}]
  discount_amount numeric default 0,
  discount_percent numeric default 0,
  tax_rate numeric default 15,
  installments jsonb default '[]'::jsonb,   -- [{id,date,amount,note}]
  -- status
  status text default 'draft',
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists contracts_client_id_idx on public.contracts(client_id);
create index if not exists contracts_status_idx on public.contracts(status);

-- ------------------------------------------------------------
-- 7) Updated_at auto-touch trigger
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_clients on public.clients;
create trigger trg_touch_clients before update on public.clients
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_touch_cases on public.cases;
create trigger trg_touch_cases before update on public.cases
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_touch_tasks on public.tasks;
create trigger trg_touch_tasks before update on public.tasks
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_touch_contracts on public.contracts;
create trigger trg_touch_contracts before update on public.contracts
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_touch_office_settings on public.office_settings;
create trigger trg_touch_office_settings before update on public.office_settings
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- 8) Row Level Security
-- ------------------------------------------------------------
-- All authenticated users in this workspace can read/write everything
-- (single-office mode — appropriate when each office has its own Supabase project).

alter table public.office_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.cases enable row level security;
alter table public.tasks enable row level security;
alter table public.contracts enable row level security;

-- Helper macro: drop existing policies before creating new ones (idempotent)
drop policy if exists "auth full access" on public.office_settings;
drop policy if exists "auth full access" on public.profiles;
drop policy if exists "auth full access" on public.clients;
drop policy if exists "auth full access" on public.cases;
drop policy if exists "auth full access" on public.tasks;
drop policy if exists "auth full access" on public.contracts;

create policy "auth full access" on public.office_settings for all
  to authenticated using (true) with check (true);

create policy "auth full access" on public.profiles for all
  to authenticated using (true) with check (true);

create policy "auth full access" on public.clients for all
  to authenticated using (true) with check (true);

create policy "auth full access" on public.cases for all
  to authenticated using (true) with check (true);

create policy "auth full access" on public.tasks for all
  to authenticated using (true) with check (true);

create policy "auth full access" on public.contracts for all
  to authenticated using (true) with check (true);

-- ------------------------------------------------------------
-- 9) Seed default office_settings row
-- ------------------------------------------------------------
insert into public.office_settings (office_name, short_name)
select 'شركة ناصر طريد للمحاماة', 'ناصر طريد'
where not exists (select 1 from public.office_settings);

-- ------------------------------------------------------------
-- 10) Realtime — enable for live updates
-- ------------------------------------------------------------
alter publication supabase_realtime add table public.clients;
alter publication supabase_realtime add table public.cases;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.contracts;
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.office_settings;

-- ============================================================
-- Done — refresh the schema cache via Supabase Dashboard if needed
-- ============================================================
