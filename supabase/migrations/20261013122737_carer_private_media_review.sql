-- Requires the prior monitored-communication migration's current case-actor predicate.
-- Provisional uploads are not evidence files; vault rows are created only after server byte verification.
do $$
declare unsafe_reader text;
begin
  with recursive protected as (
    select unnest(array['public.evidence_records'::regclass,'public.evidence_files'::regclass,'public.evidence_sharing_grants'::regclass,'storage.objects'::regclass])::oid as oid
    union select v.oid from protected p join pg_depend d on d.refobjid=p.oid and d.classid='pg_rewrite'::regclass
      join pg_rewrite rw on rw.oid=d.objid join pg_class v on v.oid=rw.ev_class where v.relkind in ('v','m') and v.oid<>p.oid
  ) select c.oid::regclass::text into unsafe_reader from protected p join pg_class c on c.oid=p.oid
    where c.relkind='m' or (c.relkind='v' and not coalesce(c.reloptions @> array['security_invoker=true'],false)) limit 1;
  if unsafe_reader is not null then raise exception 'Review privileged media view before rollout: %',unsafe_reader; end if;
  select p.oid::regprocedure::text into unsafe_reader from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.prosecdef and p.prorettype<>'boolean'::regtype and has_function_privilege('authenticated',p.oid,'EXECUTE')
      and p.prosrc~'(evidence_records|evidence_files|evidence_metadata|evidence_ai_analyses)' limit 1;
  if unsafe_reader is not null then raise exception 'Review privileged media RPC before rollout: %',unsafe_reader; end if;
end $$;
create schema carer_media_private;
revoke all on schema carer_media_private from public,anon;
grant usage on schema carer_media_private to authenticated,service_role;
create table public.carer_media_uploads (
  id uuid primary key,
  tenant_id uuid not null references public.platform_tenants(id) on delete restrict,
  case_id uuid not null references public.cases(id) on delete restrict,
  author_user_id uuid not null references auth.users(id) on delete restrict,
  planned_evidence_id uuid not null unique default gen_random_uuid(),
  evidence_record_id uuid unique references public.evidence_records(id) on delete restrict,
  file_id uuid not null unique,
  storage_path text not null unique,
  original_filename text not null,
  title text not null,
  description text not null,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','video/mp4','video/quicktime')),
  declared_bytes bigint not null check (declared_bytes between 1 and 26214400),
  upload_state text not null default 'reserved' check (upload_state in ('reserved','ready')),
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  check ((upload_state='reserved' and evidence_record_id is null and verified_at is null) or
    (upload_state='ready' and evidence_record_id=planned_evidence_id and verified_at is not null))
);
create index carer_media_uploads_case_time_idx on public.carer_media_uploads(case_id,created_at desc);
create table public.carer_media_review_events (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references public.carer_media_uploads(id) on delete restrict,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  parent_user_id uuid references auth.users(id) on delete restrict,
  grant_id uuid references public.evidence_sharing_grants(id) on delete restrict deferrable initially deferred,
  decision text not null check (decision in ('approved','rejected','revoked','view_requested','bytes_verified')),
  original_disclosure_confirmed boolean not null default false,
  reason text not null,
  occurred_at timestamptz not null default statement_timestamp(),
  check (decision<>'approved' or original_disclosure_confirmed)
);
create index carer_media_review_events_upload_idx on public.carer_media_review_events(upload_id,occurred_at);
alter table public.carer_media_uploads enable row level security;
alter table public.carer_media_review_events enable row level security;
revoke all on public.carer_media_uploads,public.carer_media_review_events from public,anon,authenticated,service_role;

