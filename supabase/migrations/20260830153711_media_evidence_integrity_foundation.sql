-- Media evidence foundation; locally tested, production ingestion intentionally disabled.
-- Intentionally no buckets: a private Supabase bucket is not retention-enforced WORM.
-- Ordinary clients have no direct table privileges; every read passes the audited API.
begin;

create table public.media_case_scopes (
  case_id uuid primary key references public.reunification_cases(id) on delete restrict,
  family_id uuid not null references public.families(id) on delete restrict,
  approved_by uuid not null references auth.users(id) on delete restrict,
  approved_at timestamptz not null default now(),
  unique (case_id, family_id)
);

create table public.evidence_consents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.media_case_scopes(case_id) on delete restrict,
  subject_id uuid not null references auth.users(id) on delete restrict,
  authority_type text not null check (authority_type in ('self', 'reviewed_representative', 'reviewed_legal_authority')),
  authority_reference text not null check (length(authority_reference) between 1 and 500),
  reviewed_by uuid not null references auth.users(id) on delete restrict,
  notice_version text not null,
  purposes text[] not null check (purposes <@ array['collect','view','review','analyse','export']::text[]),
  restrictions jsonb not null default '{}'::jsonb,
  granted_at timestamptz not null default now(),
  expires_at timestamptz not null check (expires_at > granted_at),
  supersedes_id uuid references public.evidence_consents(id) on delete restrict,
  unique(id, case_id)
);

create table public.media_evidence (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null,
  family_id uuid not null,
  child_id uuid references public.child_profiles(id) on delete restrict,
  consent_id uuid not null,
  media_type text not null check (media_type in ('photo','video','audio')),
  source_type text not null check (source_type in ('in_app_capture','device_upload','professional_upload')),
  original_filename text not null check (length(original_filename) between 1 and 255),
  mime_type text not null,
  byte_size bigint not null check (byte_size between 1 and 10737418240),
  sha256 text check (sha256 ~ '^[a-f0-9]{64}$'),
  claimed_captured_at timestamptz,
  extracted_captured_at timestamptz,
  claimed_device jsonb not null default '{}'::jsonb,
  uploaded_at timestamptz not null default now(),
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  upload_status text not null default 'initiated' check (upload_status in ('initiated','preserving','preserved','failed')),
  integrity_status text not null default 'pending' check (integrity_status in ('pending','verified','verification_failed')),
  safety_status text not null default 'quarantined' check (safety_status in ('quarantined','scanning','cleared','restricted','escalated')),
  analysis_status text not null default 'not_started' check (analysis_status in ('not_started','queued','processing','human_review_required','completed','failed')),
  retention_class text not null,
  legal_hold boolean not null default false,
  foreign key (case_id, family_id) references public.media_case_scopes(case_id, family_id) on delete restrict,
  foreign key (consent_id, case_id) references public.evidence_consents(id, case_id) on delete restrict,
  check (integrity_status <> 'verified' or (sha256 is not null and upload_status = 'preserved')),
  check (safety_status <> 'cleared' or integrity_status = 'verified'),
  unique(id, case_id)
);

create table public.media_evidence_grants (
  id uuid primary key default gen_random_uuid(),
  evidence_id uuid not null,
  case_id uuid not null,
  user_id uuid not null references auth.users(id) on delete restrict,
  evidence_role text not null check (evidence_role in ('parent','child','caseworker','lawyer','court_reviewer','forensic_reviewer','safety_officer')),
  capabilities text[] not null check (capabilities <@ array['view','review','export','analyse','legal_hold','report_restriction','safety']::text[]),
  granted_by uuid not null references auth.users(id) on delete restrict,
  authority_reference text not null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz not null check (expires_at > granted_at),
  foreign key (evidence_id, case_id) references public.media_evidence(id, case_id) on delete restrict
);

