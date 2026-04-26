create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'psychologist',
  bio text,
  avatar_url text,
  whatsapp text,
  city text not null default 'Barranquilla',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text,
  image_url text,
  published boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  consultation_reason text not null,
  preferred_contact text not null default 'whatsapp',
  email text,
  source text not null default 'website',
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;
create trigger set_blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

drop trigger if exists set_appointments_leads_updated_at on public.appointments_leads;
create trigger set_appointments_leads_updated_at
before update on public.appointments_leads
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.blog_posts enable row level security;
alter table public.appointments_leads enable row level security;

drop policy if exists "Public can read published blog posts" on public.blog_posts;
create policy "Public can read published blog posts"
on public.blog_posts
for select
using (published = true);

drop policy if exists "Authenticated users can manage blog posts" on public.blog_posts;
create policy "Authenticated users can manage blog posts"
on public.blog_posts
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can create leads" on public.appointments_leads;
create policy "Public can create leads"
on public.appointments_leads
for insert
to anon, authenticated
with check (true);

drop policy if exists "Psychologist can read leads" on public.appointments_leads;
create policy "Psychologist can read leads"
on public.appointments_leads
for select
to authenticated
using (true);

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