create function carer_media_private.reviewer_allowed(p_case uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and exists(select 1 from public.cases c
    join public.case_allocations ca on ca.case_id=c.id and ca.tenant_id=c.tenant_id
    join public.tenant_memberships tm on tm.tenant_id=c.tenant_id and tm.user_id=auth.uid()
    where c.id=p_case and ca.allocated_user_id=auth.uid() and ca.allocation_status='active' and ca.ended_at is null
      and ca.allocated_at<=statement_timestamp() and ca.allocation_role in ('primary_worker','secondary_worker','primary_supervisor','clinical_supervisor')
      and tm.membership_status='active' and tm.revoked_at is null and tm.suspended_at is null
      and tm.effective_from<=statement_timestamp() and (tm.effective_to is null or tm.effective_to>statement_timestamp())
      and carer_communication_private.case_permission(c.id,'carer.media.review'))
$$;
create function carer_media_private.is_media(p_evidence uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.carer_media_uploads where planned_evidence_id=p_evidence)
$$;
-- A case-person link is explicit; account display names are not identity evidence.
create function carer_media_private.parent_member(p_case uuid,p_parent uuid) returns uuid
language sql stable security definer set search_path='' as $$
  select case when count(distinct fm.id)=1 then min(fm.id::text)::uuid else null end
  from public.case_participants cp join public.cases c on c.id=cp.case_id and c.tenant_id=cp.tenant_id
    join public.family_members fm on fm.id=cp.family_member_id and fm.family_id=c.family_id and fm.tenant_id=c.tenant_id
  where c.id=p_case and cp.user_id=p_parent and coalesce(cp.participant_role,cp.participant_type)='parent'
    and cp.status='active' and cp.participation_status='active'
    and cp.effective_from<=statement_timestamp() and (cp.effective_to is null or cp.effective_to>statement_timestamp())
    and cp.participation_start_at<=statement_timestamp() and (cp.participation_end_at is null or cp.participation_end_at>statement_timestamp())
    and 'parent.media.read'=any(cp.allowed_actions) and not 'parent.media.read'=any(cp.denied_actions)
    and nullif(btrim(fm.member_reference),'') is not null
    and carer_communication_private.actor_allowed(p_case,p_parent,'parent','parent.media.read')
$$;
create function carer_media_private.can_read(p_upload uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select auth.uid() is not null and exists(select 1 from public.carer_media_uploads u where u.id=p_upload and (
    (u.author_user_id=auth.uid() and carer_communication_private.actor_allowed(u.case_id,auth.uid(),'carer','carer.media.read')) or
    carer_media_private.reviewer_allowed(u.case_id) or
    (u.upload_state='ready' and carer_media_private.parent_member(u.case_id,auth.uid()) is not null and
      exists(select 1 from public.evidence_sharing_grants g join public.carer_media_review_events e on e.grant_id=g.id
        where g.evidence_record_id=u.evidence_record_id and g.tenant_id=u.tenant_id and g.grantee_user_id=auth.uid()
          and g.revoked_at is null and g.expires_at>statement_timestamp() and e.upload_id=u.id and e.decision='approved'
          and e.parent_user_id=auth.uid()))))
$$;
create function carer_media_private.evidence_allowed(p_evidence uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.carer_media_uploads where evidence_record_id=p_evidence and upload_state='ready'
    and carer_media_private.can_read(id))
$$;
create function carer_media_private.object_allowed(p_name text,p_insert boolean) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.carer_media_uploads u where u.storage_path=p_name and
    ((p_insert and u.upload_state='reserved' and u.author_user_id=auth.uid() and
      carer_communication_private.actor_allowed(u.case_id,auth.uid(),'carer','carer.media.upload')) or
     (not p_insert and ((u.upload_state='ready' and carer_media_private.can_read(u.id)) or
       (u.upload_state='reserved' and u.author_user_id=auth.uid() and
        carer_communication_private.actor_allowed(u.case_id,auth.uid(),'carer','carer.media.upload'))))))
$$;
create function carer_media_private.file_allowed(p_file uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.carer_media_uploads u join public.evidence_files f on f.id=u.file_id
    where f.id=p_file and f.evidence_record_id=u.evidence_record_id and f.bucket_name='carer-media' and f.storage_path=u.storage_path
      and not f.deleted and carer_media_private.can_read(u.id))
$$;
create function carer_media_private.grant_allowed(p_grant uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.evidence_sharing_grants g join public.carer_media_uploads u on u.evidence_record_id=g.evidence_record_id
    where g.id=p_grant and carer_media_private.can_read(u.id) and
      (g.grantee_user_id=auth.uid() or u.author_user_id=auth.uid() or carer_media_private.reviewer_allowed(u.case_id)))
$$;
create function carer_media_private.is_media_file(p_file uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.carer_media_uploads where file_id=p_file)
$$;
revoke all on function carer_media_private.reviewer_allowed(uuid),carer_media_private.is_media(uuid),
  carer_media_private.parent_member(uuid,uuid),
  carer_media_private.can_read(uuid),carer_media_private.evidence_allowed(uuid),carer_media_private.grant_allowed(uuid),
  carer_media_private.object_allowed(text,boolean),carer_media_private.file_allowed(uuid),carer_media_private.is_media_file(uuid)
  from public,anon,authenticated,service_role;
grant execute on function carer_media_private.is_media(uuid),carer_media_private.can_read(uuid),
  carer_media_private.evidence_allowed(uuid),carer_media_private.grant_allowed(uuid),carer_media_private.object_allowed(text,boolean),
  carer_media_private.file_allowed(uuid),carer_media_private.is_media_file(uuid) to authenticated;

create policy carer_media_records_read on public.evidence_records for select to authenticated using(carer_media_private.evidence_allowed(id));
create policy carer_media_records_scope on public.evidence_records as restrictive for select to authenticated
  using(not carer_media_private.is_media(id) or carer_media_private.evidence_allowed(id));
create policy carer_media_files_read on public.evidence_files for select to authenticated using(carer_media_private.file_allowed(id));
create policy carer_media_files_scope on public.evidence_files as restrictive for select to authenticated
  using(not carer_media_private.is_media(evidence_record_id) or carer_media_private.file_allowed(id));
create policy carer_media_grants_scope on public.evidence_sharing_grants as restrictive for select to authenticated
  using(not carer_media_private.is_media(evidence_record_id) or carer_media_private.grant_allowed(id));
-- Apply the same restrictive audience boundary to canonical evidence-derived rows.
do $$
declare related record;
begin
  for related in select distinct ns.nspname as schema_name,rel.relname as table_name,att.attname as column_name,
    fk.confrelid='public.evidence_files'::regclass as references_file
    from pg_constraint fk join pg_class rel on rel.oid=fk.conrelid
    join pg_namespace ns on ns.oid=rel.relnamespace
    join pg_attribute att on att.attrelid=fk.conrelid and att.attnum=fk.conkey[1]
    join pg_attribute ref on ref.attrelid=fk.confrelid and ref.attnum=fk.confkey[1] and ref.attname='id'
    where fk.contype='f' and fk.confrelid in ('public.evidence_records'::regclass,'public.evidence_files'::regclass) and ns.nspname='public'
      and cardinality(fk.conkey)=1 and rel.relrowsecurity and rel.relname<>'evidence_files'
  loop
    execute format('create policy %I on %I.%I as restrictive for select to authenticated using (not carer_media_private.%I(%I) or carer_media_private.%I(%I))',
      'carer_media_scope_'||related.column_name,related.schema_name,related.table_name,
      case when related.references_file then 'is_media_file' else 'is_media' end,related.column_name,
      case when related.references_file then 'file_allowed' else 'evidence_allowed' end,related.column_name);
  end loop;
end $$;
create function carer_media_private.guard_vault() returns trigger
language plpgsql security definer set search_path='' as $$
declare old_ref uuid; new_ref uuid;
begin
  if tg_table_name='evidence_records' then
    if tg_op<>'INSERT' then old_ref=old.id; end if;
    if tg_op<>'DELETE' then new_ref=new.id; end if;
  else
    if tg_op<>'INSERT' then old_ref=old.evidence_record_id; end if;
    if tg_op<>'DELETE' then new_ref=new.evidence_record_id; end if;
  end if;
  if carer_media_private.is_media(old_ref) or carer_media_private.is_media(new_ref) then
    if tg_table_name='evidence_records' and tg_op='UPDATE' then
      if (to_jsonb(new)-array['legal_hold','updated_at']) is not distinct from (to_jsonb(old)-array['legal_hold','updated_at']) and
        new.legal_hold=exists(select 1 from public.evidence_legal_holds h where h.evidence_record_id=old.id and h.hold_status='active' and h.released_at is null) then
        return new; -- Preserve canonical legal-hold synchronization; never fabricate its state.
      end if;
    end if;
    if tg_op<>'INSERT' or (auth.jwt()->>'role') is distinct from 'service_role' then
      raise exception 'Carer media originals and verified metadata are protected' using errcode='42501'; end if;
  end if;
  if tg_op='DELETE' then return old; else return new; end if;
end $$;
create function carer_media_private.guard_grant() returns trigger
language plpgsql security definer set search_path='' as $$
declare ref uuid; decision_needed text;
begin
  if tg_op='DELETE' then ref=old.evidence_record_id; else ref=new.evidence_record_id; end if;
  if not carer_media_private.is_media(ref) and (tg_op<>'UPDATE' or not carer_media_private.is_media(old.evidence_record_id)) then
    if tg_op='DELETE' then return old; else return new; end if;
  end if;
  if tg_op='DELETE' then raise exception 'Media sharing history is retained' using errcode='42501'; end if;
  if tg_op='INSERT' then decision_needed='approved';
  else
    decision_needed='revoked';
    if (to_jsonb(new)-'revoked_at') is distinct from (to_jsonb(old)-'revoked_at') or new.revoked_at is null then
      raise exception 'Existing media grants can only be revoked through review' using errcode='42501'; end if;
  end if;
  if not exists(select 1 from public.carer_media_uploads u join public.carer_media_review_events e on e.upload_id=u.id
    where u.evidence_record_id=ref and e.grant_id=new.id and e.decision=decision_needed and e.actor_user_id=auth.uid()
      and e.occurred_at=statement_timestamp() and carer_media_private.reviewer_allowed(u.case_id)) then
    raise exception 'An attributable worker review event is required' using errcode='42501'; end if;
  return new;
end $$;
revoke all on function carer_media_private.guard_vault(),carer_media_private.guard_grant() from public,anon,authenticated,service_role;
create trigger carer_media_record_guard before insert or update or delete on public.evidence_records
  for each row execute function carer_media_private.guard_vault();
create trigger carer_media_file_guard before insert or update or delete on public.evidence_files
  for each row execute function carer_media_private.guard_vault();
create trigger carer_media_grant_guard before insert or update or delete on public.evidence_sharing_grants
  for each row execute function carer_media_private.guard_grant();

do $$ begin
  if exists(select 1 from storage.buckets where id='carer-media' and (public or file_size_limit is null or file_size_limit>26214400)) then
    raise exception 'Existing carer-media bucket requires an explicit private-capacity review'; end if;
end $$;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('carer-media','carer-media',false,26214400,
  array['image/jpeg','image/png','image/webp','video/mp4','video/quicktime']) on conflict(id) do nothing;
create policy carer_media_object_insert on storage.objects for insert to authenticated
  with check(bucket_id='carer-media' and carer_media_private.object_allowed(name,true));
create policy carer_media_object_insert_scope on storage.objects as restrictive for insert to authenticated
  with check(bucket_id<>'carer-media' or carer_media_private.object_allowed(name,true));
create policy carer_media_object_read on storage.objects for select to authenticated
  using(bucket_id='carer-media' and carer_media_private.object_allowed(name,false));
create policy carer_media_object_read_scope on storage.objects as restrictive for select to authenticated
  using(bucket_id<>'carer-media' or carer_media_private.object_allowed(name,false));
create policy carer_media_object_update_scope on storage.objects as restrictive for update to authenticated
  using(bucket_id<>'carer-media') with check(bucket_id<>'carer-media');
create policy carer_media_object_delete_scope on storage.objects as restrictive for delete to authenticated using(bucket_id<>'carer-media');
create policy carer_media_object_anon_scope on storage.objects as restrictive for all to anon
  using(bucket_id<>'carer-media') with check(bucket_id<>'carer-media');

create function carer_media_private.reserve_carer_media(p_case_id uuid,p_submission_id uuid,p_filename text,p_title text,p_description text,p_mime text,p_bytes bigint)
returns jsonb language plpgsql security definer set search_path='' as $$
declare c public.cases; file_id uuid=gen_random_uuid(); object_path text;
begin
  select * into c from public.cases where id=p_case_id;
  if not found or not carer_communication_private.actor_allowed(c.id,auth.uid(),'carer','carer.media.upload') or
    not carer_communication_private.actor_allowed(c.id,auth.uid(),'carer','carer.media.read') then
    raise exception 'Current carer media permission required' using errcode='42501'; end if;
  if p_submission_id is null or p_filename is null or char_length(btrim(p_filename))=0 or char_length(p_filename)>160 or p_filename~'[/\\]' or p_filename~'[[:cntrl:]]' or
    p_title is null or char_length(btrim(p_title))=0 or char_length(p_title)>160 or p_description is null or char_length(p_description)>2000 or
    p_mime is null or p_mime not in ('image/jpeg','image/png','image/webp','video/mp4','video/quicktime') or p_bytes is null or p_bytes not between 1 and 26214400 then
    raise exception 'Invalid bounded media upload metadata' using errcode='22023'; end if;
  object_path=c.tenant_id::text||'/'||c.id::text||'/'||p_submission_id::text||'/original';
  insert into public.carer_media_uploads(id,tenant_id,case_id,author_user_id,file_id,storage_path,original_filename,title,description,mime_type,declared_bytes)
    values(p_submission_id,c.tenant_id,c.id,auth.uid(),file_id,object_path,p_filename,btrim(p_title),btrim(p_description),p_mime,p_bytes);
  return jsonb_build_object('id',p_submission_id,'bucket','carer-media','path',object_path,'mimeType',p_mime);
end $$;
create function carer_media_private.get_carer_media_location(p_upload_id uuid,p_for_completion boolean default false)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u public.carer_media_uploads; access_until timestamptz;
begin
  select * into u from public.carer_media_uploads where id=p_upload_id;
  if not found or p_for_completion is null or (p_for_completion and (u.author_user_id is distinct from auth.uid() or
    not carer_communication_private.actor_allowed(u.case_id,auth.uid(),'carer','carer.media.upload'))) or
    (not p_for_completion and (u.upload_state<>'ready' or not carer_media_private.can_read(u.id))) then
    raise exception 'Current media access required' using errcode='42501'; end if;
  if not p_for_completion then insert into public.carer_media_review_events(upload_id,actor_user_id,decision,reason)
    values(u.id,auth.uid(),'view_requested','Authorized preview requested'); end if;
  if not p_for_completion and not carer_media_private.reviewer_allowed(u.case_id) and
    not (u.author_user_id=auth.uid() and carer_communication_private.actor_allowed(u.case_id,auth.uid(),'carer','carer.media.read')) then
    select max(expires_at) into access_until from public.evidence_sharing_grants
      where evidence_record_id=u.evidence_record_id and grantee_user_id=auth.uid() and revoked_at is null and expires_at>statement_timestamp();
  end if;
  return jsonb_build_object('id',u.id,'bucket','carer-media','path',u.storage_path,'mimeType',u.mime_type,'byteSize',u.declared_bytes,
    'state',u.upload_state,'accessExpiresAt',access_until);
end $$;
-- This one RPC is exclusively for the backend's verifier. The actor UUID is obtained
-- from getUser(bearer), never from request JSON. No client can assert a verified hash.
create function carer_media_private.finalize_carer_media(p_upload_id uuid,p_actor_user_id uuid,p_sha256 text,p_actual_bytes bigint,p_verified_mime text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u public.carer_media_uploads;
begin
  select * into u from public.carer_media_uploads where id=p_upload_id for update;
  if not found or u.author_user_id is distinct from p_actor_user_id or
    not carer_communication_private.actor_allowed(u.case_id,p_actor_user_id,'carer','carer.media.upload') or
    p_sha256 is null or p_sha256!~'^[0-9a-f]{64}$' or p_actual_bytes is distinct from u.declared_bytes or
    p_verified_mime is distinct from u.mime_type or not exists(select 1 from storage.objects where bucket_id='carer-media' and name=u.storage_path) then
    raise exception 'Current original uploader and verified stored bytes required' using errcode='42501'; end if;
  if u.upload_state='ready' then
    if not exists(select 1 from public.evidence_files where id=u.file_id and sha256_hash=p_sha256 and file_size_bytes=p_actual_bytes) then
      raise exception 'Stored media verification mismatch' using errcode='42501'; end if;
    return jsonb_build_object('id',u.id,'state','ready');
  end if;
  insert into public.evidence_records(id,tenant_id,case_id,evidence_reference,evidence_title,evidence_description,evidence_type,
    evidence_source,evidence_status,privacy_level,uploader_user_id)
    values(u.planned_evidence_id,u.tenant_id,u.case_id,'CARER-MEDIA-'||u.id::text,u.title,u.description,
      case when u.mime_type like 'image/%' then 'image' else 'video' end,'carer_portal','uploaded','worker_only',u.author_user_id);
  insert into public.evidence_files(id,tenant_id,evidence_record_id,file_reference,bucket_name,storage_path,original_filename,
    storage_filename,file_extension,file_size_bytes,media_type,sha256_hash,integrity_status,virus_scan_status)
    values(u.file_id,u.tenant_id,u.planned_evidence_id,'CARER-FILE-'||u.file_id::text,'carer-media',u.storage_path,u.original_filename,'original',
      case u.mime_type when 'image/jpeg' then 'jpg' when 'image/png' then 'png' when 'image/webp' then 'webp' when 'video/mp4' then 'mp4' else 'mov' end,
      p_actual_bytes,u.mime_type,p_sha256,'hash_recorded','pending');
  update public.carer_media_uploads set evidence_record_id=u.planned_evidence_id,upload_state='ready',verified_at=statement_timestamp() where id=u.id;
  insert into public.carer_media_review_events(upload_id,actor_user_id,decision,reason)
    values(u.id,p_actor_user_id,'bytes_verified','Backend checked stored byte size, format signature and SHA-256. No authenticity or virus-scan claim.');
  return jsonb_build_object('id',u.id,'state','ready');
end $$;
create function carer_media_private.list_carer_media() returns jsonb language sql stable security definer set search_path='' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'operationalCaseId',u.case_id,'title',u.title,'description',u.description,
    'mimeType',u.mime_type,'byteSize',u.declared_bytes,'state',u.upload_state,'createdAt',u.created_at,'isMine',u.author_user_id=auth.uid(),
    'reviewStatus',coalesce((select e.decision from public.carer_media_review_events e where e.upload_id=u.id and e.decision in ('approved','rejected')
      order by e.occurred_at desc,e.id desc limit 1),'pending'),
    'parentSharing',exists(select 1 from public.evidence_sharing_grants g where g.evidence_record_id=u.evidence_record_id and g.revoked_at is null
      and g.expires_at>statement_timestamp() and carer_media_private.parent_member(u.case_id,g.grantee_user_id) is not null),
    'canReview',u.upload_state='ready' and u.author_user_id<>auth.uid() and carer_media_private.reviewer_allowed(u.case_id))
    order by u.created_at desc),'[]'::jsonb)
  from (select * from public.carer_media_uploads where carer_media_private.can_read(id) order by created_at desc,id desc limit 100) u
