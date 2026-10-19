-- Local review candidate. Narrow carer-source access; no general case-note writer grant.
do $$ begin
  if exists(select 1 from public.case_notes where note_type in ('carer_daily_update','carer_achievement','carer_concern')) then
    raise exception 'Inventory existing carer-source records before adopting the immutable-source contract'; end if;
end $$;
create schema carer_journal_private;
revoke all on schema carer_journal_private from public,anon;
grant usage on schema carer_journal_private to authenticated;
create function carer_journal_private.author_allowed(p_case uuid,p_tenant uuid,p_action text) returns boolean
language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and exists(select 1 from public.cases c
    join public.platform_tenants pt on pt.id=c.tenant_id and pt.tenant_status='active'
    join public.case_participants cp on cp.case_id=c.id and cp.tenant_id=c.tenant_id and cp.user_id=auth.uid()
    join public.tenant_memberships tm on tm.tenant_id=c.tenant_id and tm.user_id=auth.uid()
    where c.id=p_case and c.tenant_id=p_tenant and c.status='active' and coalesce(c.case_status_code,'active')<>'closed'
      and coalesce(cp.participant_role,cp.participant_type)='carer' and cp.status='active' and cp.participation_status='active'
      and cp.effective_from<=statement_timestamp() and (cp.effective_to is null or cp.effective_to>statement_timestamp())
      and cp.participation_start_at<=statement_timestamp() and (cp.participation_end_at is null or cp.participation_end_at>statement_timestamp())
      and cp.allowed_actions @> array['carer.portal.read',p_action]::text[]
      and not (cp.denied_actions && array['carer.portal.read',p_action]::text[])
      and tm.membership_status='active' and tm.revoked_at is null and tm.suspended_at is null
      and tm.effective_from<=statement_timestamp() and (tm.effective_to is null or tm.effective_to>statement_timestamp())
      and not exists(select 1 from public.case_participants denied where denied.case_id=c.id and denied.user_id=auth.uid()
        and denied.status='active' and denied.participation_status='active'
        and denied.effective_from<=statement_timestamp() and (denied.effective_to is null or denied.effective_to>statement_timestamp())
        and denied.participation_start_at<=statement_timestamp() and (denied.participation_end_at is null or denied.participation_end_at>statement_timestamp())
        and denied.denied_actions && array['carer.portal.read',p_action]::text[]))
$$;
create function carer_journal_private.can_read_source(p_note uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.case_notes n
    join public.cases c on c.id=n.case_id and c.tenant_id=n.tenant_id
    join public.platform_tenants pt on pt.id=c.tenant_id and pt.tenant_status='active'
    join public.tenant_memberships tm on tm.tenant_id=c.tenant_id and tm.user_id=auth.uid()
    where n.id=p_note and n.note_type in ('carer_daily_update','carer_achievement','carer_concern')
      and tm.membership_status='active' and tm.revoked_at is null and tm.suspended_at is null
      and tm.effective_from<=statement_timestamp() and (tm.effective_to is null or tm.effective_to>statement_timestamp())
      and ((n.author_user_id=auth.uid() and carer_journal_private.author_allowed(c.id,c.tenant_id,'carer.portal.read')) or
        exists(select 1 from public.case_allocations ca where ca.case_id=c.id and ca.tenant_id=c.tenant_id
          and ca.allocated_user_id=auth.uid() and ca.allocation_status='active' and ca.ended_at is null and ca.allocated_at<=statement_timestamp()
          and ca.allocation_role in ('primary_worker','secondary_worker','family_support_worker','child_specialist','provider_coordinator','primary_supervisor','clinical_supervisor')) or
        public.is_case_team_member(c.id)))
