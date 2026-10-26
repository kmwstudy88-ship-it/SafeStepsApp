begin;
create table if not exists public.personal_ai_launch_readiness_checks (
  id uuid primary key default gen_random_uuid(), release_version text not null, area text not null,
  status text not null default 'pending' check (status in ('pass','fail','pending')), required boolean not null default true,
  evidence_reference text check (char_length(evidence_reference) <= 1000), notes text check (char_length(notes) <= 2000),
  owner_user_id uuid references auth.users(id) on delete set null, reviewed_by_user_id uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz, updated_at timestamptz not null default now(), unique(release_version,area)
);
create table if not exists public.personal_ai_launch_signoffs (
  id uuid primary key default gen_random_uuid(), release_version text not null,
  signoff_role text not null check (signoff_role in ('safeguarding_lead','clinical_reviewer','privacy_security_reviewer','engineering_lead','product_owner','jurisdiction_reviewer','dv_specialist','child_safety_reviewer','substance_use_specialist')),
  signer_user_id uuid not null references auth.users(id) on delete restrict, decision text not null check (decision in ('approved','rejected')),
  evidence_reference text not null, notes text check (char_length(notes) <= 1000), signed_at timestamptz not null default now(),
  unique(release_version,signoff_role,signer_user_id)
);
create index if not exists personal_ai_launch_checks_release_idx on public.personal_ai_launch_readiness_checks(release_version,status,required);
create index if not exists personal_ai_launch_signoffs_release_idx on public.personal_ai_launch_signoffs(release_version,signoff_role,decision);
alter table public.personal_ai_launch_readiness_checks enable row level security;
alter table public.personal_ai_launch_signoffs enable row level security;
revoke all on public.personal_ai_launch_readiness_checks, public.personal_ai_launch_signoffs from anon,authenticated;
grant select,insert,update on public.personal_ai_launch_readiness_checks to authenticated;
grant select,insert on public.personal_ai_launch_signoffs to authenticated;
create policy personal_ai_launch_checks_staff_read on public.personal_ai_launch_readiness_checks for select to authenticated using(public.current_user_has_role('admin') or public.current_user_has_role('caseworker'));
create policy personal_ai_launch_checks_admin_insert on public.personal_ai_launch_readiness_checks for insert to authenticated with check(public.current_user_has_role('admin'));
create policy personal_ai_launch_checks_admin_update on public.personal_ai_launch_readiness_checks for update to authenticated using(public.current_user_has_role('admin')) with check(public.current_user_has_role('admin'));
create policy personal_ai_launch_signoffs_staff_read on public.personal_ai_launch_signoffs for select to authenticated using(public.current_user_has_role('admin') or public.current_user_has_role('caseworker'));
create policy personal_ai_launch_signoffs_admin_insert on public.personal_ai_launch_signoffs for insert to authenticated with check(public.current_user_has_role('admin') and signer_user_id=(select auth.uid()));
comment on table public.personal_ai_launch_readiness_checks is 'A release is NO-GO while any required check is pending or failed, any Sev 1 incident is unresolved, or required independent sign-offs are missing.';
commit;
