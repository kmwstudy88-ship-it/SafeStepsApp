-- Automatic case binding for legacy single-case flows and database-level audit triggers.

create or replace function public.bind_single_case_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_case_id uuid;
  case_count integer;
begin
  if new.case_id is not null then return new; end if;

  select count(distinct cm.case_id)
  into case_count
  from public.case_memberships cm
  where cm.user_id = auth.uid() and cm.status = 'active';

  select cm.case_id
  into resolved_case_id
  from public.case_memberships cm
  where cm.user_id = auth.uid() and cm.status = 'active'
  order by cm.case_id::text
  limit 1;

  if case_count = 0 then
    raise exception 'active case membership required';
  end if;
  if case_count > 1 then
    raise exception 'case_id required when user has multiple active case memberships';
  end if;

  new.case_id := resolved_case_id;
  return new;
end;
$$;

drop trigger if exists evidence_items_bind_case on public.evidence_items;
create trigger evidence_items_bind_case
before insert on public.evidence_items
for each row execute function public.bind_single_case_before_insert();

drop trigger if exists parent_child_messages_bind_case on public.parent_child_messages;
create trigger parent_child_messages_bind_case
before insert on public.parent_child_messages
for each row execute function public.bind_single_case_before_insert();

create or replace function public.audit_evidence_upload_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.file_path is not null then
    perform public.record_sensitive_action(
      new.case_id,
      'upload_evidence',
      'evidence',
      new.id,
      'succeeded',
      jsonb_build_object('status', new.status, 'has_attachment', true)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists evidence_items_sensitive_audit on public.evidence_items;
create trigger evidence_items_sensitive_audit
after insert on public.evidence_items
for each row execute function public.audit_evidence_upload_after_insert();

create or replace function public.audit_assessment_edit_after_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.record_sensitive_action(
    new.case_id,
    'edit_assessment',
    'assessment',
    new.id,
    'succeeded',
    jsonb_build_object(
      'status_before', old.status,
      'status_after', new.status,
      'phase', new.phase
    )
  );
  return new;
end;
$$;

drop trigger if exists assessment_records_sensitive_audit on public.assessment_records;
create trigger assessment_records_sensitive_audit
after update on public.assessment_records
for each row execute function public.audit_assessment_edit_after_update();

-- Child messages cannot target a child outside the selected case.
create or replace function public.validate_parent_child_message_case()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.case_memberships cm
    where cm.case_id = new.case_id
      and cm.user_id = new.child_user_id
      and cm.membership_role = 'child'
      and cm.status = 'active'
  ) then
    raise exception 'child is not an active member of the selected case';
  end if;

  if new.parent_user_id is not null and not exists (
    select 1 from public.case_memberships cm
    where cm.case_id = new.case_id
      and cm.user_id = new.parent_user_id
      and cm.membership_role in ('case_owner','parent')
      and cm.status = 'active'
  ) then
    raise exception 'parent is not an active member of the selected case';
  end if;

  return new;
end;
$$;

drop trigger if exists parent_child_messages_validate_case on public.parent_child_messages;
create trigger parent_child_messages_validate_case
before insert or update on public.parent_child_messages
for each row execute function public.validate_parent_child_message_case();