$$;
create function carer_media_private.list_carer_media_recipients(p_upload_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare u public.carer_media_uploads; result jsonb;
begin
  select * into u from public.carer_media_uploads where id=p_upload_id;
  if not found or not carer_media_private.reviewer_allowed(u.case_id) then
    raise exception 'Assigned media reviewer required' using errcode='42501'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',x.user_id,
    'displayName',coalesce(nullif(btrim(fm.display_name),''),nullif(btrim(concat_ws(' ',fm.legal_first_name,fm.legal_last_name)),''),'Parent person record'),
    'memberReference',fm.member_reference) order by x.user_id),'[]'::jsonb)
    into result from (select distinct cp.user_id from public.case_participants cp where cp.case_id=u.case_id and cp.tenant_id=u.tenant_id
      and carer_media_private.parent_member(u.case_id,cp.user_id) is not null) x
    join public.family_members fm on fm.id=carer_media_private.parent_member(u.case_id,x.user_id);
  return result;
end $$;
create function carer_media_private.review_carer_media(p_upload_id uuid,p_decision text,p_parent_user_id uuid,p_expires_at timestamptz,p_reason text,p_original_confirmed boolean default false)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u public.carer_media_uploads; old_grant public.evidence_sharing_grants; new_grant uuid=gen_random_uuid();
begin
  select * into u from public.carer_media_uploads where id=p_upload_id for update;
  if not found or u.upload_state<>'ready' or u.author_user_id=auth.uid() or not carer_media_private.reviewer_allowed(u.case_id) or
    p_decision is null or p_decision not in ('approved','rejected') or p_reason is null or char_length(btrim(p_reason))=0 or char_length(p_reason)>2000 then
    raise exception 'Assigned independent reviewer and reason required' using errcode='42501'; end if;
  if p_decision='approved' and (p_parent_user_id is null or
    carer_media_private.parent_member(u.case_id,p_parent_user_id) is null or p_original_confirmed is distinct from true or
    p_expires_at is null or p_expires_at<=statement_timestamp() or p_expires_at>statement_timestamp()+interval '30 day') then
    raise exception 'Current parent participant and bounded sharing expiry required' using errcode='42501'; end if;
  for old_grant in select * from public.evidence_sharing_grants where evidence_record_id=u.evidence_record_id and revoked_at is null
    and (p_decision='rejected' or grantee_user_id=p_parent_user_id) for update
  loop
    insert into public.carer_media_review_events(upload_id,actor_user_id,parent_user_id,grant_id,decision,reason)
      values(u.id,auth.uid(),old_grant.grantee_user_id,old_grant.id,'revoked',btrim(p_reason));
    update public.evidence_sharing_grants set revoked_at=statement_timestamp() where id=old_grant.id;
  end loop;
  if p_decision='approved' then
    insert into public.carer_media_review_events(upload_id,actor_user_id,parent_user_id,grant_id,decision,reason,original_disclosure_confirmed)
      values(u.id,auth.uid(),p_parent_user_id,new_grant,'approved',btrim(p_reason),true);
    insert into public.evidence_sharing_grants(id,tenant_id,evidence_record_id,share_target_type,grantee_user_id,access_level,
      download_allowed,watermark_required,audit_required,expires_at,granted_by_user_id)
      values(new_grant,u.tenant_id,u.evidence_record_id,'parent',p_parent_user_id,'read_only',false,false,true,p_expires_at,auth.uid());
  else
    insert into public.carer_media_review_events(upload_id,actor_user_id,decision,reason) values(u.id,auth.uid(),'rejected',btrim(p_reason));
  end if;
  return jsonb_build_object('id',u.id,'decision',p_decision);