$$;
create function carer_journal_private.guard_source() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if tg_op<>'INSERT' then
    if old.note_type in ('carer_daily_update','carer_achievement','carer_concern') or
      (tg_op='UPDATE' and new.note_type in ('carer_daily_update','carer_achievement','carer_concern')) then
      raise exception 'Carer observations are retained; record a separate professional review or amendment' using errcode='42501';
    end if;
    if tg_op='DELETE' then return old; else return new; end if;
  end if;
  if new.note_type is null or new.note_type not in ('carer_daily_update','carer_achievement','carer_concern') then return new; end if;
  if new.author_user_id is distinct from auth.uid() or
    not carer_journal_private.author_allowed(new.case_id,new.tenant_id,'carer.journal.create') or
    new.note_status is distinct from 'draft' or new.visibility_level is distinct from 'worker_only' or
    new.family_shared is distinct from false or new.child_shared is distinct from false or new.court_exportable is distinct from false or
    new.legal_restricted is distinct from false or new.finalised_at is not null or new.amended_note_id is not null or
    new.note_reference is distinct from ('CARER-'||new.id::text) or new.user_id is not null or new.family_id is not null or new.note is not null or
    new.note_title is null or char_length(btrim(new.note_title))=0 or char_length(new.note_title)>160 or
    new.note_body is null or char_length(btrim(new.note_body))=0 or char_length(new.note_body)>10000 then
    raise exception 'Current author and private bounded carer-source fields required' using errcode='42501'; end if;
  new.created_at=statement_timestamp();new.updated_at=statement_timestamp();
  return new;
end $$;
revoke all on function carer_journal_private.author_allowed(uuid,uuid,text),carer_journal_private.can_read_source(uuid),
  carer_journal_private.guard_source() from public,anon,authenticated;
grant execute on function carer_journal_private.author_allowed(uuid,uuid,text),carer_journal_private.can_read_source(uuid) to authenticated;
create policy carer_sources_insert on public.case_notes for insert to authenticated with check (
  note_type in ('carer_daily_update','carer_achievement','carer_concern') and author_user_id=auth.uid()
  and carer_journal_private.author_allowed(case_id,tenant_id,'carer.journal.create'));
create policy carer_sources_read on public.case_notes for select to authenticated using(carer_journal_private.can_read_source(id));
create policy carer_sources_scope on public.case_notes as restrictive for select to authenticated using(
  coalesce(note_type,'') not in ('carer_daily_update','carer_achievement','carer_concern') or carer_journal_private.can_read_source(id));
create trigger carer_source_guard before insert or update or delete on public.case_notes
  for each row execute function carer_journal_private.guard_source();
create function carer_journal_private.submit_carer_journal(
  p_case_id uuid, p_submission_id uuid, p_kind text, p_title text, p_detail text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer;
begin
  if auth.uid() is null then
    raise exception 'Sign in to submit a carer update' using errcode = '42501';
  end if;
  if p_case_id is null or p_submission_id is null or p_kind is null or
     p_kind not in ('daily_update', 'achievement', 'concern') or
     p_title is null or char_length(btrim(p_title)) = 0 or char_length(p_title) > 160 or
     p_detail is null or char_length(btrim(p_detail)) = 0 or char_length(p_detail) > 10000 then
    raise exception 'Invalid carer journal entry' using errcode = '22023';
  end if;

  insert into public.case_notes (
    id, tenant_id, case_id, note_reference, note_type, note_title, note_body,
    note_status, visibility_level, family_shared, child_shared, court_exportable,
    legal_restricted, author_user_id
  )
  select p_submission_id, c.tenant_id, c.id, 'CARER-' || p_submission_id::text,
    'carer_' || p_kind, btrim(p_title), btrim(p_detail), 'draft', 'worker_only',
    false, false, false, false, auth.uid()
  from public.cases c join public.platform_tenants pt on pt.id=c.tenant_id and pt.tenant_status='active'
  where c.id = p_case_id and c.tenant_id is not null and c.status = 'active'
    and (c.case_status_code is null or c.case_status_code <> 'closed')
    and exists (
      select 1 from public.tenant_memberships tm
      where tm.tenant_id = c.tenant_id and tm.user_id = auth.uid()
        and tm.membership_status = 'active' and tm.revoked_at is null and tm.suspended_at is null
        and tm.effective_from <= statement_timestamp()
        and (tm.effective_to is null or tm.effective_to > statement_timestamp())
    )
    and exists (
      select 1 from public.case_participants cp
      where cp.case_id = c.id and cp.tenant_id = c.tenant_id and cp.user_id = auth.uid()
        and coalesce(cp.participant_role, cp.participant_type) = 'carer'
        and cp.status = 'active' and cp.participation_status = 'active'
        and cp.effective_from <= statement_timestamp()
        and (cp.effective_to is null or cp.effective_to > statement_timestamp())
        and cp.participation_start_at <= statement_timestamp()
        and (cp.participation_end_at is null or cp.participation_end_at > statement_timestamp())
        and cp.allowed_actions @> array['carer.portal.read', 'carer.journal.create']::text[]
        and not (cp.denied_actions && array['carer.portal.read', 'carer.journal.create']::text[])
    )
    and not exists (
      select 1 from public.case_participants denied
      where denied.case_id = c.id and denied.user_id = auth.uid()
        and denied.status = 'active' and denied.participation_status = 'active'
        and denied.effective_from <= statement_timestamp()
        and (denied.effective_to is null or denied.effective_to > statement_timestamp())
        and denied.participation_start_at <= statement_timestamp()
        and (denied.participation_end_at is null or denied.participation_end_at > statement_timestamp())
        and denied.denied_actions && array['carer.portal.read', 'carer.journal.create']::text[]
    );
  get diagnostics inserted_count = row_count;
  if inserted_count <> 1 then
    raise exception 'Active carer assignment and tenant access required' using errcode = '42501';
  end if;
  -- No broad note-write grant or arbitrary caller-supplied author identity.
  return jsonb_build_object('id', p_submission_id, 'caseId', p_case_id,
    'status', 'submitted', 'familyShared', false);
end;
$$;
create function carer_journal_private.list_carer_assigned_cases() returns jsonb
language sql stable security definer set search_path='' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'tenant_id',c.tenant_id,'case_title',c.case_title,'title',c.title,
    'case_status_code',c.case_status_code,'status',c.status,'current_stage',c.current_stage,'target_review_at',c.target_review_at)
    order by c.id),'[]'::jsonb) from public.cases c where carer_journal_private.author_allowed(c.id,c.tenant_id,'carer.portal.read')
