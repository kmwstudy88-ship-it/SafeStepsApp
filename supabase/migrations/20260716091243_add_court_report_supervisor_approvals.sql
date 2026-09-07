-- SAFE STEPS COURT REPORT SUPERVISOR APPROVALS
-- Append-only supervisor decisions used by the court report export gate.

create extension if not exists pgcrypto;

create table if not exists public.court_report_supervisor_approvals (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  snapshot_hash text,
  approved boolean not null default false,
  reviewed_by uuid not null default auth.uid(),
  reviewer_name text,
  review_notes text not null default '',
  approval_scope text not null default 'report_export'
    check (approval_scope in ('report_export', 'snapshot_export', 'case_review')),
  created_at timestamptz not null default now()
);

alter table public.court_report_supervisor_approvals enable row level security;

drop policy if exists court_report_supervisor_approvals_select on public.court_report_supervisor_approvals;
create policy court_report_supervisor_approvals_select on public.court_report_supervisor_approvals
for select to authenticated
using (
  reviewed_by = (select auth.uid())
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

drop policy if exists court_report_supervisor_approvals_insert on public.court_report_supervisor_approvals;
create policy court_report_supervisor_approvals_insert on public.court_report_supervisor_approvals
for insert to authenticated
with check (
  reviewed_by = (select auth.uid())
  and (
    public.can_manage_assessments()
    or exists (
      select 1
      from public.reunification_cases c
      where c.id = case_id
        and c.worker_user_id = (select auth.uid())
    )
  )
);

create or replace function public.reject_court_report_supervisor_approval_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'court_report_supervisor_approvals are immutable; create a new approval decision instead';
end;
$$;

drop trigger if exists court_report_supervisor_approvals_no_update on public.court_report_supervisor_approvals;
create trigger court_report_supervisor_approvals_no_update
before update on public.court_report_supervisor_approvals
for each row execute function public.reject_court_report_supervisor_approval_mutation();

drop trigger if exists court_report_supervisor_approvals_no_delete on public.court_report_supervisor_approvals;
create trigger court_report_supervisor_approvals_no_delete
before delete on public.court_report_supervisor_approvals
for each row execute function public.reject_court_report_supervisor_approval_mutation();

create index if not exists idx_court_report_supervisor_approvals_case_created
  on public.court_report_supervisor_approvals(case_id, created_at desc);

create index if not exists idx_court_report_supervisor_approvals_snapshot
  on public.court_report_supervisor_approvals(snapshot_hash)
  where snapshot_hash is not null;
