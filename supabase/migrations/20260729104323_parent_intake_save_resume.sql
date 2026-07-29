alter table public.case_intake_status
  add column if not exists draft_answers jsonb not null default '{}'::jsonb,
  add column if not exists completed_section_keys text[] not null default '{}'::text[],
  add column if not exists current_section text not null default 'about_you',
  add column if not exists started_at timestamptz not null default now(),
  add column if not exists last_saved_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.case_intake_status'::regclass
      and conname = 'case_intake_status_draft_answers_object_check'
  ) then
    alter table public.case_intake_status
      add constraint case_intake_status_draft_answers_object_check
      check (jsonb_typeof(draft_answers) = 'object');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.case_intake_status'::regclass
      and conname = 'case_intake_status_current_section_check'
  ) then
    alter table public.case_intake_status
      add constraint case_intake_status_current_section_check
      check (
        current_section = any (array[
          'about_you',
          'cultural_identity',
          'communication_preferences',
          'family_household',
          'children',
          'parenting_circumstances',
          'child_safety_court',
          'current_strengths',
          'support_needs',
          'immediate_safety',
          'goals_program',
          'review'
        ]::text[])
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.case_intake_status'::regclass
      and conname = 'case_intake_status_completed_keys_check'
  ) then
    alter table public.case_intake_status
      add constraint case_intake_status_completed_keys_check
      check (
        completed_section_keys <@ array[
          'about_you',
          'cultural_identity',
          'communication_preferences',
          'family_household',
          'children',
          'parenting_circumstances',
          'child_safety_court',
          'current_strengths',
          'support_needs',
          'immediate_safety',
          'goals_program',
          'review'
        ]::text[]
      );
  end if;
end;
$$;

create or replace function public.ensure_parent_intake_case()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_profile public.profiles%rowtype;
  target_case_id uuid;
  active_case_count integer;
  family_name text;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into actor_profile
  from public.profiles
  where id = actor_id;

  if not found or actor_profile.role <> 'parent' then
    raise exception 'A SafeSteps parent profile is required';
  end if;

  if actor_profile.case_id is not null then
    select rc.id
    into target_case_id
    from public.reunification_cases rc
    join public.case_memberships cm
      on cm.case_id = rc.id
     and cm.user_id = actor_id
     and cm.status = 'active'
    where rc.id = actor_profile.case_id
      and rc.status = 'active'
    limit 1;
  end if;

  if target_case_id is null then
    select count(distinct cm.case_id), min(cm.case_id)
    into active_case_count, target_case_id
    from public.case_memberships cm
    join public.reunification_cases rc on rc.id = cm.case_id
    where cm.user_id = actor_id
      and cm.status = 'active'
      and rc.status = 'active';

    if active_case_count > 1 then
      raise exception 'Select a case before continuing intake';
    end if;
  end if;

  if target_case_id is null then
    family_name := coalesce(
      nullif(btrim(actor_profile.display_name), ''),
      nullif(btrim(actor_profile.preferred_name), ''),
      'My'
    );

    insert into public.reunification_cases (
      owner_id,
      parent_user_id,
      family_label,
      parent_carer_name,
      program_stream,
      assessment_type,
      status,
      opened_date,
      updated_at
    )
    values (
      actor_id,
      actor_id,
      family_name || ' family',
      nullif(btrim(actor_profile.display_name), ''),
      'Custom Program',
      'Intake Assessment',
      'active',
      current_date,
      now()
    )
    returning id into target_case_id;

    insert into public.case_memberships (
      case_id,
      user_id,
      membership_role,
      status,
      granted_by,
      metadata
    )
    values (
      target_case_id,
      actor_id,
      'case_owner',
      'active',
      actor_id,
      jsonb_build_object('source', 'parent_intake')
    )
    on conflict (case_id, user_id, membership_role) do update
      set status = 'active',
          revoked_at = null,
          metadata = public.case_memberships.metadata || excluded.metadata;
  end if;

  update public.profiles
  set case_id = target_case_id,
      onboarding_status = 'intake_in_progress',
      updated_at = now()
  where id = actor_id;

  insert into public.case_intake_status (
    case_id,
    parent_user_id,
    completed_sections,
    total_sections,
    current_section,
    started_at,
    updated_at
  )
  values (
    target_case_id,
    actor_id,
    0,
    12,
    'about_you',
    now(),
    now()
  )
  on conflict (case_id, parent_user_id) do nothing;

  return target_case_id;
end;
$$;

