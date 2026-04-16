-- Esquema inicial para Supabase
-- Proyecto: CRM SaaS para agentes y agencias de seguros
-- Fecha: 2026-04-15
--
-- Uso recomendado:
-- 1. Abre el SQL Editor de Supabase.
-- 2. Pega todo este archivo y ejecútalo.
-- 3. Vuelve al CRM y prueba la conexion desde /crm/agencia.
--
-- Nota:
-- Este esquema usa ids tipo TEXT para ser compatible con los ids actuales
-- del frontend mientras migramos desde localStorage.

begin;

create extension if not exists pgcrypto;

create table if not exists public.agencies (
  id text primary key,
  name text not null,
  slug text not null unique,
  city text not null,
  country text not null,
  plan text not null check (plan in ('Starter', 'Growth', 'Pro')),
  team_size integer not null default 1 check (team_size between 1 and 500),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.advisors (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role text not null default 'Asesor' check (role in ('Admin', 'Asesor')),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint advisors_email_per_agency_unique unique (agency_id, email)
);

create table if not exists public.leads (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  advisor_id text references public.advisors(id) on delete set null,
  name text not null,
  product text not null,
  source text not null check (source in ('Landing Page', 'WhatsApp', 'Referido', 'Formulario', 'Llamada', 'Email')),
  stage text not null default 'Nuevo lead' check (stage in ('Nuevo lead', 'Cotizacion', 'Negociacion', 'Cierre', 'Postventa')),
  advisor_name text not null default 'Sin asignar',
  next_step text not null default 'Contactar y calificar',
  email text,
  phone text,
  city text,
  country text,
  age integer check (age is null or age between 18 and 120),
  campaign_name text,
  external_lead_id text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint leads_external_id_per_agency_unique unique nulls not distinct (agency_id, external_lead_id)
);

create table if not exists public.clients (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  lead_id text references public.leads(id) on delete set null,
  advisor_id text references public.advisors(id) on delete set null,
  advisor_name text not null default 'Sin asignar',
  full_name text not null,
  product text not null,
  policy_number text,
  renewal_date date not null,
  status text not null default 'Seguimiento' check (status in ('Al dia', 'Pendiente', 'Seguimiento')),
  email text,
  phone text,
  city text,
  country text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint clients_source_lead_unique unique nulls not distinct (agency_id, lead_id)
);

create table if not exists public.tasks (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  advisor_id text references public.advisors(id) on delete set null,
  lead_id text references public.leads(id) on delete set null,
  client_id text references public.clients(id) on delete set null,
  title text not null,
  due_at timestamptz not null,
  urgent boolean not null default false,
  subject_name text not null,
  stage text not null check (stage in ('Nuevo lead', 'Cotizacion', 'Negociacion', 'Cierre', 'Postventa')),
  advisor_name text not null default 'Sin asignar',
  channel text not null default 'CRM' check (channel in ('WhatsApp', 'Email', 'Llamada', 'CRM')),
  status text not null default 'Pendiente' check (status in ('Pendiente', 'Completada')),
  entity_type text not null check (entity_type in ('lead', 'client')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.renewals (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  client_id text not null references public.clients(id) on delete cascade,
  advisor_id text references public.advisors(id) on delete set null,
  due_date date not null,
  status text not null default 'Pendiente' check (status in ('Pendiente', 'Contactado', 'Renovado', 'Vencido')),
  premium_amount numeric(12, 2),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_advisors_agency_id on public.advisors(agency_id);
create index if not exists idx_leads_agency_id on public.leads(agency_id);
create index if not exists idx_leads_agency_stage on public.leads(agency_id, stage);
create index if not exists idx_leads_agency_created_at on public.leads(agency_id, created_at desc);
create index if not exists idx_clients_agency_id on public.clients(agency_id);
create index if not exists idx_clients_agency_renewal_date on public.clients(agency_id, renewal_date);
create index if not exists idx_tasks_agency_id on public.tasks(agency_id);
create index if not exists idx_tasks_agency_status_due_at on public.tasks(agency_id, status, due_at);
create index if not exists idx_renewals_agency_due_date on public.renewals(agency_id, due_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_agencies_set_updated_at on public.agencies;
create trigger trg_agencies_set_updated_at
before update on public.agencies
for each row execute function public.set_updated_at();

drop trigger if exists trg_advisors_set_updated_at on public.advisors;
create trigger trg_advisors_set_updated_at
before update on public.advisors
for each row execute function public.set_updated_at();

drop trigger if exists trg_leads_set_updated_at on public.leads;
create trigger trg_leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists trg_clients_set_updated_at on public.clients;
create trigger trg_clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists trg_tasks_set_updated_at on public.tasks;
create trigger trg_tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists trg_renewals_set_updated_at on public.renewals;
create trigger trg_renewals_set_updated_at
before update on public.renewals
for each row execute function public.set_updated_at();

-- Perfil: vincula auth.users con la agencia (tenant) del usuario.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  agency_id text not null references public.agencies(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'asesor')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_profiles_agency_id on public.profiles(agency_id);

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Politicas abiertas solo para etapa de desarrollo sin autenticacion real.
-- Cuando entremos a auth multiagencia, estas politicas deben reemplazarse
-- por reglas basadas en membership/tenant.

alter table public.agencies enable row level security;
alter table public.advisors enable row level security;
alter table public.leads enable row level security;
alter table public.clients enable row level security;
alter table public.tasks enable row level security;
alter table public.renewals enable row level security;

drop policy if exists "dev agencies full access" on public.agencies;
create policy "dev agencies full access"
on public.agencies
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "dev advisors full access" on public.advisors;
create policy "dev advisors full access"
on public.advisors
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "dev leads full access" on public.leads;
create policy "dev leads full access"
on public.leads
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "dev clients full access" on public.clients;
create policy "dev clients full access"
on public.clients
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "dev tasks full access" on public.tasks;
create policy "dev tasks full access"
on public.tasks
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "dev renewals full access" on public.renewals;
create policy "dev renewals full access"
on public.renewals
for all
to anon, authenticated
using (true)
with check (true);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Datos semilla minimos para probar la conexion inicial.
insert into public.agencies (id, name, slug, city, country, plan, team_size)
values
  ('agency-demo-001', 'Agencia Seguros Andinos', 'seguros-andinos', 'Bogota', 'Colombia', 'Starter', 4),
  ('agency-demo-002', 'Broker Norte Seguros', 'broker-norte-seguros', 'Medellin', 'Colombia', 'Growth', 6)
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  city = excluded.city,
  country = excluded.country,
  plan = excluded.plan,
  team_size = excluded.team_size;

commit;
