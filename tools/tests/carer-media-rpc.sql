-- Empty isolated PostgreSQL instance only. Includes prior journal/messaging regression fixtures.
\set ON_ERROR_STOP on
\ir carer-communication-rpc.sql
alter table public.cases add column family_id uuid;
alter table public.case_participants add column family_member_id uuid;
create table public.family_members(id uuid primary key,tenant_id uuid,family_id uuid,member_reference text,display_name text,legal_first_name text,legal_last_name text);
update public.cases set family_id='ffffffff-ffff-4fff-8fff-ffffffffffff';
insert into public.family_members values('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','33333333-3333-4333-8333-333333333333',
 'ffffffff-ffff-4fff-8fff-ffffffffffff','FM-PARENT-FIXTURE','Case-linked parent','Fixture','Parent');
update public.case_participants set family_member_id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee' where user_id='44444444-4444-4444-8444-444444444444';
create table public.profiles(id uuid primary key references auth.users(id),display_name text);
insert into public.profiles values('44444444-4444-4444-8444-444444444444','Fixture parent');
create table public.evidence_records(id uuid primary key default gen_random_uuid(),tenant_id uuid,case_id uuid references public.cases(id),
 evidence_reference text not null,evidence_title text not null,evidence_description text,evidence_type text,evidence_source text,
 evidence_status text default 'uploaded',privacy_level text default 'worker_only',uploader_user_id uuid references auth.users(id),
 uploaded_at timestamptz default now(),legal_hold boolean default false,deleted boolean default false,created_at timestamptz default now(),updated_at timestamptz default now(),
 unique(tenant_id,evidence_reference));
create table public.evidence_files(id uuid primary key default gen_random_uuid(),tenant_id uuid,evidence_record_id uuid references public.evidence_records(id),
 file_reference text,bucket_name text,storage_path text,original_filename text,storage_filename text,file_extension text,file_size_bytes bigint,
 media_type text,sha256_hash text check(length(sha256_hash)>=32),integrity_status text default 'pending_verification',virus_scan_status text default 'pending',
 deleted boolean default false,unique(tenant_id,storage_path));
create table public.evidence_sharing_grants(id uuid primary key default gen_random_uuid(),tenant_id uuid,
 evidence_record_id uuid references public.evidence_records(id),share_target_type text,grantee_user_id uuid references auth.users(id),grantee_family_member_id uuid,
 external_recipient text,access_level text default 'read_only',download_allowed boolean default false,watermark_required boolean default true,
 audit_required boolean default true,expires_at timestamptz,revoked_at timestamptz,granted_by_user_id uuid references auth.users(id),created_at timestamptz default now());
create table public.evidence_metadata(id uuid primary key default gen_random_uuid(),evidence_file_id uuid references public.evidence_files(id),private_detail text);
create table public.evidence_ai_analyses(id uuid primary key default gen_random_uuid(),evidence_record_id uuid references public.evidence_records(id),private_detail text);
create table public.evidence_legal_holds(id uuid primary key default gen_random_uuid(),evidence_record_id uuid references public.evidence_records(id),hold_status text,released_at timestamptz);
alter table public.evidence_records enable row level security;
alter table public.evidence_files enable row level security;
alter table public.evidence_sharing_grants enable row level security;
alter table public.evidence_metadata enable row level security;
alter table public.evidence_ai_analyses enable row level security;
alter table public.evidence_legal_holds enable row level security;
grant select,insert,update,delete on public.evidence_records,public.evidence_files,public.evidence_sharing_grants,
 public.evidence_metadata,public.evidence_ai_analyses,public.evidence_legal_holds to authenticated;
set test.case_access='true';
create policy legacy_case_records on public.evidence_records for all to authenticated
 using(uploader_user_id=auth.uid() or current_setting('test.case_access',true)='true') with check(true);
