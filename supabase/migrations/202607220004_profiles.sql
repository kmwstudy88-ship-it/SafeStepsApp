create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_name text,
  primary_email citext,
  primary_phone text,
  avatar_storage_path text,
  default_tenant_id uuid references public.platform_tenants(id) on delete set null,
  preferred_language_code text not null default 'en-AU',
  preferred_timezone text not null default 'Australia/Brisbane',
  accessibility_preferences jsonb not null default '{}'::jsonb,
  notification_preferences jsonb not null default '{}'::jsonb,
  profile_status text not null default 'active',
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists display_name text,
  add column if not exists preferred_name text,
  add column if not exists primary_email citext,
  add column if not exists primary_phone text,
  add column if not exists avatar_storage_path text,
  add column if not exists default_tenant_id uuid references public.platform_tenants(id) on delete set null,
  add column if not exists preferred_language_code text not null default 'en-AU',
  add column if not exists preferred_timezone text not null default 'Australia/Brisbane',
  add column if not exists accessibility_preferences jsonb not null default '{}'::jsonb,
  add column if not exists notification_preferences jsonb not null default '{}'::jsonb,
  add column if not exists profile_status text not null default 'active',
  add column if not exists last_active_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists profiles_default_tenant_idx
  on public.profiles (default_tenant_id);

create index if not exists profiles_email_idx
  on public.profiles (primary_email);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    display_name,
    preferred_name,
    primary_email,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'preferred_name',
    new.email,
    now(),
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();
