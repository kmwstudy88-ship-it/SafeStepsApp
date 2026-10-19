-- Local review candidate. Extends canonical messaging roots; no remote deployment implied.
do $$
declare unsafe_reader text;
begin
  with recursive protected as (
    select unnest(array['public.messaging_threads'::regclass,'public.messaging_messages'::regclass,'public.messaging_thread_summaries'::regclass])::oid as oid
    union select v.oid from protected p join pg_depend d on d.refobjid=p.oid and d.classid='pg_rewrite'::regclass
      join pg_rewrite rw on rw.oid=d.objid join pg_class v on v.oid=rw.ev_class where v.relkind in ('v','m') and v.oid<>p.oid
  ) select c.oid::regclass::text into unsafe_reader from protected p join pg_class c on c.oid=p.oid
    where c.relkind='m' or (c.relkind='v' and not coalesce(c.reloptions @> array['security_invoker=true'],false)) limit 1;
  if unsafe_reader is not null then raise exception 'Review privileged messaging view before rollout: %',unsafe_reader; end if;
  select p.oid::regprocedure::text into unsafe_reader from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.prosecdef and p.prorettype<>'boolean'::regtype and has_function_privilege('authenticated',p.oid,'EXECUTE')
      and p.prosrc~'(messaging_threads|messaging_messages|messaging_thread_summaries)' limit 1;
  if unsafe_reader is not null then raise exception 'Review privileged messaging RPC before rollout: %',unsafe_reader; end if;
end $$;
create schema carer_communication_private;
revoke all on schema carer_communication_private from public, anon;
grant usage on schema carer_communication_private to authenticated;

create table public.carer_message_channels (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null unique references public.messaging_threads(id) on delete restrict,
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid not null references public.cases(id) on delete restrict,
  carer_user_id uuid not null references auth.users(id) on delete restrict,
  parent_user_id uuid not null references auth.users(id) on delete restrict,
  communication_enabled boolean not null default false,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  check (carer_user_id <> parent_user_id),
  check (expires_at is null or expires_at > created_at)
);
create unique index carer_message_channels_active_pair_idx on public.carer_message_channels
  (case_id,carer_user_id,parent_user_id) where revoked_at is null;
