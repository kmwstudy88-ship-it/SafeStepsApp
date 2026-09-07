begin;
alter table public.personal_ai_launch_signoffs
  add column if not exists review_domain text,
  add column if not exists reviewer_name text,
  add column if not exists review_scope text,
  add column if not exists condition_text text,
  add column if not exists condition_owner_user_id uuid references auth.users(id) on delete set null,
  add column if not exists condition_due_at timestamptz,
  add column if not exists condition_resolved_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

update public.personal_ai_launch_signoffs set
  review_domain = coalesce(review_domain, case
    when signoff_role='safeguarding_lead' or signoff_role='child_safety_reviewer' then 'safeguarding'
    when signoff_role='clinical_reviewer' then 'clinical'
    when signoff_role='dv_specialist' then 'domestic_violence'
    when signoff_role='substance_use_specialist' then 'substance_use'
    when signoff_role='privacy_security_reviewer' then 'privacy_security'
    when signoff_role='jurisdiction_reviewer' then 'jurisdiction_legal'
    else 'product_ux' end),
  reviewer_name = coalesce(reviewer_name,'Legacy reviewer ' || left(signer_user_id::text,8)),
  review_scope = coalesce(review_scope,'Legacy approval migrated for release ' || release_version);
alter table public.personal_ai_launch_signoffs alter column review_domain set not null;
alter table public.personal_ai_launch_signoffs alter column reviewer_name set not null;
alter table public.personal_ai_launch_signoffs alter column review_scope set not null;

alter table public.personal_ai_launch_signoffs drop constraint if exists personal_ai_launch_signoffs_decision_check;
alter table public.personal_ai_launch_signoffs drop constraint if exists personal_ai_launch_signoffs_release_version_signoff_role_signer_user_id_key;
alter table public.personal_ai_launch_signoffs add constraint personal_ai_launch_signoffs_decision_check check (decision in ('approved','rejected','conditional'));
alter table public.personal_ai_launch_signoffs add constraint personal_ai_launch_signoffs_domain_check check (review_domain in ('safeguarding','clinical','domestic_violence','substance_use','privacy_security','jurisdiction_legal','product_ux'));
alter table public.personal_ai_launch_signoffs add constraint personal_ai_launch_signoffs_scope_required check (char_length(review_scope) between 10 and 2000);
alter table public.personal_ai_launch_signoffs add constraint personal_ai_launch_signoffs_reviewer_required check (char_length(reviewer_name) between 2 and 200);
alter table public.personal_ai_launch_signoffs add constraint personal_ai_launch_signoffs_conditional_fields check (
  decision <> 'conditional' or (condition_text is not null and char_length(condition_text) >= 10 and condition_owner_user_id is not null and condition_due_at is not null and condition_resolved_at is null)
);

create table if not exists public.personal_ai_release_packages (
  id uuid primary key default gen_random_uuid(),
  release_version text not null unique,
  status text not null default 'draft' check (status in ('draft','in_review','approved','released','withdrawn')),
  change_summary text not null,
  prior_version_diff_reference text not null,
  test_results_reference text not null,
  known_risks text[] not null default '{}',
  rollback_plan_reference text not null,
  jurisdiction_notes_reference text not null,
  escalation_changes_reference text not null,
  validator_changes_reference text not null,
  referral_updates_reference text not null,
  memory_changes_reference text not null,
  prepared_by_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.personal_ai_release_packages enable row level security;
revoke all on public.personal_ai_release_packages from anon,authenticated;
grant select,insert,update on public.personal_ai_release_packages to authenticated;
create policy personal_ai_release_packages_staff_read on public.personal_ai_release_packages for select to authenticated
using(public.current_user_has_role('admin') or public.current_user_has_role('caseworker'));
create policy personal_ai_release_packages_admin_insert on public.personal_ai_release_packages for insert to authenticated
with check(public.current_user_has_role('admin') and prepared_by_user_id=(select auth.uid()));
create policy personal_ai_release_packages_admin_update on public.personal_ai_release_packages for update to authenticated
using(public.current_user_has_role('admin')) with check(public.current_user_has_role('admin'));
create index if not exists personal_ai_launch_signoffs_conditions_idx on public.personal_ai_launch_signoffs(release_version,decision,condition_due_at);
comment on table public.personal_ai_release_packages is 'Versioned evidence packet required before governance review. References must point to controlled artifacts, not raw disclosure content.';
comment on table public.personal_ai_launch_signoffs is 'Append-only, scope-limited review log. The latest dated decision for each role controls launch readiness; conditional decisions remain blocking until superseded by explicit approval.';
commit;