-- Revocation is an event, never an overwrite of consent or sharing history.
create table public.media_authority_revocations (
  id uuid primary key default gen_random_uuid(),
  consent_id uuid references public.evidence_consents(id) on delete restrict,
  grant_id uuid references public.media_evidence_grants(id) on delete restrict,
  actor_id uuid not null references auth.users(id) on delete restrict,
  reason text not null,
  created_at timestamptz not null default now(),
  check ((consent_id is null) <> (grant_id is null))
);

create table public.media_files (
  id uuid primary key default gen_random_uuid(),
  evidence_id uuid not null references public.media_evidence(id) on delete restrict,
  kind text not null check (kind in ('original','working','preview','frame','export')),
  provider text not null,
  bucket text not null,
  object_key text not null,
  object_version text not null,
  byte_size bigint not null check (byte_size > 0),
  parent_file_id uuid,
  transform_version text,
  retention_receipt jsonb,
  created_at timestamptz not null default now(),
  unique(id, evidence_id),
  unique(provider,bucket,object_key,object_version),
  foreign key(parent_file_id,evidence_id) references public.media_files(id,evidence_id) on delete restrict,
  check (kind <> 'original' or (parent_file_id is null and retention_receipt is not null))
);
create unique index media_one_original on public.media_files(evidence_id) where kind = 'original';

create table public.media_hashes (
  id uuid primary key default gen_random_uuid(),
  evidence_id uuid not null,
  file_id uuid not null,
  algorithm text not null default 'sha256' check (algorithm = 'sha256'),
  digest text not null check (digest ~ '^[a-f0-9]{64}$'),
  byte_size bigint not null check (byte_size > 0),
  object_version text not null,
  verifier_version text not null,
  purpose text not null check (purpose in ('ingest','preservation','recheck','export')),
  created_at timestamptz not null default now(),
  foreign key(file_id,evidence_id) references public.media_files(id,evidence_id) on delete restrict
);

create table public.media_metadata (
  id uuid primary key default gen_random_uuid(), evidence_id uuid not null, file_id uuid not null,
  extractor_version text not null, raw_metadata jsonb not null, normalised jsonb not null,
  warnings jsonb not null default '[]'::jsonb, created_at timestamptz not null default now(),
  foreign key(file_id,evidence_id) references public.media_files(id,evidence_id) on delete restrict
);

create table public.media_analysis_jobs (
  id uuid primary key default gen_random_uuid(), evidence_id uuid not null, input_file_id uuid not null,
  input_sha256 text not null check (input_sha256 ~ '^[a-f0-9]{64}$'),
  job_type text not null, provider text not null, model_version text not null, tool_version text not null,
  config_digest text not null check (config_digest ~ '^[a-f0-9]{64}$'),
  status text not null default 'queued' check (status in ('queued','processing','human_review_required','completed','failed','cancelled')),
  attempt integer not null default 0 check (attempt >= 0), error_code text,
  created_at timestamptz not null default now(), unique(id,evidence_id),
  unique(evidence_id,input_sha256,job_type,model_version,tool_version,config_digest),
  foreign key(input_file_id,evidence_id) references public.media_files(id,evidence_id) on delete restrict
);

create table public.media_findings (
  id uuid primary key default gen_random_uuid(), evidence_id uuid not null, job_id uuid not null, source_file_id uuid not null,
  finding text not null, confidence numeric check (confidence between 0 and 1), confidence_basis text not null,
  source_time_ms bigint check (source_time_ms >= 0), source_region jsonb,
  method text not null, model_version text not null, limitations text not null check (length(limitations) > 0),
  review_status text not null default 'human_review_required' check (review_status = 'human_review_required'),
  supersedes_id uuid, created_at timestamptz not null default now(), unique(id,evidence_id),
  foreign key(job_id,evidence_id) references public.media_analysis_jobs(id,evidence_id) on delete restrict,
  foreign key(source_file_id,evidence_id) references public.media_files(id,evidence_id) on delete restrict,
  foreign key(supersedes_id,evidence_id) references public.media_findings(id,evidence_id) on delete restrict
);

