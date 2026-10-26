-- Transparent intake-based program recommendation and explicit parent confirmation.

alter table public.program_pathway_rules
  add column if not exists intake_stream_label text,
  add column if not exists launch_status text not null default 'structured_draft';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'program_pathway_rules_launch_status_check'
      and conrelid = 'public.program_pathway_rules'::regclass
  ) then
    alter table public.program_pathway_rules
      add constraint program_pathway_rules_launch_status_check
      check (launch_status in ('launch', 'structured_draft', 'custom'));
  end if;
end;
$$;

create unique index if not exists idx_program_pathway_rules_intake_stream
  on public.program_pathway_rules(intake_stream_label)
  where intake_stream_label is not null;

update public.program_pathway_rules as rules
set intake_stream_label = source.intake_stream_label,
    launch_status = source.launch_status,
    requires_worker_review = source.requires_worker_review,
    updated_at = now()
from (
  values
    ('intensive-reunification', '24 Month Reunification', 'launch', true),
    ('home-again', null, 'launch', true),
    ('keeping-families-together', '18 Month Keeping Families Together', 'structured_draft', true),
    ('back-on-track', '12 Month Back on Track', 'structured_draft', false),
    ('build-stronger-families', '6 Month Build Stronger Families', 'structured_draft', false),
    ('child-safety-contact', '12 Week Child Safety Contact Program', 'structured_draft', true),
    ('custom-program', 'Custom Program', 'custom', true)
) as source(program_id, intake_stream_label, launch_status, requires_worker_review)
where rules.program_id = source.program_id;

create table if not exists public.program_recommendations (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  program_id text not null,
  source_stream text not null,
  status text not null default 'confirmed' check (status = 'confirmed'),
  confirmed_at timestamptz not null default now(),
  unique (case_id, parent_user_id)
);

create index if not exists idx_program_recommendations_parent
  on public.program_recommendations(parent_user_id, confirmed_at desc);

alter table public.program_recommendations enable row level security;

drop policy if exists program_recommendations_parent_read
  on public.program_recommendations;
create policy program_recommendations_parent_read
  on public.program_recommendations
  for select
  to authenticated
  using (
    parent_user_id = (select auth.uid())
    and public.user_has_active_case_membership(case_id)
  );

revoke all on table public.program_recommendations from public, anon;
grant select on table public.program_recommendations to authenticated;

create or replace function public.confirm_program_recommendation(
  target_case_id uuid,
  target_program_id text
)
returns public.program_recommendations
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  selected_stream text;
  recommended_program_id text;
  intake_record public.case_intake_status%rowtype;
  recommendation public.program_recommendations%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;
  if not public.user_has_case_role(
    target_case_id,
    array['case_owner','parent']::text[]
  ) then
    raise exception 'Active parent case membership required';
  end if;

  select rc.program_stream
  into selected_stream
  from public.reunification_cases rc
  where rc.id = target_case_id;

  select ppr.program_id
  into recommended_program_id
  from public.program_pathway_rules ppr
  where ppr.intake_stream_label = selected_stream;

  if recommended_program_id is null then
    raise exception 'Saved intake pathway does not map to an available program';
  end if;
  if target_program_id <> recommended_program_id then
    raise exception 'Only the program matching the saved intake pathway can be confirmed';
  end if;

  select *
  into intake_record
  from public.case_intake_status cis
  where cis.case_id = target_case_id
    and cis.parent_user_id = actor_id;

  if intake_record.id is null
    or intake_record.completed_at is null
    or intake_record.completed_sections < intake_record.total_sections then
    raise exception 'Completed intake required before program confirmation';
  end if;

  insert into public.program_recommendations(
    case_id,
    parent_user_id,
    program_id,
    source_stream,
    status,
    confirmed_at
  )
  values (
    target_case_id,
    actor_id,
    recommended_program_id,
    selected_stream,
    'confirmed',
    now()
  )
  on conflict (case_id, parent_user_id) do update
  set program_id = excluded.program_id,
      source_stream = excluded.source_stream,
      status = 'confirmed',
      confirmed_at = now()
  returning * into recommendation;

  return recommendation;
end;
$$;

create or replace function public.assert_program_start_gate(
  target_case_id uuid,
  target_user_id uuid,
  target_program_id text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  intake_record public.case_intake_status%rowtype;
  needs_review boolean := false;
  pathway_launch_status text;
  recommended_program_id text;
begin
  if not public.user_has_active_case_membership(target_case_id) then
    raise exception 'Active case membership required';
  end if;
  if target_user_id <> auth.uid() then
    raise exception 'Program can only be started for the signed-in user';
  end if;
  if not public.user_has_case_role(
    target_case_id,
    array['case_owner','parent']::text[]
  ) then
    raise exception 'Parent case membership required';
  end if;
  if not public.profile_ready_for_program(target_user_id) then
    raise exception 'Required profile setup is incomplete';
  end if;
  if not public.case_setup_ready_for_program(target_case_id) then
    raise exception 'Required case setup is incomplete';
  end if;

  select *
  into intake_record
  from public.case_intake_status cis
  where cis.case_id = target_case_id
    and cis.parent_user_id = target_user_id;

  if intake_record.id is null
    or intake_record.completed_at is null
    or intake_record.completed_sections < intake_record.total_sections then
    raise exception 'Completed intake required before program start';
  end if;

  select ppr.program_id, ppr.requires_worker_review, ppr.launch_status
  into recommended_program_id, needs_review, pathway_launch_status
  from public.program_pathway_rules ppr
  join public.reunification_cases rc
    on rc.id = target_case_id
   and rc.program_stream = ppr.intake_stream_label;

  if recommended_program_id is null then
    raise exception 'Saved intake pathway does not map to an available program';
  end if;
  if target_program_id <> recommended_program_id then
    raise exception 'Program must match the saved intake recommendation';
  end if;
  if not exists (
    select 1
    from public.program_recommendations pr
    where pr.case_id = target_case_id
      and pr.parent_user_id = target_user_id
      and pr.program_id = target_program_id
      and pr.status = 'confirmed'
  ) then
    raise exception 'Parent confirmation required before program start';
  end if;
  if pathway_launch_status = 'structured_draft' then
    raise exception 'This pathway is still in governance review and cannot accept enrolments';
  end if;
  if needs_review and intake_record.reviewer_state <> 'approved' then
    raise exception 'Worker approval required before this pathway can start';
  end if;

  return intake_record.id;
end;
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
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  intake_id uuid;
  needs_review boolean := false;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;
  if not public.user_has_case_role(
    target_case_id,
    array['case_owner','parent']::text[]
  ) then
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

  select coalesce(ppr.requires_worker_review, false)
  into needs_review
  from public.reunification_cases rc
  left join public.program_pathway_rules ppr
    on ppr.intake_stream_label = rc.program_stream
  where rc.id = target_case_id;

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
    case_id,
    parent_user_id,
    completed_sections,
    total_sections,
    completed_at,
    reviewer_state,
    updated_at
  )
  values (
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

revoke execute on function public.confirm_program_recommendation(uuid, text)
  from public, anon;
revoke execute on function public.assert_program_start_gate(uuid, uuid, text)
  from public, anon;
revoke execute on function public.complete_case_intake(uuid, uuid, jsonb, integer, integer)
  from public, anon;

grant execute on function public.confirm_program_recommendation(uuid, text)
  to authenticated;
grant execute on function public.assert_program_start_gate(uuid, uuid, text)
  to authenticated;
grant execute on function public.complete_case_intake(uuid, uuid, jsonb, integer, integer)
  to authenticated;