create table public.carer_message_reviews (
  message_id uuid primary key references public.messaging_messages(id) on delete restrict,
  channel_id uuid not null references public.carer_message_channels(id) on delete restrict,
  review_status text not null default 'pending' check (review_status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  review_note text,
  check ((review_status = 'pending' and reviewed_by is null and reviewed_at is null) or
    (review_status <> 'pending' and reviewed_by is not null and reviewed_at is not null))
);
create index carer_message_reviews_channel_idx on public.carer_message_reviews(channel_id);
create table public.carer_channel_events (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.carer_message_channels(id) on delete restrict,
  message_id uuid references public.messaging_messages(id) on delete restrict,
  actor_user_id uuid not null references auth.users(id),
  event_type text not null check (event_type in ('created','enabled','paused','approved','rejected','revoked')),
  occurred_at timestamptz not null default now(),
  event_detail jsonb not null default '{}'::jsonb
);
create index carer_channel_events_channel_time_idx on public.carer_channel_events(channel_id,occurred_at);
alter table public.carer_message_channels enable row level security;
alter table public.carer_message_reviews enable row level security;
alter table public.carer_channel_events enable row level security;
revoke all on public.carer_message_channels, public.carer_message_reviews, public.carer_channel_events from public, anon, authenticated, service_role;

-- These internal helpers are not an exposed data API. Only session-bound boolean
-- predicates used by canonical-root policies are executable by authenticated callers.
create function carer_communication_private.actor_allowed(p_case uuid,p_actor uuid,p_role text,p_action text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.cases c
    join public.platform_tenants pt on pt.id=c.tenant_id and pt.tenant_status='active'
    join public.case_participants cp on cp.case_id=c.id and cp.tenant_id=c.tenant_id
    join public.tenant_memberships tm on tm.tenant_id=c.tenant_id and tm.user_id=cp.user_id
    where c.id=p_case and c.status='active' and coalesce(c.case_status_code,'active')<>'closed'
      and cp.user_id=p_actor and coalesce(cp.participant_role,cp.participant_type)=p_role
      and cp.status='active' and cp.participation_status='active'
      and cp.effective_from<=statement_timestamp() and (cp.effective_to is null or cp.effective_to>statement_timestamp())
      and cp.participation_start_at<=statement_timestamp() and (cp.participation_end_at is null or cp.participation_end_at>statement_timestamp())
      and p_action=any(cp.allowed_actions) and not p_action=any(cp.denied_actions)
      and (p_role<>'carer' or ('carer.portal.read'=any(cp.allowed_actions) and not 'carer.portal.read'=any(cp.denied_actions)))
      and tm.membership_status='active' and tm.revoked_at is null and tm.suspended_at is null
      and tm.effective_from<=statement_timestamp() and (tm.effective_to is null or tm.effective_to>statement_timestamp())
      and not exists (select 1 from public.case_participants denied where denied.case_id=c.id and denied.user_id=p_actor
        and denied.status='active' and denied.participation_status='active'
        and denied.effective_from<=statement_timestamp() and (denied.effective_to is null or denied.effective_to>statement_timestamp())
        and denied.participation_start_at<=statement_timestamp() and (denied.participation_end_at is null or denied.participation_end_at>statement_timestamp())
        and (p_action=any(denied.denied_actions) or (p_role='carer' and 'carer.portal.read'=any(denied.denied_actions))))
  )
$$;
create function carer_communication_private.case_permission(p_case uuid,p_permission text)
returns boolean language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and exists(select 1 from public.cases c
    join public.platform_tenants pt on pt.id=c.tenant_id and pt.tenant_status='active'
    join public.role_assignments ra on ra.tenant_id=c.tenant_id and ra.user_id=auth.uid()
    join public.role_definitions rd on rd.id=ra.role_definition_id and (rd.tenant_id is null or rd.tenant_id=c.tenant_id)
    join public.role_permissions rp on rp.role_definition_id=rd.id
    join public.permission_definitions pd on pd.id=rp.permission_definition_id
    where c.id=p_case and ra.assignment_status='active' and rd.lifecycle_status='active' and pd.lifecycle_status='active'
      and pd.permission_code=p_permission and rp.permission_scope='{}'::jsonb
      and ra.effective_from<=statement_timestamp() and (ra.effective_to is null or ra.effective_to>statement_timestamp())
      and ((ra.scope_type='tenant' and (ra.scope_reference is null or ra.scope_reference=c.tenant_id)) or
        (ra.scope_type='operational_case' and ra.scope_reference=c.id))
      and (not pd.requires_step_up_authentication or auth.jwt()->>'aal'='aal2'))
$$;
create function carer_communication_private.reviewer_allowed(p_case uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.cases c
    join public.case_allocations ca on ca.case_id=c.id and ca.tenant_id=c.tenant_id
    join public.tenant_memberships tm on tm.tenant_id=c.tenant_id and tm.user_id=auth.uid()
    where c.id=p_case and ca.allocated_user_id=auth.uid() and ca.allocation_status='active' and ca.ended_at is null
      and ca.allocated_at<=statement_timestamp()
      and ca.allocation_role in ('primary_worker','secondary_worker','primary_supervisor','clinical_supervisor')
      and tm.membership_status='active' and tm.revoked_at is null and tm.suspended_at is null
      and tm.effective_from<=statement_timestamp() and (tm.effective_to is null or tm.effective_to>statement_timestamp())
      and carer_communication_private.case_permission(c.id,'carer.communication.review')
  )
$$;
create function carer_communication_private.thread_allowed(p_thread uuid,p_send boolean default false)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.carer_message_channels ch where ch.thread_id=p_thread and (
      (not p_send and carer_communication_private.reviewer_allowed(ch.case_id)) or
      (ch.revoked_at is null and (ch.expires_at is null or ch.expires_at>statement_timestamp())
        and (not p_send or ch.communication_enabled)
        and ((ch.carer_user_id=auth.uid() and
          carer_communication_private.actor_allowed(ch.case_id,auth.uid(),'carer','carer.communication.read') and
          (not p_send or carer_communication_private.actor_allowed(ch.case_id,auth.uid(),'carer','carer.communication.send'))) or
          (ch.parent_user_id=auth.uid() and
          carer_communication_private.actor_allowed(ch.case_id,auth.uid(),'parent','parent.communication.read') and
          (not p_send or carer_communication_private.actor_allowed(ch.case_id,auth.uid(),'parent','parent.communication.send')))))
    )
  )
