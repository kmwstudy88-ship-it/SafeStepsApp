-- Reconcile the proposed core/storage contract with the existing media foundation.
-- This does NOT enable ingestion or certify the buckets as immutable/WORM storage.
begin;

create type public.media_evidence_type as enum ('photo','video','audio');
create type public.evidence_safety_status as enum ('quarantined','scanning','cleared','restricted','escalated');
create type public.evidence_analysis_status as enum ('not_started','queued','processing','human_review_required','completed','failed');

-- Replace equivalent text checks without dropping the clearance/integrity invariant.
alter table public.media_evidence
  drop constraint media_evidence_media_type_check,
  drop constraint media_evidence_safety_status_check,
  drop constraint media_evidence_analysis_status_check,
  drop constraint media_evidence_check1,
  alter column safety_status drop default,
  alter column analysis_status drop default;

alter table public.media_evidence
  alter column media_type type public.media_evidence_type using media_type::public.media_evidence_type,
  alter column safety_status type public.evidence_safety_status using safety_status::public.evidence_safety_status,
  alter column analysis_status type public.evidence_analysis_status using analysis_status::public.evidence_analysis_status,
  alter column safety_status set default 'quarantined',
  alter column analysis_status set default 'not_started',
  alter column retention_class set default 'case_evidence',
  add constraint media_evidence_cleared_requires_verified check (safety_status <> 'cleared' or integrity_status = 'verified'),
  add column created_at timestamptz,
  add column updated_at timestamptz;

-- Invalidate cached PL/pgSQL record-field plans in already-open connections after
-- changing text columns to enums. Preserve the installed function bodies and grants.
do $$
begin
  execute pg_get_functiondef('public.media_guard_evidence()'::regprocedure);
  execute pg_get_functiondef('public.media_evidence_operation(uuid,text,text,uuid,jsonb,uuid)'::regprocedure);
end;
$$;

-- Backfill from the recorded upload time, not the date of this migration.
update public.media_evidence set created_at = uploaded_at, updated_at = uploaded_at;
alter table public.media_evidence
  alter column created_at set default now(), alter column created_at set not null,
  alter column updated_at set default now(), alter column updated_at set not null;

create function public.media_record_timestamps() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := statement_timestamp();
    new.updated_at := new.created_at;
  else
    if new.created_at is distinct from old.created_at then raise exception 'Evidence creation time cannot be overwritten'; end if;
    new.updated_at := clock_timestamp();
  end if;
  return new;
end;
$$;
revoke all on function public.media_record_timestamps() from public,anon,authenticated;
create trigger media_evidence_timestamps before insert or update on public.media_evidence
for each row execute function public.media_record_timestamps();

-- media_evidence_case_time already covers queries by case_id; do not duplicate it.
create index media_evidence_uploader_idx on public.media_evidence(uploaded_by);
create index media_evidence_safety_idx on public.media_evidence(safety_status);

-- Keep media_files/media_hashes as the canonical records instead of a second file table.
-- Unknown historical metadata remains null; all new files must declare their MIME type.
alter table public.media_files
  drop constraint media_files_kind_check,
  add constraint media_files_kind_check check (kind in ('original','working','preview','thumbnail','frame','export')),
  add column mime_type text,
  add column created_by uuid references auth.users(id) on delete restrict;

create function public.media_require_file_mime() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if new.mime_type is null or new.mime_type !~ '^[A-Za-z0-9!#$&^_.+-]+/[A-Za-z0-9!#$&^_.+-]+$'
      or length(new.mime_type) > 127 then raise exception 'New media files require a valid MIME type'; end if;
  return new;
end;
$$;
revoke all on function public.media_require_file_mime() from public,anon,authenticated;
create trigger media_file_mime before insert on public.media_files
for each row execute function public.media_require_file_mime();

-- Optional provenance fields are server-only and are not collected by current API routes.
-- Extend the hashed envelope version for new events; existing v1 envelopes stay untouched.
alter table public.evidence_custody_events
  add column actor_role text,
  add column source_ip inet,
  add column device_information jsonb not null default '{}'::jsonb;

create or replace function public.media_seal_custody() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare prior public.evidence_custody_events;
begin
  perform 1 from public.media_evidence where id = new.evidence_id for update;
  select * into prior from public.evidence_custody_events where evidence_id = new.evidence_id order by sequence desc limit 1;
  new.sequence := coalesce(prior.sequence,0) + 1;
  new.previous_hash := coalesce(prior.event_hash,repeat('0',64));
  new.created_at := clock_timestamp();
  new.envelope := jsonb_build_object('version',2,'evidenceId',new.evidence_id,'sequence',new.sequence,
    'actorId',new.actor_id,'actorRole',new.actor_role,'sourceIp',new.source_ip,'deviceInformation',new.device_information,
    'action',new.action,'requestId',new.request_id,'payload',new.payload,
    'previousHash',new.previous_hash,'createdAt',new.created_at);
  new.event_hash := encode(sha256(convert_to(new.envelope::text,'UTF8')),'hex');
  return new;
end;
$$;
revoke all on function public.media_seal_custody() from public,anon,authenticated;

insert into storage.buckets(id,name,public) values
  ('evidence-quarantine','evidence-quarantine',false),
  ('evidence-originals','evidence-originals',false),
  ('evidence-analysis','evidence-analysis',false),
  ('evidence-previews','evidence-previews',false)
on conflict(id) do update set public = false;

do $$
begin
  if (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'storage' and c.relname in ('objects','buckets') and c.relrowsecurity) <> 2 then
    raise exception 'Storage RLS must be enabled before installing media bucket policies';
  end if;
end;
$$;

-- Restrictive policies still deny these buckets if a legacy permissive policy is broad.
-- There is intentionally no mobile upload grant until an authorised, expiring intake
-- session and approved safety/preservation adapters exist. Future client INSERTs must
-- be confined to exact evidence-quarantine session paths, never the other buckets.
create policy media_storage_objects_require_gateway on storage.objects
as restrictive for all to anon,authenticated
using (bucket_id not in ('evidence-quarantine','evidence-originals','evidence-analysis','evidence-previews'))
with check (bucket_id not in ('evidence-quarantine','evidence-originals','evidence-analysis','evidence-previews'));

create policy media_storage_buckets_require_server on storage.buckets
as restrictive for all to anon,authenticated
using (id not in ('evidence-quarantine','evidence-originals','evidence-analysis','evidence-previews'))
with check (id not in ('evidence-quarantine','evidence-originals','evidence-analysis','evidence-previews'));

commit;
