-- SafeSteps intake and program-start gate.
-- UI checks explain the gate; these database rules prevent direct insert and deep-link bypass.

create table if not exists public.case_intake_status (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  completed_sections integer not null default 0 check (completed_sections >= 0),
  total_sections integer not null default 12 check (total_sections > 0),
  completed_at timestamptz,
  reviewer_state text not null default 'not_required' check (reviewer_state in ('not_required','pending','approved','changes_required')),
  reviewer_user_id uuid references auth.users(id),
  reviewer_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(case_id, parent_user_id)
);

create index if not exists idx_case_intake_status_case_parent
  on public.case_intake_status(case_id, parent_user_id);
create index if not exists idx_case_intake_status_review_queue
  on public.case_intake_status(reviewer_state, completed_at)
  where reviewer_state in ('pending','changes_required');

create table if not exists public.program_pathway_rules (
  program_id text primary key,
  risk_level text not null check (risk_level in ('low','medium','high','very_high','custom')),
  requires_worker_review boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.program_pathway_rules(program_id, risk_level, requires_worker_review)
values
  ('intensive-reunification', 'very_high', true),
  ('home-again', 'high', true),
  ('keeping-families-together', 'high', true),
  ('back-on-track', 'medium', false),
  ('build-stronger-families', 'low', false),
  ('child-safety-contact', 'custom', false),
  ('custom-program', 'custom', false)
on conflict (program_id) do update
set risk_level = excluded.risk_level,
    requires_worker_review = excluded.requires_worker_review,
    updated_at = now();

alter table public.program_enrollments
  add column if not exists case_id uuid references public.reunification_cases(id) on delete cascade,
  add column if not exists intake_status_id uuid references public.case_intake_status(id),
  add column if not exists gate_checked_at timestamptz;

create index if not exists idx_program_enrollments_case_program
  on public.program_enrollments(case_id, program_id, status);

create or replace function public.profile_ready_for_program(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = target_user_id
      and nullif(btrim(coalesce(p.display_name, '')), '') is not null
      and nullif(btrim(coalesce(p.story_goal, '')), '') is not null
      and nullif(btrim(coalesce(p.strengths, '')), '') is not null
      and nullif(btrim(coalesce(p.support_notes, '')), '') is not null
  );
$$;

create or replace function public.case_setup_ready_for_program(target_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.reunification_cases rc
    where rc.id = target_case_id
      and nullif(btrim(coalesce(rc.family_label, '')), '') is not null
      and nullif(btrim(coalesce(rc.parent_carer_name, '')), '') is not null
      and coalesce(cardinality(rc.child_names), 0) > 0
      and nullif(btrim(coalesce(rc.program_stream, '')), '') is not null
      and nullif(btrim(coalesce(rc.assessment_type, '')), '') is not null
      and coalesce(cardinality(rc.case_goals), 0) > 0
  );
$$;

create or replace function public.complete_case_intake(
  target_case_id uuid,
  target_assessment_id uuid,
  intake_answers jsonb,
  completed_section_count integer,
  total_section_count integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  intake_id uuid;
  needs_review boolean := false;
begin
  if actor_id is null then raise exception 'Authentication required'; end if;
  if not public.user_has_case_role(target_case_id, array['case_owner','parent']::text[]) then
    raise exception 'Active parent case membership required';
  end if;
  if completed_section_count < total_section_count or total_section_count <= 0 then
    raise exception 'Every required intake section must be complete';
  end if;
  if not public.profile_ready_for_program(actor_id) then
    raise exception 'Required profile setup is incomplete';
  end if;
  if not public.case_setup_ready_for_program(target_case_id) then
    raise exception 'Required case setup is incomplete';
  end if;

  select exists (
    select 1 from public.program_pathway_rules ppr
    join public.reunification_cases rc on rc.id = target_case_id
    where ppr.program_id = rc.program_stream and ppr.requires_worker_review
  ) into needs_review;

  insert into public.assessment_responses(assessment_id, user_id, responses)
  values (
    target_assessment_id,
    actor_id,
    jsonb_build_object(
      'assessmentType', 'intake',
      'completedSections', completed_section_count,
      'answers', intake_answers,
      'intakeComplete', true,
      'completedAt', now()
    )
  );

  insert into public.case_intake_status(
    case_id, parent_user_id, completed_sections, total_sections, completed_at, reviewer_state, updated_at
  ) values (
    target_case_id,
    actor_id,
    completed_section_count,
    total_section_count,
    now(),
    case when needs_review then 'pending' else 'not_required' end,
    now()
  )
  on conflict (case_id, parent_user_id) do update
  set completed_sections = excluded.completed_sections,
      total_sections = excluded.total_sections,
      completed_at = excluded.completed_at,
      reviewer_state = case when needs_review then 'pending' else 'not_required' end,
      reviewer_user_id = null,
      reviewer_notes = null,
      reviewed_at = null,
      updated_at = now()
  returning id into intake_id;

  return intake_id;
end;
$$;

grant execute on function public.complete_case_intake(uuid, uuid, jsonb, integer, integer) to authenticated;

create or replace function public.review_case_intake(
  target_case_id uuid,
  next_reviewer_state text,
  next_reviewer_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null then raise exception 'Authentication required'; end if;
  if next_reviewer_state not in ('approved','changes_required') then
    raise exception 'Invalid reviewer state';
  end if;
  if not public.user_has_case_role(target_case_id, array['caseworker','supervisor','admin']::text[]) then
    raise exception 'Assigned worker, supervisor, or admin review required';
  end if;

  update public.case_intake_status
  set reviewer_state = next_reviewer_state,
      reviewer_user_id = actor_id,
      reviewer_notes = nullif(btrim(coalesce(next_reviewer_notes, '')), ''),
      reviewed_at = now(),
      updated_at = now()
  where case_id = target_case_id and completed_at is not null;

  if not found then raise exception 'Completed intake not found for this case'; end if;
end;
$$;

grant execute on function public.review_case_intake(uuid, text, text) to authenticated;

create or replace function public.assert_program_start_gate(
  target_case_id uuid,
  target_user_id uuid,
  target_program_id text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  intake_record public.case_intake_status%rowtype;
  needs_review boolean := false;
begin
  if not public.user_has_active_case_membership(target_case_id) then
    raise exception 'Active case membership required';
  end if;
  if target_user_id <> auth.uid() then raise exception 'Program can only be started for the signed-in user'; end if;
  if not public.user_has_case_role(target_case_id, array['case_owner','parent']::text[]) then
    raise exception 'Parent case membership required';
  end if;
  if not public.profile_ready_for_program(target_user_id) then raise exception 'Required profile setup is incomplete'; end if;
  if not public.case_setup_ready_for_program(target_case_id) then raise exception 'Required case setup is incomplete'; end if;

  select * into intake_record
  from public.case_intake_status cis
  where cis.case_id = target_case_id and cis.parent_user_id = target_user_id;

  if intake_record.id is null or intake_record.completed_at is null or intake_record.completed_sections < intake_record.total_sections then
    raise exception 'Completed intake required before program start';
  end if;

  select coalesce(requires_worker_review, false) into needs_review
  from public.program_pathway_rules where program_id = target_program_id;

  if needs_review and intake_record.reviewer_state <> 'approved' then
    raise exception 'Worker approval required before this higher-risk pathway can start';
  end if;

  return intake_record.id;
end;
$$;

create or replace function public.start_program_enrollment(
  target_case_id uuid,
  target_program_id text
)
returns public.program_enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  intake_id uuid;
  enrollment public.program_enrollments%rowtype;
begin
  if actor_id is null then raise exception 'Authentication required'; end if;
  intake_id := public.assert_program_start_gate(target_case_id, actor_id, target_program_id);

  select * into enrollment
  from public.program_enrollments pe
  where pe.owner_id = actor_id and pe.case_id = target_case_id and pe.program_id = target_program_id and pe.status = 'active'
  limit 1;
  if enrollment.id is not null then return enrollment; end if;

  insert into public.program_enrollments(owner_id, case_id, program_id, status, intake_status_id, gate_checked_at)
  values (actor_id, target_case_id, target_program_id, 'active', intake_id, now())
  returning * into enrollment;
  return enrollment;
end;
$$;

grant execute on function public.start_program_enrollment(uuid, text) to authenticated;

create or replace function public.enforce_program_enrollment_gate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.case_id is null then raise exception 'case_id is required for program enrollment'; end if;
  new.intake_status_id := public.assert_program_start_gate(new.case_id, new.owner_id, new.program_id);
  new.gate_checked_at := now();
  return new;
end;
$$;

drop trigger if exists program_enrollment_start_gate on public.program_enrollments;
create trigger program_enrollment_start_gate
before insert on public.program_enrollments
for each row execute function public.enforce_program_enrollment_gate();

alter table public.case_intake_status enable row level security;
alter table public.program_pathway_rules enable row level security;

drop policy if exists case_intake_status_select on public.case_intake_status;
create policy case_intake_status_select on public.case_intake_status for select to authenticated using (
  parent_user_id = (select auth.uid())
  or public.user_has_case_role(case_id, array['caseworker','supervisor','admin']::text[])
);

drop policy if exists case_intake_status_no_direct_insert on public.case_intake_status;
create policy case_intake_status_no_direct_insert on public.case_intake_status for insert to authenticated with check (false);
drop policy if exists case_intake_status_no_direct_update on public.case_intake_status;
create policy case_intake_status_no_direct_update on public.case_intake_status for update to authenticated using (false) with check (false);

drop policy if exists program_pathway_rules_read on public.program_pathway_rules;
create policy program_pathway_rules_read on public.program_pathway_rules for select to authenticated using (true);

-- Existing legacy rows are case-bound only where the owner has exactly one active parent/case-owner membership.
with single_case as (
  select user_id, (array_agg(case_id order by case_id::text))[1] as case_id
  from public.case_memberships
  where status = 'active' and membership_role in ('case_owner','parent')
  group by user_id
  having count(distinct case_id) = 1
)
update public.program_enrollments pe
set case_id = sc.case_id
from single_case sc
where pe.owner_id = sc.user_id and pe.case_id is null;