$$;
create function carer_communication_private.message_allowed(p_message uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.messaging_messages m
    join public.carer_message_channels ch on ch.thread_id=m.thread_id
    join public.carer_message_reviews r on r.message_id=m.id and r.channel_id=ch.id
    where m.id=p_message and carer_communication_private.thread_allowed(m.thread_id,false)
      and (m.created_by=auth.uid() or r.review_status='approved' or carer_communication_private.reviewer_allowed(ch.case_id)))
$$;
create function carer_communication_private.is_channel_thread(p_thread uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.carer_message_channels where thread_id=p_thread)
$$;
revoke all on function carer_communication_private.actor_allowed(uuid,uuid,text,text),
  carer_communication_private.case_permission(uuid,text),
  carer_communication_private.reviewer_allowed(uuid),carer_communication_private.thread_allowed(uuid,boolean),
  carer_communication_private.message_allowed(uuid),carer_communication_private.is_channel_thread(uuid)
  from public, anon, authenticated, service_role;
grant execute on function carer_communication_private.thread_allowed(uuid,boolean),
  carer_communication_private.message_allowed(uuid),carer_communication_private.is_channel_thread(uuid) to authenticated;

create policy carer_threads_shared_read on public.messaging_threads for select to authenticated
  using (carer_communication_private.thread_allowed(id,false));
create policy carer_threads_scope on public.messaging_threads as restrictive for select to authenticated
  using (not carer_communication_private.is_channel_thread(id) or carer_communication_private.thread_allowed(id,false));
create policy carer_messages_shared_read on public.messaging_messages for select to authenticated
  using (carer_communication_private.message_allowed(id));
create policy carer_messages_scope on public.messaging_messages as restrictive for select to authenticated
  using (not carer_communication_private.is_channel_thread(thread_id) or carer_communication_private.message_allowed(id));
create policy carer_messages_parent_insert on public.messaging_messages for insert to authenticated
  with check (created_by=auth.uid() and carer_communication_private.thread_allowed(thread_id,true));
create policy carer_summaries_scope on public.messaging_thread_summaries as restrictive for select to authenticated
  using (not carer_communication_private.is_channel_thread(thread_id));

create function carer_communication_private.guard_message() returns trigger
language plpgsql security definer set search_path = '' as $$
declare ch public.carer_message_channels;
begin
  if tg_op <> 'INSERT' then
    if carer_communication_private.is_channel_thread(old.thread_id) or
       (tg_op='UPDATE' and carer_communication_private.is_channel_thread(new.thread_id)) then
      raise exception 'Monitored messages are retained and cannot be edited or deleted' using errcode='42501';
    end if;
    if tg_op='DELETE' then return old; else return new; end if;
  end if;
  select * into ch from public.carer_message_channels where thread_id=new.thread_id for update;
  if not found then return new; end if;
  if new.created_by is distinct from auth.uid() or not carer_communication_private.thread_allowed(new.thread_id,true)
    or new.body is null or char_length(btrim(new.body))=0 or char_length(new.body)>4000 then
    raise exception 'Current sender access and enabled communication required' using errcode='42501';
  end if;
  new.created_at=statement_timestamp(); new.body=btrim(new.body);
  return new;
end $$;
create function carer_communication_private.queue_message() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.carer_message_reviews(message_id,channel_id)
    select new.id,id from public.carer_message_channels where thread_id=new.thread_id;
  return new;
end $$;
create function carer_communication_private.guard_thread() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if carer_communication_private.is_channel_thread(old.id) then
    raise exception 'Monitored thread identity and retention are protected' using errcode='42501';
  end if;
  if tg_op='DELETE' then return old; else return new; end if;
end $$;
revoke all on function carer_communication_private.guard_message(),carer_communication_private.queue_message(),
  carer_communication_private.guard_thread() from public, anon, authenticated, service_role;