create policy legacy_broad_files on public.evidence_files for all to authenticated using(true) with check(true);
create policy legacy_broad_grants on public.evidence_sharing_grants for all to authenticated using(true) with check(true);
create policy legacy_broad_metadata on public.evidence_metadata for select to authenticated using(true);
create policy legacy_broad_analyses on public.evidence_ai_analyses for select to authenticated using(true);
create policy legacy_hold_access on public.evidence_legal_holds for all to authenticated using(true) with check(true);
create schema storage;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text,metadata jsonb,unique(bucket_id,name));
alter table storage.objects enable row level security;
grant usage on schema storage to authenticated,anon;
grant select,insert,update,delete on storage.objects to authenticated;
grant select on storage.objects to anon;
create policy legacy_broad_storage on storage.objects for all to authenticated using(true) with check(true);
create policy legacy_anon_storage on storage.objects for select to anon using(true);
update public.case_participants set allowed_actions=allowed_actions||array['carer.media.read','carer.media.upload'] where user_id='11111111-1111-4111-8111-111111111111';
update public.case_participants set allowed_actions=allowed_actions||array['parent.media.read'] where user_id='44444444-4444-4444-8444-444444444444';
\ir ../../supabase/migrations/20261013122737_carer_private_media_review.sql
-- A client submission UUID may collide with an existing vault UUID. It must never rebind that record's ACL.
insert into public.evidence_records(id,tenant_id,case_id,evidence_reference,evidence_title,uploader_user_id)
 values('dddddddd-dddd-4ddd-8ddd-dddddddddddd','33333333-3333-4333-8333-333333333333','22222222-2222-4222-8222-222222222222',
 'LEGACY','Existing private record','66666666-6666-4666-8666-666666666666');
set role authenticated;
set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
set test.case_access='false';
select public.reserve_carer_media('22222222-2222-4222-8222-222222222222','dddddddd-dddd-4ddd-8ddd-dddddddddddd',
 'photo.png','Care photo','Factual child observation','image/png',12);
select public.fixture_assert((select count(*) from public.evidence_records where id='dddddddd-dddd-4ddd-8ddd-dddddddddddd')=0,'submission UUID cannot graft legacy vault access');
reset role;
select planned_evidence_id as evidence,file_id as file,storage_path as object_path from public.carer_media_uploads
 where id='dddddddd-dddd-4ddd-8ddd-dddddddddddd' \gset
select public.fixture_assert(:'evidence'<>'dddddddd-dddd-4ddd-8ddd-dddddddddddd','server chooses distinct vault identity');
set role authenticated;
set test.case_access='true';
insert into storage.objects(bucket_id,name,metadata) values('carer-media',:'object_path','{"size":12}');
select public.fixture_expect_error($q$select public.finalize_carer_media('dddddddd-dddd-4ddd-8ddd-dddddddddddd',
 '11111111-1111-4111-8111-111111111111',repeat('a',64),12,'image/png')$q$,'42501');
select public.fixture_expect_error(format('insert into public.evidence_records(id,tenant_id,case_id,evidence_reference,evidence_title,uploader_user_id) values(%L,%L,%L,%L,%L,%L)',
 :'evidence','33333333-3333-4333-8333-333333333333','22222222-2222-4222-8222-222222222222','FORGED','Unverified file','11111111-1111-4111-8111-111111111111'),'42501');
update storage.objects set metadata='{"size":13}' where name=:'object_path';
select public.fixture_assert((select (metadata->>'size')::integer from storage.objects where name=:'object_path')=12,'stored original metadata cannot be replaced');
reset role;
set role service_role;
set request.jwt.claim.role='service_role';
set request.jwt.claim.sub='';
select public.finalize_carer_media('dddddddd-dddd-4ddd-8ddd-dddddddddddd','11111111-1111-4111-8111-111111111111',repeat('a',64),12,'image/png');
select public.finalize_carer_media('dddddddd-dddd-4ddd-8ddd-dddddddddddd','11111111-1111-4111-8111-111111111111',repeat('a',64),12,'image/png');
reset role;
set request.jwt.claim.role='authenticated';
set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
insert into public.evidence_metadata(evidence_file_id,private_detail) values(:'file','Private file-derived detail');
insert into public.evidence_ai_analyses(evidence_record_id,private_detail) values(:'evidence','Private record-derived detail');
set role authenticated;
select public.fixture_assert((select count(*) from public.evidence_records where id=:'evidence')=1,'author can read verified intake');
select public.fixture_expect_error(format('update public.evidence_files set sha256_hash=%L where id=%L',repeat('b',64),:'file'),'42501');
select public.fixture_expect_error(format('update public.evidence_records set privacy_level=%L where id=%L','public',:'evidence'),'42501');
select public.fixture_expect_error(format('delete from public.evidence_records where id=%L',:'evidence'),'42501');
select public.fixture_expect_error(format('insert into public.evidence_sharing_grants(tenant_id,evidence_record_id,share_target_type,grantee_user_id,granted_by_user_id) values(%L,%L,%L,%L,%L)',
 '33333333-3333-4333-8333-333333333333',:'evidence','parent','44444444-4444-4444-8444-444444444444','11111111-1111-4111-8111-111111111111'),'42501');