create table public.media_transcripts (
  id uuid primary key default gen_random_uuid(), evidence_id uuid not null, job_id uuid not null, source_file_id uuid not null,
  start_ms bigint not null check (start_ms >= 0), end_ms bigint not null check (end_ms >= start_ms),
  text text not null, language text not null, supersedes_id uuid, created_at timestamptz not null default now(), unique(id,evidence_id),
  foreign key(job_id,evidence_id) references public.media_analysis_jobs(id,evidence_id) on delete restrict,
  foreign key(source_file_id,evidence_id) references public.media_files(id,evidence_id) on delete restrict,
  foreign key(supersedes_id,evidence_id) references public.media_transcripts(id,evidence_id) on delete restrict
);

create table public.media_frames (
  id uuid primary key default gen_random_uuid(), evidence_id uuid not null, job_id uuid not null,
  source_file_id uuid not null, frame_file_id uuid not null, presentation_time_ms bigint not null check (presentation_time_ms >= 0),
  extractor_version text not null, created_at timestamptz not null default now(),
  foreign key(job_id,evidence_id) references public.media_analysis_jobs(id,evidence_id) on delete restrict,
  foreign key(source_file_id,evidence_id) references public.media_files(id,evidence_id) on delete restrict,
  foreign key(frame_file_id,evidence_id) references public.media_files(id,evidence_id) on delete restrict
);

create table public.media_reviews (
  id uuid primary key default gen_random_uuid(), evidence_id uuid not null references public.media_evidence(id) on delete restrict,
  finding_id uuid not null, reviewer_id uuid not null references auth.users(id) on delete restrict,
  decision text not null check (decision in ('accepted','rejected','inconclusive','disagreed')),
  rationale text not null check (length(rationale) between 1 and 10000), qualification_reference text not null,
  supersedes_id uuid, request_id uuid not null, created_at timestamptz not null default now(),
  unique(id,evidence_id), unique(reviewer_id,request_id),
  foreign key(finding_id,evidence_id) references public.media_findings(id,evidence_id) on delete restrict,
  foreign key(supersedes_id,evidence_id) references public.media_reviews(id,evidence_id) on delete restrict
);

create table public.evidence_custody_events (
  id uuid primary key default gen_random_uuid(), evidence_id uuid not null references public.media_evidence(id) on delete restrict,
  sequence bigint not null, actor_id uuid not null references auth.users(id) on delete restrict,
  action text not null, request_id uuid not null, payload jsonb not null default '{}'::jsonb,
  previous_hash text not null, event_hash text not null, envelope jsonb not null,
  created_at timestamptz not null default now(), unique(evidence_id,sequence), unique(evidence_id,actor_id,request_id,action)
);

create table public.evidence_access_log (
  id uuid primary key default gen_random_uuid(), evidence_id uuid references public.media_evidence(id) on delete restrict,
  actor_id uuid not null references auth.users(id) on delete restrict, action text not null,
  allowed boolean not null, outcome text not null, request_id uuid not null,
  created_at timestamptz not null default now()
);

create table public.evidence_exports (
  id uuid primary key default gen_random_uuid(), evidence_id uuid not null references public.media_evidence(id) on delete restrict,
  requested_by uuid not null references auth.users(id) on delete restrict, scope jsonb not null,
  status text not null default 'queued' check (status in ('queued','processing','ready','failed','revoked')),
  manifest_sha256 text check (manifest_sha256 ~ '^[a-f0-9]{64}$'), file_id uuid,
  expires_at timestamptz not null, created_at timestamptz not null default now(),
  foreign key(file_id,evidence_id) references public.media_files(id,evidence_id) on delete restrict
);

create table public.restricted_media_incidents (
  id uuid primary key default gen_random_uuid(), evidence_id uuid not null references public.media_evidence(id) on delete restrict,
  reported_by uuid not null references auth.users(id) on delete restrict,
  category text not null check (category in ('suspected_illegal_content','privacy_concern','other_safety_concern')),
  status text not null default 'restricted' check (status in ('restricted','escalated','resolved')),
  authority_reference text, request_id uuid not null, created_at timestamptz not null default now(),
  unique(reported_by, request_id)
);

