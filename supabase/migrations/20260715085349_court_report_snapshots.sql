-- SAFE STEPS COURT REPORT SNAPSHOTS
-- Immutable report export records with hash-chain support.

create extension if not exists pgcrypto;

create table if not exists public.court_report_snapshots (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  owner_id uuid not null default auth.uid(),
  report_title text not null,
  version_label text not null,
  report_status text not null
    check (report_status in ('draft', 'supervisor_review_required', 'approved')),
  snapshot_payload jsonb not null,
  snapshot_hash text not null,
  previous_snapshot_hash text,
  hash_algorithm text not null default 'sha256',
  ready_for_final_export boolean not null default false,
  export_readiness_blockers text[] not null default array[]::text[],
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (snapshot_hash)
);

alter table public.court_report_snapshots enable row level security;

drop policy if exists court_report_snapshots_select on public.court_report_snapshots;
create policy court_report_snapshots_select on public.court_report_snapshots
for select to authenticated
using (
  owner_id = (select auth.uid())
  or created_by = (select auth.uid())
  or exists (
    select 1
    from public.reunification_cases c
    where c.id = case_id
      and (
        c.owner_id = (select auth.uid())
        or c.parent_user_id = (select auth.uid())
        or c.worker_user_id = (select auth.uid())
        or public.can_manage_assessments()
      )
  )
);

drop policy if exists court_report_snapshots_insert on public.court_report_snapshots;
create policy court_report_snapshots_insert on public.court_report_snapshots
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and (
    owner_id = (select auth.uid())
    or exists (
      select 1
      from public.reunification_cases c
      where c.id = case_id
        and (
          c.owner_id = (select auth.uid())
          or c.parent_user_id = (select auth.uid())
          or c.worker_user_id = (select auth.uid())
          or public.can_manage_assessments()
        )
    )
  )
);

create or replace function public.reject_court_report_snapshot_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'court_report_snapshots are immutable; create a new snapshot version instead';
end;
$$;

drop trigger if exists court_report_snapshots_no_update on public.court_report_snapshots;
create trigger court_report_snapshots_no_update
before update on public.court_report_snapshots
for each row execute function public.reject_court_report_snapshot_mutation();

drop trigger if exists court_report_snapshots_no_delete on public.court_report_snapshots;
create trigger court_report_snapshots_no_delete
before delete on public.court_report_snapshots
for each row execute function public.reject_court_report_snapshot_mutation();

create index if not exists idx_court_report_snapshots_case_created
  on public.court_report_snapshots(case_id, created_at desc);

create index if not exists idx_court_report_snapshots_owner_created
  on public.court_report_snapshots(owner_id, created_at desc);

create index if not exists idx_court_report_snapshots_previous_hash
  on public.court_report_snapshots(previous_snapshot_hash)
  where previous_snapshot_hash is not null;