set request.jwt.claim.sub='44444444-4444-4444-8444-444444444444';
select public.fixture_assert((select count(*) from public.evidence_records where id=:'evidence')=0,'broad case access cannot expose pending media');
select public.fixture_assert((select count(*) from public.evidence_files where id=:'file')=0,'broad file policy cannot expose pending media');
select public.fixture_assert((select count(*) from public.evidence_metadata where evidence_file_id=:'file')=0,'file-derived metadata scope enforced');
select public.fixture_assert((select count(*) from public.evidence_ai_analyses where evidence_record_id=:'evidence')=0,'record-derived metadata scope enforced');
select public.fixture_assert((select count(*) from storage.objects where name=:'object_path')=0,'pending storage object hidden from parent');
select public.fixture_expect_error($q$select public.get_carer_media_location('dddddddd-dddd-4ddd-8ddd-dddddddddddd',false)$q$,'42501');
select public.fixture_expect_error($q$select public.get_carer_media_location('dddddddd-dddd-4ddd-8ddd-dddddddddddd',null)$q$,'42501');
set request.jwt.claim.sub='66666666-6666-4666-8666-666666666666';
select public.fixture_assert(jsonb_array_length(public.list_carer_media_recipients('dddddddd-dddd-4ddd-8ddd-dddddddddddd'))=1,'only assigned parent recipients returned');
select public.fixture_expect_error($q$select public.review_carer_media('dddddddd-dddd-4ddd-8ddd-dddddddddddd','approved',
 '44444444-4444-4444-8444-444444444444',now()+interval '7 day','Missing original-disclosure acknowledgement')$q$,'42501');
select public.review_carer_media('dddddddd-dddd-4ddd-8ddd-dddddddddddd','approved','44444444-4444-4444-8444-444444444444',now()+interval '7 day','Reviewed original for this parent',true);
set request.jwt.claim.sub='44444444-4444-4444-8444-444444444444';
select public.fixture_assert((select count(*) from public.evidence_records where id=:'evidence')=1,'approved parent can read media record');
select public.fixture_assert((select count(*) from storage.objects where name=:'object_path')=1,'approved parent can request file');
select public.fixture_assert((select count(*) from public.evidence_metadata where evidence_file_id=:'file')=1,'approved derived metadata access');
select public.get_carer_media_location('dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set request.jwt.claim.sub='77777777-7777-4777-8777-777777777777';
select public.fixture_assert(jsonb_array_length(public.list_carer_media())=0,'unrelated account cannot enumerate media');
select public.fixture_assert((select count(*) from storage.objects where name=:'object_path')=0,'unrelated file access denied');
set request.jwt.claim.sub='66666666-6666-4666-8666-666666666666';
select public.review_carer_media('dddddddd-dddd-4ddd-8ddd-dddddddddddd','rejected',null,null,'Sharing withdrawn after review');
set request.jwt.claim.sub='44444444-4444-4444-8444-444444444444';
select public.fixture_assert((select count(*) from storage.objects where name=:'object_path')=0,'withdrawal removes new file access');
select public.fixture_assert((select count(*) from public.evidence_files where id=:'file')=0,'withdrawal removes new metadata access');
reset role;
insert into public.evidence_legal_holds(evidence_record_id,hold_status) values(:'evidence','active');
update public.evidence_records set legal_hold=true where id=:'evidence';
set role authenticated;
set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
select public.fixture_expect_error(format('update public.evidence_records set legal_hold=false where id=%L',:'evidence'),'42501');
select public.fixture_assert((select legal_hold from public.evidence_records where id=:'evidence'),'canonical hold state retained');
set role anon;
select public.fixture_assert((select count(*) from storage.objects where name=:'object_path')=0,'anonymous storage policy cannot expose private bucket');
reset role;
select public.fixture_assert((select count(*) from public.evidence_files where id=:'file')=1,'original retained after withdrawal');
select public.fixture_assert((select count(*) from public.carer_media_review_events where upload_id='dddddddd-dddd-4ddd-8ddd-dddddddddddd' and decision='bytes_verified')=1,'byte verification is idempotent');
select public.fixture_assert(not has_function_privilege('authenticated','public.finalize_carer_media(uuid,uuid,text,bigint,text)','EXECUTE'),'clients cannot assert verified hashes');
select 'PASS: scoped upload, distinct upload/vault identity, server-only verified intake, private-by-default storage and derived metadata, independent parent approval, withdrawal, retained originals, legal holds and anonymous denial' as result;