create function public.media_reject_mutation() returns trigger language plpgsql security invoker set search_path = '' as $$
begin raise exception 'Media evidence history is append-only'; end;
$$;

create function public.media_guard_evidence() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.integrity_status = 'verified' and not exists (
    select 1 from public.media_files f join public.media_hashes h on h.file_id = f.id and h.evidence_id = f.evidence_id
    where f.evidence_id = new.id and f.kind = 'original' and h.purpose = 'preservation'
      and h.digest = new.sha256 and h.byte_size = new.byte_size and f.byte_size = new.byte_size
      and h.object_version = f.object_version and f.retention_receipt is not null
  ) then raise exception 'A preserved original and matching readback receipt are required'; end if;
  if tg_op = 'INSERT' then
    if new.child_id is not null and not exists(select 1 from public.child_profiles p where p.id = new.child_id and p.case_id = new.case_id) then
      raise exception 'Child does not belong to this case';
    end if;
    return new;
  end if;
  if row(new.id,new.case_id,new.family_id,new.child_id,new.consent_id,new.uploaded_by,new.uploaded_at,new.original_filename,new.mime_type,new.byte_size,new.source_type,new.media_type,new.claimed_captured_at,new.claimed_device,new.retention_class)
     is distinct from row(old.id,old.case_id,old.family_id,old.child_id,old.consent_id,old.uploaded_by,old.uploaded_at,old.original_filename,old.mime_type,old.byte_size,old.source_type,old.media_type,old.claimed_captured_at,old.claimed_device,old.retention_class)
     or (old.sha256 is not null and new.sha256 is distinct from old.sha256) then
    raise exception 'Original evidence identity cannot be overwritten';
  end if;
  if old.legal_hold and not new.legal_hold then raise exception 'Legal hold release is not enabled'; end if;
  return new;
end;
$$;
create trigger media_evidence_identity before insert or update on public.media_evidence for each row execute function public.media_guard_evidence();
create trigger media_evidence_no_delete before delete on public.media_evidence for each row execute function public.media_reject_mutation();
create trigger media_evidence_no_truncate before truncate on public.media_evidence for each statement execute function public.media_reject_mutation();

create function public.media_seal_custody() returns trigger language plpgsql security invoker set search_path = '' as $$
declare prior public.evidence_custody_events;
begin
  perform 1 from public.media_evidence where id = new.evidence_id for update;
  select * into prior from public.evidence_custody_events where evidence_id = new.evidence_id order by sequence desc limit 1;
  new.sequence := coalesce(prior.sequence,0) + 1;
  new.previous_hash := coalesce(prior.event_hash,repeat('0',64));
  new.created_at := clock_timestamp();
  new.envelope := jsonb_build_object('version',1,'evidenceId',new.evidence_id,'sequence',new.sequence,
    'actorId',new.actor_id,'action',new.action,'requestId',new.request_id,'payload',new.payload,
    'previousHash',new.previous_hash,'createdAt',new.created_at);
  new.event_hash := encode(sha256(convert_to(new.envelope::text,'UTF8')),'hex');
  return new;
end;
$$;
create trigger media_custody_seal before insert on public.evidence_custody_events for each row execute function public.media_seal_custody();