create or replace function public.save_parent_intake_step(
  target_case_id uuid,
  section_key text,
  section_answers jsonb,
  section_complete boolean,
  next_section_key text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  valid_sections constant text[] := array[
    'about_you',
    'cultural_identity',
    'communication_preferences',
    'family_household',
    'children',
    'parenting_circumstances',
    'child_safety_court',
    'current_strengths',
    'support_needs',
    'immediate_safety',
    'goals_program',
    'review'
  ]::text[];
  saved_keys text[];
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  if section_key is null or not (section_key = any(valid_sections)) then
    raise exception 'Invalid intake section';
  end if;

  if next_section_key is null or not (next_section_key = any(valid_sections)) then
    raise exception 'Invalid next intake section';
  end if;

  if section_answers is null
     or jsonb_typeof(section_answers) <> 'object'
     or octet_length(section_answers::text) > 32768 then
    raise exception 'Invalid intake answers';
  end if;

  if not exists (
    select 1
    from public.case_memberships cm
    where cm.case_id = target_case_id
      and cm.user_id = actor_id
      and cm.status = 'active'
      and cm.membership_role in ('case_owner', 'parent')
  ) then
    raise exception 'Active parent case membership required';
  end if;

  insert into public.case_intake_status (
    case_id,
    parent_user_id,
    total_sections,
    current_section,
    started_at,
    updated_at
  )
  values (
    target_case_id,
    actor_id,
    12,
    section_key,
    now(),
    now()
  )
  on conflict (case_id, parent_user_id) do nothing;

  select completed_section_keys
  into saved_keys
  from public.case_intake_status
  where case_id = target_case_id
    and parent_user_id = actor_id
  for update;

  if section_complete then
    select coalesce(array_agg(distinct key order by key), '{}'::text[])
    into saved_keys
    from unnest(saved_keys || array[section_key]) as key;
  else
    saved_keys := array_remove(saved_keys, section_key);
  end if;

  update public.case_intake_status
  set draft_answers = draft_answers || jsonb_build_object(section_key, section_answers),
      completed_section_keys = saved_keys,
      completed_sections = cardinality(saved_keys),
      total_sections = 12,
      current_section = next_section_key,
      completed_at = null,
      reviewer_state = 'not_required',
      reviewer_user_id = null,
      reviewer_notes = null,
      reviewed_at = null,
      last_saved_at = now(),
      updated_at = now()
  where case_id = target_case_id
    and parent_user_id = actor_id;
end;
$$;

create or replace function public.complete_parent_intake(target_case_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  completed_time timestamptz := now();
  saved_keys text[];
  needs_review boolean := false;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.case_memberships cm
    where cm.case_id = target_case_id
      and cm.user_id = actor_id
      and cm.status = 'active'
      and cm.membership_role in ('case_owner', 'parent')
  ) then
    raise exception 'Active parent case membership required';
  end if;

  select completed_section_keys
  into saved_keys
  from public.case_intake_status
  where case_id = target_case_id
    and parent_user_id = actor_id
  for update;

  if not found or cardinality(saved_keys) <> 12 then
    raise exception 'Complete every required intake section before continuing';
  end if;

  if not public.profile_ready_for_program(actor_id) then
    raise exception 'Required parent profile details are incomplete';
  end if;

  if not public.case_setup_ready_for_program(target_case_id) then
    raise exception 'Required family and case details are incomplete';
  end if;

  select exists (
    select 1
    from public.program_pathway_rules ppr
    join public.reunification_cases rc
      on rc.id = target_case_id
     and ppr.program_id = rc.program_stream
    where ppr.requires_worker_review
  )
  into needs_review;

  update public.case_intake_status
  set completed_sections = 12,
      total_sections = 12,
      completed_at = completed_time,
      current_section = 'review',
      reviewer_state = case when needs_review then 'pending' else 'not_required' end,
      reviewer_user_id = null,
      reviewer_notes = null,
      reviewed_at = null,
      last_saved_at = completed_time,
      updated_at = completed_time
  where case_id = target_case_id
    and parent_user_id = actor_id;

  update public.profiles
  set onboarding_status = 'onboarding_complete',
      updated_at = completed_time
  where id = actor_id;

  return completed_time;
end;
$$;

revoke all on function public.ensure_parent_intake_case() from public, anon;
revoke all on function public.save_parent_intake_step(uuid, text, jsonb, boolean, text) from public, anon;
revoke all on function public.complete_parent_intake(uuid) from public, anon;

grant execute on function public.ensure_parent_intake_case() to authenticated;
grant execute on function public.save_parent_intake_step(uuid, text, jsonb, boolean, text) to authenticated;
grant execute on function public.complete_parent_intake(uuid) to authenticated;