create trigger carer_message_guard before insert or update or delete on public.messaging_messages
  for each row execute function carer_communication_private.guard_message();
create trigger carer_message_review_queue after insert on public.messaging_messages
  for each row execute function carer_communication_private.queue_message();
create trigger carer_thread_guard before update or delete on public.messaging_threads
  for each row execute function carer_communication_private.guard_thread();

create function carer_communication_private.create_carer_message_channel(p_case_id uuid,p_carer_user_id uuid,p_parent_user_id uuid,p_expires_at timestamptz,p_label text,p_reason text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare c public.cases; thread_id uuid=gen_random_uuid(); channel_id uuid=gen_random_uuid();
begin
  select * into c from public.cases where id=p_case_id;
  if not found or not carer_communication_private.reviewer_allowed(p_case_id) or
    not carer_communication_private.actor_allowed(p_case_id,p_carer_user_id,'carer','carer.communication.read') or
    not carer_communication_private.actor_allowed(p_case_id,p_parent_user_id,'parent','parent.communication.read') or
    p_carer_user_id=p_parent_user_id or p_expires_at is null or p_expires_at<=statement_timestamp() or
    p_label is null or char_length(btrim(p_label))=0 or char_length(p_label)>160 or
    p_reason is null or char_length(btrim(p_reason))=0 or char_length(p_reason)>2000 then
    raise exception 'Assigned reviewer and current case participants required' using errcode='42501';
  end if;
  insert into public.messaging_threads(id,created_by,owner_user_id,title)
    values(thread_id,auth.uid(),p_carer_user_id,btrim(p_label));
  insert into public.carer_message_channels(id,thread_id,tenant_id,case_id,carer_user_id,parent_user_id,expires_at,created_by)
    values(channel_id,thread_id,c.tenant_id,c.id,p_carer_user_id,p_parent_user_id,p_expires_at,auth.uid());
  insert into public.carer_channel_events(channel_id,actor_user_id,event_type,event_detail)
    values(channel_id,auth.uid(),'created',jsonb_build_object('reason',btrim(p_reason)));
  return jsonb_build_object('id',channel_id,'enabled',false);
end $$;
create function carer_communication_private.list_carer_message_channels() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',ch.id,'title',t.title,'operationalCaseId',ch.case_id,'enabled',ch.communication_enabled,
    'canManage',ch.carer_user_id=auth.uid() and ch.revoked_at is null and (ch.expires_at is null or ch.expires_at>statement_timestamp())
      and carer_communication_private.actor_allowed(ch.case_id,auth.uid(),'carer','carer.communication.manage'),
    'canSend',carer_communication_private.thread_allowed(ch.thread_id,true),
    'canReview',carer_communication_private.reviewer_allowed(ch.case_id),'revoked',ch.revoked_at is not null,
    'expiresAt',ch.expires_at) order by ch.created_at desc),'[]'::jsonb)
  from (select * from public.carer_message_channels current_channel
    where carer_communication_private.thread_allowed(current_channel.thread_id,false)
    order by current_channel.created_at desc,current_channel.id desc limit 100) ch join public.messaging_threads t on t.id=ch.thread_id
$$;
create function carer_communication_private.get_carer_channel_messages(p_channel_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare ch public.carer_message_channels; result jsonb;
begin
  select * into ch from public.carer_message_channels where id=p_channel_id;
  if not found or not carer_communication_private.thread_allowed(ch.thread_id,false) then
    raise exception 'Current channel access required' using errcode='42501'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',x.id,'body',x.body,'createdAt',x.created_at,
    'isMine',x.created_by=auth.uid(),'senderRole',case when x.created_by=ch.carer_user_id then 'carer' else 'parent' end,
    'reviewStatus',x.review_status) order by x.created_at,x.id),'[]'::jsonb) into result
  from (select m.id,m.body,m.created_at,m.created_by,r.review_status
    from public.messaging_messages m join public.carer_message_reviews r on r.message_id=m.id and r.channel_id=ch.id
    where m.thread_id=ch.thread_id and carer_communication_private.message_allowed(m.id)
    order by m.created_at desc,m.id desc limit 100) x;
  return result;