-- Server-only access avoids unlogged direct reads and client-supplied verification records.
do $$
declare t text;
begin
  foreach t in array array['media_case_scopes','evidence_consents','media_evidence','media_evidence_grants','media_authority_revocations','media_files','media_hashes','media_metadata','media_analysis_jobs','media_findings','media_transcripts','media_frames','media_reviews','evidence_custody_events','evidence_access_log','evidence_exports','restricted_media_incidents'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on table public.%I from public, anon, authenticated, service_role',t);
    execute format('grant select on table public.%I to service_role',t);
    if t not in ('media_case_scopes','evidence_consents','media_evidence_grants','media_authority_revocations') then
      execute format('grant insert on table public.%I to service_role',t);
    end if;
    if t in ('media_evidence','media_analysis_jobs','evidence_exports') then
      execute format('grant update on table public.%I to service_role',t);
    else
      execute format('create trigger media_append_only before update or delete on public.%I for each row execute function public.media_reject_mutation()',t);
    end if;
    if t <> 'media_evidence' then
      execute format('create trigger media_no_truncate before truncate on public.%I for each statement execute function public.media_reject_mutation()',t);
    end if;
  end loop;
end;
$$;

create index media_evidence_case_time on public.media_evidence(case_id,uploaded_at desc);
create index media_evidence_case_digest on public.media_evidence(case_id,sha256) where sha256 is not null;
create index media_grants_subject on public.media_evidence_grants(user_id,evidence_id,expires_at);
create index media_revoked_consents on public.media_authority_revocations(consent_id);
create index media_revoked_grants on public.media_authority_revocations(grant_id);
create index media_access_evidence_time on public.evidence_access_log(evidence_id,created_at desc);

-- Narrow, service-only RPC. The backend supplies an identity validated by Supabase Auth.
-- Checks and append-only audit happen in the same transaction as the requested action.
create function public.media_evidence_operation(p_actor uuid, p_session text, p_action text, p_evidence uuid, p_body jsonb, p_request uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  e public.media_evidence; g public.media_evidence_grants; c public.evidence_consents;
  capability text; result jsonb; previous public.evidence_custody_events;
  status_code integer := 200; outcome text := 'allowed'; allowed boolean := false;
  result_id uuid; target_finding uuid; target_review uuid;
begin
  if p_actor is null or p_session is null or p_request is null then return jsonb_build_object('ok',false,'status',401,'code','MEDIA_AUTH_REQUIRED'); end if;
  if not exists(select 1 from public.user_security_sessions s where s.user_id = p_actor and s.auth_session_reference = p_session and s.revoked_at is null) then
    return jsonb_build_object('ok',false,'status',401,'code','MEDIA_SESSION_INVALID');
  end if;
  select * into e from public.media_evidence where id = p_evidence for update;
  capability := case p_action when 'review' then 'review' when 'export' then 'export'
    when 'request-analysis' then 'analyse' when 'legal-hold' then 'legal_hold'
    when 'report-restriction' then 'report_restriction' else 'view' end;
  if e.id is not null and exists(select 1 from public.case_memberships m where m.case_id = e.case_id and m.user_id = p_actor and m.status = 'active') then
    select * into g from public.media_evidence_grants x where x.user_id = p_actor and x.evidence_id = e.id
      and capability = any(x.capabilities) and x.granted_at <= now() and x.expires_at > now()
      and not exists(select 1 from public.media_authority_revocations r where r.grant_id = x.id)
      order by x.expires_at desc limit 1;
    select * into c from public.evidence_consents x where x.id = e.consent_id and x.granted_at <= now() and x.expires_at > now()
      and not exists(select 1 from public.media_authority_revocations r where r.consent_id = x.id);
    allowed := g.id is not null and (p_action = 'report-restriction' or (c.id is not null
      and (case p_action when 'review' then 'review' when 'export' then 'export' when 'request-analysis' then 'analyse' else 'view' end) = any(c.purposes)));
    if g.evidence_role in ('parent','child') and e.uploaded_by <> p_actor then allowed := false; end if;
    if p_action = 'review' and g.evidence_role <> 'forensic_reviewer' then allowed := false; end if;
    if g.evidence_role = 'court_reviewer' and p_action not in ('export') then allowed := false; end if;
  end if;
  if not allowed then
    insert into public.evidence_access_log(evidence_id,actor_id,action,allowed,outcome,request_id)
      values(e.id,p_actor,p_action,false,'not_authorised',p_request);
    return jsonb_build_object('ok',false,'status',404,'code','MEDIA_NOT_FOUND','message','Evidence was not found or is not accessible.');
  end if;

  -- Retry keys cannot be reused for a different action/payload, including after a restriction.
  select * into previous from public.evidence_custody_events where evidence_id = e.id and actor_id = p_actor and request_id = p_request order by sequence limit 1;
  if previous.id is not null then
    if previous.action <> p_action or previous.payload->'request' is distinct from coalesce(p_body,'{}'::jsonb) then
      return jsonb_build_object('ok',false,'status',409,'code','MEDIA_IDEMPOTENCY_CONFLICT','message','This retry key has already been used.');
    end if;
    if p_action in ('review','report-restriction') then
      insert into public.evidence_access_log(evidence_id,actor_id,action,allowed,outcome,request_id) values(e.id,p_actor,p_action,true,'idempotent_retry',p_request);
      return previous.payload->'response';
    end if;
  end if;

  if p_action not in ('summary','custody','report-restriction') and (e.safety_status <> 'cleared' or e.integrity_status <> 'verified') then
    status_code := 409; outcome := 'media_not_cleared';
    result := jsonb_build_object('ok',false,'status',409,'code','MEDIA_NOT_CLEARED','message','Media is not cleared and verified for this action.');
  elsif p_action = 'summary' then
    result := jsonb_build_object('ok',true,'evidence',jsonb_build_object('id',e.id,'caseId',e.case_id,'familyId',e.family_id,'childId',e.child_id,
      'mediaType',e.media_type,'sourceType',e.source_type,'originalFilename',e.original_filename,'mimeType',e.mime_type,'byteSize',e.byte_size,'sha256',e.sha256,
      'claimedCapturedAt',e.claimed_captured_at,'extractedCapturedAt',e.extracted_captured_at,'uploadedAt',e.uploaded_at,'uploadedBy',e.uploaded_by,
      'uploadStatus',e.upload_status,'integrityStatus',e.integrity_status,'safetyStatus',e.safety_status,'analysisStatus',e.analysis_status,'retentionClass',e.retention_class,'legalHold',e.legal_hold));
  elsif p_action = 'custody' then
    select coalesce(jsonb_agg(to_jsonb(q) order by q.sequence),'[]'::jsonb) into result from
      (select sequence,action,event_hash,previous_hash,envelope,created_at from public.evidence_custody_events where evidence_id = e.id order by sequence limit 500) q;
    result := jsonb_build_object('ok',true,'events',result,'limit',500);
  elsif p_action = 'metadata' then
    select coalesce(jsonb_agg(to_jsonb(q)),'[]'::jsonb) into result from
      (select id,file_id,extractor_version,jsonb_build_object('width',normalised->'width','height',normalised->'height',
        'durationMs',normalised->'durationMs','codec',normalised->'codec','capturedAt',normalised->'capturedAt') as metadata,created_at
        from public.media_metadata where evidence_id = e.id order by created_at limit 500) q;
    result := jsonb_build_object('ok',true,'metadata',result,'limit',500);
  elsif p_action = 'findings' then
    select coalesce(jsonb_agg(to_jsonb(q)),'[]'::jsonb) into result from
      (select * from public.media_findings where evidence_id = e.id order by created_at,id limit 500) q;
    result := jsonb_build_object('ok',true,'findings',result,'limit',500);
  elsif p_action = 'transcript' then
    select coalesce(jsonb_agg(to_jsonb(q) order by q.start_ms),'[]'::jsonb) into result from
      (select * from public.media_transcripts where evidence_id = e.id order by start_ms,id limit 500) q;
    result := jsonb_build_object('ok',true,'segments',result,'limit',500);
  elsif p_action = 'review' then
    if jsonb_typeof(p_body) <> 'object' or p_body - array['findingId','decision','rationale','qualificationReference','supersedesId'] <> '{}'::jsonb
       or coalesce(p_body->>'decision','') not in ('accepted','rejected','inconclusive','disagreed')
       or coalesce(length(trim(p_body->>'rationale')),0) not between 1 and 10000
       or coalesce(length(trim(p_body->>'qualificationReference')),0) not between 1 and 500 then
      return jsonb_build_object('ok',false,'status',400,'code','MEDIA_INVALID_REVIEW','message','A decision, rationale and qualification reference are required.');
    end if;
    begin
      target_finding := (p_body->>'findingId')::uuid; target_review := (p_body->>'supersedesId')::uuid;
    exception when invalid_text_representation then
      return jsonb_build_object('ok',false,'status',400,'code','MEDIA_INVALID_REVIEW');
    end;
    if target_finding is null or not exists(select 1 from public.media_findings where id = target_finding and evidence_id = e.id)
       or (target_review is not null and not exists(select 1 from public.media_reviews where id = target_review and evidence_id = e.id and reviewer_id = p_actor and finding_id = target_finding)) then
      return jsonb_build_object('ok',false,'status',400,'code','MEDIA_INVALID_REVIEW','message','The finding or correction target is invalid.');
    end if;
    insert into public.media_reviews(evidence_id,finding_id,reviewer_id,decision,rationale,qualification_reference,supersedes_id,request_id)
      values(e.id,target_finding,p_actor,p_body->>'decision',p_body->>'rationale',p_body->>'qualificationReference',target_review,p_request) returning id into result_id;
    result := jsonb_build_object('ok',true,'status',201,'reviewId',result_id);
  elsif p_action = 'report-restriction' then
    if jsonb_typeof(p_body) <> 'object' or p_body - 'category' <> '{}'::jsonb
       or coalesce(p_body->>'category','') not in ('suspected_illegal_content','privacy_concern','other_safety_concern') then
      return jsonb_build_object('ok',false,'status',400,'code','MEDIA_INVALID_RESTRICTION','message','A supported restriction category is required.');
    end if;
    update public.media_evidence set safety_status = 'restricted' where id = e.id;
    update public.media_analysis_jobs set status = 'cancelled' where evidence_id = e.id and status in ('queued','processing');
    update public.evidence_exports set status = 'revoked' where evidence_id = e.id and status in ('queued','processing','ready');
    insert into public.restricted_media_incidents(evidence_id,reported_by,category,request_id) values(e.id,p_actor,p_body->>'category',p_request) returning id into result_id;
    result := jsonb_build_object('ok',true,'status',201,'incidentId',result_id,'safetyStatus','restricted');
  else
    status_code := 503; outcome := 'capability_not_configured';
    result := jsonb_build_object('ok',false,'status',503,'code','MEDIA_CAPABILITY_NOT_CONFIGURED',
      'message','This operation requires validated storage, safety and governance adapters. It is not enabled.');
  end if;

  insert into public.evidence_access_log(evidence_id,actor_id,action,allowed,outcome,request_id)
    values(e.id,p_actor,p_action,status_code < 400,outcome,p_request);
  -- Never put raw metadata/transcripts into the custody payload or duplicate them in telemetry.
  if p_action in ('review','report-restriction') and status_code < 400 then
    insert into public.evidence_custody_events(evidence_id,actor_id,action,request_id,payload)
      values(e.id,p_actor,p_action,p_request,jsonb_build_object('request',p_body,'response',result));
  else
    insert into public.evidence_custody_events(evidence_id,actor_id,action,request_id,payload)
      values(e.id,p_actor,p_action,p_request,jsonb_build_object('outcome',outcome)) on conflict do nothing;
  end if;
  return result;
end;
$$;

revoke all on function public.media_reject_mutation(), public.media_guard_evidence(), public.media_seal_custody() from public,anon,authenticated;
revoke all on function public.media_evidence_operation(uuid,text,text,uuid,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.media_evidence_operation(uuid,text,text,uuid,jsonb,uuid) to service_role;
commit;
