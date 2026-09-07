-- Co-occurring AOD, mental-health and DFV instrument v1.
-- The streams are physically separate to prevent accidental cross-stream joins or disclosure.

create table if not exists public.co_occurring_victim_survivor_assessments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  subject_reference text not null,
  instrument_id text not null check (instrument_id = 'co-occurring-aod-mh-dfv-risk-capacity'),
  instrument_version text not null,
  responses jsonb not null,
  response_notes jsonb not null default '{}'::jsonb,
  metadata jsonb not null,
  critical_override boolean not null default false,
  human_review_status text not null check (human_review_status in ('pending_human_review', 'critical_review_required')),
  readiness_decision text generated always as (null::text) stored,
  completed_by uuid not null references auth.users(id) on delete restrict,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.co_occurring_person_using_violence_assessments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.reunification_cases(id) on delete cascade,
  subject_reference text not null,
  instrument_id text not null check (instrument_id = 'co-occurring-aod-mh-dfv-risk-capacity'),
  instrument_version text not null,
  responses jsonb not null,
  response_notes jsonb not null default '{}'::jsonb,
  metadata jsonb not null,
  critical_override boolean not null default false,
  human_review_status text not null check (human_review_status in ('pending_human_review', 'critical_review_required')),
  readiness_decision text generated always as (null::text) stored,
  completed_by uuid not null references auth.users(id) on delete restrict,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.co_occurring_victim_survivor_assessments enable row level security;
alter table public.co_occurring_person_using_violence_assessments enable row level security;

revoke all on public.co_occurring_victim_survivor_assessments from public, anon, authenticated;
revoke all on public.co_occurring_person_using_violence_assessments from public, anon, authenticated;
grant select on public.co_occurring_victim_survivor_assessments to authenticated;
grant select on public.co_occurring_person_using_violence_assessments to authenticated;

create policy co_occurring_vs_authorised_select
on public.co_occurring_victim_survivor_assessments for select to authenticated
using (
  public.user_has_case_role(case_id, array['caseworker','supervisor','clinician','admin']::text[])
  and public.current_security_role() in ('caseworker','supervisor','clinician','admin','super_admin')
);

create policy co_occurring_puv_authorised_select
on public.co_occurring_person_using_violence_assessments for select to authenticated
using (
  public.user_has_case_role(case_id, array['caseworker','supervisor','clinician','admin']::text[])
  and public.current_security_role() in ('caseworker','supervisor','clinician','admin','super_admin')
);

create or replace function public.save_co_occurring_assessment_v1(
  target_case_id uuid,
  target_stream text,
  target_subject_reference text,
  target_responses jsonb,
  target_response_notes jsonb,
  target_metadata jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid := gen_random_uuid();
  allowed_values constant text[] := array['not_identified','possible','present','critical'];
  has_critical boolean;
  expected_count integer;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if public.current_security_role() not in ('caseworker','supervisor','clinician','admin','super_admin')
     or not public.user_has_case_role(target_case_id, array['caseworker','supervisor','clinician','admin']::text[]) then
    raise exception 'authorised assessment role and active case membership required';
  end if;
  if target_stream not in ('victim_survivor','person_using_violence') then raise exception 'invalid protected stream'; end if;
  if nullif(btrim(target_subject_reference), '') is null then raise exception 'subject reference required'; end if;
  if jsonb_typeof(target_responses) <> 'object' or jsonb_typeof(target_response_notes) <> 'object' then raise exception 'invalid response payload'; end if;
  if target_metadata ->> 'instrument_id' <> 'co-occurring-aod-mh-dfv-risk-capacity'
     or target_metadata ->> 'instrument_version' <> '1.0.0'
     or not (target_metadata ? 'readiness_decision')
     or target_metadata -> 'readiness_decision' <> 'null'::jsonb
     or target_metadata ->> 'readiness_decision_prohibited' <> 'true' then
    raise exception 'invalid governed instrument metadata';
  end if;
  expected_count := 5;
  if (select count(*) from jsonb_each_text(target_responses) r where r.value = any(allowed_values)) <> expected_count
     or jsonb_object_length(target_responses) <> expected_count then
    raise exception 'all instrument responses must use an allowed response level';
  end if;
  if target_stream = 'victim_survivor' and not target_responses ?& array[
    'vs-aod-overdose-withdrawal','vs-mh-acute-distress','vs-dfv-imminent-harm',
    'capacity-immediate-plan','capacity-service-engagement'
  ] then raise exception 'victim-survivor response keys required'; end if;
  if target_stream = 'person_using_violence' and not target_responses ?& array[
    'puv-aod-disinhibition','puv-mh-escalation','puv-dfv-current-pattern',
    'capacity-immediate-plan','capacity-service-engagement'
  ] then raise exception 'person-using-violence response keys required'; end if;
  -- Recompute overrides from governed answers. Client-provided override metadata is display/audit context only.
  has_critical := case
    when target_stream = 'victim_survivor' then
      target_responses ->> 'vs-aod-overdose-withdrawal' = 'critical'
      or target_responses ->> 'vs-mh-acute-distress' = 'critical'
      or target_responses ->> 'vs-dfv-imminent-harm' in ('present', 'critical')
      or target_responses ->> 'capacity-immediate-plan' = 'critical'
    else
      target_responses ->> 'puv-aod-disinhibition' = 'critical'
      or target_responses ->> 'puv-mh-escalation' = 'critical'
      or target_responses ->> 'puv-dfv-current-pattern' in ('present', 'critical')
      or target_responses ->> 'capacity-immediate-plan' = 'critical'
  end;

  if target_stream = 'victim_survivor' then
    insert into public.co_occurring_victim_survivor_assessments
      (id, case_id, subject_reference, instrument_id, instrument_version, responses, response_notes, metadata, critical_override, human_review_status, completed_by)
    values
      (new_id, target_case_id, btrim(target_subject_reference), target_metadata ->> 'instrument_id', target_metadata ->> 'instrument_version', target_responses, target_response_notes, target_metadata, has_critical,
       case when has_critical then 'critical_review_required' else 'pending_human_review' end, auth.uid());
  else
    insert into public.co_occurring_person_using_violence_assessments
      (id, case_id, subject_reference, instrument_id, instrument_version, responses, response_notes, metadata, critical_override, human_review_status, completed_by)
    values
      (new_id, target_case_id, btrim(target_subject_reference), target_metadata ->> 'instrument_id', target_metadata ->> 'instrument_version', target_responses, target_response_notes, target_metadata, has_critical,
       case when has_critical then 'critical_review_required' else 'pending_human_review' end, auth.uid());
  end if;
  return new_id;
end;
$$;

revoke all on function public.save_co_occurring_assessment_v1(uuid,text,text,jsonb,jsonb,jsonb) from public, anon;
grant execute on function public.save_co_occurring_assessment_v1(uuid,text,text,jsonb,jsonb,jsonb) to authenticated;

comment on column public.co_occurring_victim_survivor_assessments.readiness_decision is 'Always NULL by design. Readiness decisions are prohibited in this instrument.';
comment on column public.co_occurring_person_using_violence_assessments.readiness_decision is 'Always NULL by design. Readiness decisions are prohibited in this instrument.';