end $$;
create function carer_communication_private.set_carer_channel_enabled(p_channel_id uuid,p_enabled boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare ch public.carer_message_channels;
begin
  select * into ch from public.carer_message_channels where id=p_channel_id for update;
  if not found or p_enabled is null or ch.carer_user_id is distinct from auth.uid() or
    not carer_communication_private.thread_allowed(ch.thread_id,false) or ch.revoked_at is not null or
    (ch.expires_at is not null and ch.expires_at<=statement_timestamp()) or
    not carer_communication_private.actor_allowed(ch.case_id,auth.uid(),'carer','carer.communication.manage') then
    raise exception 'Current carer control permission required' using errcode='42501'; end if;
  update public.carer_message_channels set communication_enabled=p_enabled where id=ch.id;
  insert into public.carer_channel_events(channel_id,actor_user_id,event_type)
    values(ch.id,auth.uid(),case when p_enabled then 'enabled' else 'paused' end);
  return jsonb_build_object('id',ch.id,'enabled',p_enabled);
end $$;
create function carer_communication_private.send_carer_channel_message(p_channel_id uuid,p_submission_id uuid,p_body text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare ch public.carer_message_channels;
begin
  select * into ch from public.carer_message_channels where id=p_channel_id for update;
  if not found or p_submission_id is null or p_body is null or char_length(btrim(p_body))=0 or char_length(p_body)>4000 or
    not carer_communication_private.thread_allowed(ch.thread_id,true) then
    raise exception 'Enabled channel and current sender permission required' using errcode='42501'; end if;
  insert into public.messaging_messages(id,thread_id,created_by,body)
    values(p_submission_id,ch.thread_id,auth.uid(),btrim(p_body));
  return jsonb_build_object('id',p_submission_id,'reviewStatus','pending');
end $$;
create function carer_communication_private.review_carer_channel_message(p_channel_id uuid,p_message_id uuid,p_decision text,p_note text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare ch public.carer_message_channels; sender uuid;
begin
  select * into ch from public.carer_message_channels where id=p_channel_id for update;
  select m.created_by into sender from public.messaging_messages m join public.carer_message_reviews r on r.message_id=m.id
    where m.id=p_message_id and m.thread_id=ch.thread_id and r.channel_id=ch.id;
  if ch.id is null or sender is null or sender=auth.uid() or
    not carer_communication_private.reviewer_allowed(ch.case_id) or p_decision is null or
    p_decision not in ('approved','rejected') or p_note is null or char_length(btrim(p_note))=0 or char_length(p_note)>2000 then
    raise exception 'Assigned reviewer, decision and review reason required' using errcode='42501'; end if;
  if p_decision='approved' and (not ch.communication_enabled or ch.revoked_at is not null or ch.expires_at<=statement_timestamp() or
    not carer_communication_private.actor_allowed(ch.case_id,ch.carer_user_id,'carer','carer.communication.read') or
    not carer_communication_private.actor_allowed(ch.case_id,ch.parent_user_id,'parent','parent.communication.read')) then
    raise exception 'Current participants and enabled communication required for delivery approval' using errcode='42501'; end if;
  update public.carer_message_reviews set review_status=p_decision,reviewed_by=auth.uid(),
    reviewed_at=statement_timestamp(),review_note=btrim(p_note) where message_id=p_message_id;
  insert into public.carer_channel_events(channel_id,message_id,actor_user_id,event_type,event_detail)
    values(ch.id,p_message_id,auth.uid(),p_decision,jsonb_build_object('reason',btrim(p_note)));
  return jsonb_build_object('id',p_message_id,'reviewStatus',p_decision);
end $$;
create function carer_communication_private.revoke_carer_message_channel(p_channel_id uuid,p_reason text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare ch public.carer_message_channels;
begin
  select * into ch from public.carer_message_channels where id=p_channel_id for update;
  if not found or not carer_communication_private.reviewer_allowed(ch.case_id) or
    p_reason is null or char_length(btrim(p_reason))=0 or char_length(p_reason)>2000 then
    raise exception 'Assigned reviewer and revocation reason required' using errcode='42501'; end if;
  update public.carer_message_channels set revoked_at=statement_timestamp(),communication_enabled=false where id=ch.id;
  insert into public.carer_channel_events(channel_id,actor_user_id,event_type,event_detail)
    values(ch.id,auth.uid(),'revoked',jsonb_build_object('reason',btrim(p_reason)));
  return jsonb_build_object('id',ch.id,'revoked',true);
end $$;
create function public.create_carer_message_channel(p_case_id uuid,p_carer_user_id uuid,p_parent_user_id uuid,p_expires_at timestamptz,p_label text,p_reason text)
returns jsonb language sql security invoker set search_path='' as $$
  select carer_communication_private.create_carer_message_channel(p_case_id,p_carer_user_id,p_parent_user_id,p_expires_at,p_label,p_reason)
$$;
create function public.list_carer_message_channels() returns jsonb language sql stable security invoker set search_path='' as $$
  select carer_communication_private.list_carer_message_channels()
$$;
create function public.get_carer_channel_messages(p_channel_id uuid) returns jsonb language sql security invoker set search_path='' as $$
  select carer_communication_private.get_carer_channel_messages(p_channel_id)
$$;
create function public.set_carer_channel_enabled(p_channel_id uuid,p_enabled boolean) returns jsonb language sql security invoker set search_path='' as $$
  select carer_communication_private.set_carer_channel_enabled(p_channel_id,p_enabled)
$$;
create function public.send_carer_channel_message(p_channel_id uuid,p_submission_id uuid,p_body text) returns jsonb language sql security invoker set search_path='' as $$
  select carer_communication_private.send_carer_channel_message(p_channel_id,p_submission_id,p_body)
$$;
create function public.review_carer_channel_message(p_channel_id uuid,p_message_id uuid,p_decision text,p_note text) returns jsonb language sql security invoker set search_path='' as $$
  select carer_communication_private.review_carer_channel_message(p_channel_id,p_message_id,p_decision,p_note)
$$;
create function public.revoke_carer_message_channel(p_channel_id uuid,p_reason text) returns jsonb language sql security invoker set search_path='' as $$
  select carer_communication_private.revoke_carer_message_channel(p_channel_id,p_reason)
$$;
revoke all on function carer_communication_private.create_carer_message_channel(uuid,uuid,uuid,timestamptz,text,text),
  carer_communication_private.list_carer_message_channels(),carer_communication_private.get_carer_channel_messages(uuid),
  carer_communication_private.set_carer_channel_enabled(uuid,boolean),carer_communication_private.send_carer_channel_message(uuid,uuid,text),
  carer_communication_private.review_carer_channel_message(uuid,uuid,text,text),carer_communication_private.revoke_carer_message_channel(uuid,text) from public,anon,service_role;
grant execute on function carer_communication_private.create_carer_message_channel(uuid,uuid,uuid,timestamptz,text,text),
  carer_communication_private.list_carer_message_channels(),carer_communication_private.get_carer_channel_messages(uuid),
  carer_communication_private.set_carer_channel_enabled(uuid,boolean),carer_communication_private.send_carer_channel_message(uuid,uuid,text),
  carer_communication_private.review_carer_channel_message(uuid,uuid,text,text),carer_communication_private.revoke_carer_message_channel(uuid,text) to authenticated;
revoke all on function public.create_carer_message_channel(uuid,uuid,uuid,timestamptz,text,text),
  public.list_carer_message_channels(),public.get_carer_channel_messages(uuid),
  public.set_carer_channel_enabled(uuid,boolean),public.send_carer_channel_message(uuid,uuid,text),
  public.review_carer_channel_message(uuid,uuid,text,text),public.revoke_carer_message_channel(uuid,text) from public, anon, service_role;
grant execute on function public.create_carer_message_channel(uuid,uuid,uuid,timestamptz,text,text),
  public.list_carer_message_channels(),public.get_carer_channel_messages(uuid),
  public.set_carer_channel_enabled(uuid,boolean),public.send_carer_channel_message(uuid,uuid,text),
  public.review_carer_channel_message(uuid,uuid,text,text),public.revoke_carer_message_channel(uuid,text) to authenticated;