$$;
create function carer_journal_private.get_carer_assigned_case(p_case_id uuid) returns jsonb
language sql stable security definer set search_path='' as $$
  select jsonb_build_object('id',c.id,'tenant_id',c.tenant_id,'case_title',c.case_title,'title',c.title,
    'case_status_code',c.case_status_code,'status',c.status,'current_stage',c.current_stage,'target_review_at',c.target_review_at)
    from public.cases c where c.id=p_case_id and carer_journal_private.author_allowed(c.id,c.tenant_id,'carer.portal.read')
$$;
create function public.submit_carer_journal(p_case_id uuid,p_submission_id uuid,p_kind text,p_title text,p_detail text)
returns jsonb language sql security invoker set search_path='' as $$
  select carer_journal_private.submit_carer_journal(p_case_id,p_submission_id,p_kind,p_title,p_detail)
$$;
create function public.list_carer_assigned_cases() returns jsonb language sql stable security invoker set search_path='' as $$
  select carer_journal_private.list_carer_assigned_cases()
$$;
create function public.get_carer_assigned_case(p_case_id uuid) returns jsonb language sql stable security invoker set search_path='' as $$
  select carer_journal_private.get_carer_assigned_case(p_case_id)
$$;
revoke all on function carer_journal_private.submit_carer_journal(uuid,uuid,text,text,text),carer_journal_private.list_carer_assigned_cases(),
  carer_journal_private.get_carer_assigned_case(uuid) from public,anon;
grant execute on function carer_journal_private.submit_carer_journal(uuid,uuid,text,text,text),carer_journal_private.list_carer_assigned_cases(),
  carer_journal_private.get_carer_assigned_case(uuid) to authenticated;
revoke all on function public.list_carer_assigned_cases(),public.get_carer_assigned_case(uuid) from public,anon;
grant execute on function public.list_carer_assigned_cases(),public.get_carer_assigned_case(uuid) to authenticated;
revoke all on function public.submit_carer_journal(uuid, uuid, text, text, text) from public, anon;
grant execute on function public.submit_carer_journal(uuid, uuid, text, text, text) to authenticated;
comment on function public.submit_carer_journal(uuid, uuid, text, text, text) is
  'Private immutable carer intake on operational cases, with current assignment and tenant checks. No general note-writer or parent-sharing authority.';