end $$;
create function public.reserve_carer_media(p_case_id uuid,p_submission_id uuid,p_filename text,p_title text,p_description text,p_mime text,p_bytes bigint)
returns jsonb language sql security invoker set search_path='' as $$
  select carer_media_private.reserve_carer_media(p_case_id,p_submission_id,p_filename,p_title,p_description,p_mime,p_bytes)
$$;
create function public.get_carer_media_location(p_upload_id uuid,p_for_completion boolean default false)
returns jsonb language sql security invoker set search_path='' as $$
  select carer_media_private.get_carer_media_location(p_upload_id,p_for_completion)
$$;
create function public.finalize_carer_media(p_upload_id uuid,p_actor_user_id uuid,p_sha256 text,p_actual_bytes bigint,p_verified_mime text)
returns jsonb language sql security invoker set search_path='' as $$
  select carer_media_private.finalize_carer_media(p_upload_id,p_actor_user_id,p_sha256,p_actual_bytes,p_verified_mime)
$$;
create function public.list_carer_media() returns jsonb language sql stable security invoker set search_path='' as $$
  select carer_media_private.list_carer_media()
$$;
create function public.list_carer_media_recipients(p_upload_id uuid) returns jsonb language sql stable security invoker set search_path='' as $$
  select carer_media_private.list_carer_media_recipients(p_upload_id)
