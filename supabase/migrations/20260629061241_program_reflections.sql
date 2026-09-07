create table if not exists public.program_reflections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  program_id text not null,
  program_title text not null,
  reflection_type text not null check (
    reflection_type in (
      'monthly_meaning',
      'weekly_meaning',
      'daily_meaning',
      'weekly_family_win',
      'toolbox_skill',
      'child_future_letter',
      'end_reflection'
    )
  ),
  month_number integer,
  month_topic text,
  week_number integer,
  week_in_month integer,
  day_number integer,
  lesson_title text,
  prompt text not null default '',
  response text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists program_reflections_owner_created_idx
on public.program_reflections (owner_id, created_at desc);

create index if not exists program_reflections_owner_program_idx
on public.program_reflections (owner_id, program_id, week_number, day_number);

alter table public.program_reflections enable row level security;

drop policy if exists "Program reflections are visible to owners" on public.program_reflections;
create policy "Program reflections are visible to owners"
on public.program_reflections for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "Program reflections can be created by owners" on public.program_reflections;
create policy "Program reflections can be created by owners"
on public.program_reflections for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "Program reflections can be updated by owners" on public.program_reflections;
create policy "Program reflections can be updated by owners"
on public.program_reflections for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);