$$;
create function public.review_carer_media(p_upload_id uuid,p_decision text,p_parent_user_id uuid,p_expires_at timestamptz,p_reason text,p_original_confirmed boolean default false)
returns jsonb language sql security invoker set search_path='' as $$
  select carer_media_private.review_carer_media(p_upload_id,p_decision,p_parent_user_id,p_expires_at,p_reason,p_original_confirmed)
$$;
revoke all on function carer_media_private.reserve_carer_media(uuid,uuid,text,text,text,text,bigint),carer_media_private.get_carer_media_location(uuid,boolean),
  carer_media_private.list_carer_media(),carer_media_private.list_carer_media_recipients(uuid),carer_media_private.review_carer_media(uuid,text,uuid,timestamptz,text,boolean)
  from public,anon,service_role;
grant execute on function carer_media_private.reserve_carer_media(uuid,uuid,text,text,text,text,bigint),carer_media_private.get_carer_media_location(uuid,boolean),
  carer_media_private.list_carer_media(),carer_media_private.list_carer_media_recipients(uuid),carer_media_private.review_carer_media(uuid,text,uuid,timestamptz,text,boolean) to authenticated;
revoke all on function carer_media_private.finalize_carer_media(uuid,uuid,text,bigint,text) from public,anon,authenticated;
grant execute on function carer_media_private.finalize_carer_media(uuid,uuid,text,bigint,text) to service_role;
revoke all on function public.reserve_carer_media(uuid,uuid,text,text,text,text,bigint),public.get_carer_media_location(uuid,boolean),
  public.list_carer_media(),public.list_carer_media_recipients(uuid),public.review_carer_media(uuid,text,uuid,timestamptz,text,boolean)
  from public,anon,service_role;
grant execute on function public.reserve_carer_media(uuid,uuid,text,text,text,text,bigint),public.get_carer_media_location(uuid,boolean),
  public.list_carer_media(),public.list_carer_media_recipients(uuid),public.review_carer_media(uuid,text,uuid,timestamptz,text,boolean) to authenticated;
revoke all on function public.finalize_carer_media(uuid,uuid,text,bigint,text) from public,anon,authenticated;
grant execute on function public.finalize_carer_media(uuid,uuid,text,bigint,text) to service_role;
