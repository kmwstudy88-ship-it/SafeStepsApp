// Runs against a disposable in-memory PostgreSQL engine, never the linked project.
// MEDIA_PGLITE_MODULE may point at a pinned local @electric-sql/pglite/dist/index.js.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const { PGlite } = await import(process.env.MEDIA_PGLITE_MODULE ? pathToFileURL(process.env.MEDIA_PGLITE_MODULE).href : '@electric-sql/pglite');
const db = new PGlite();
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
let checks = 0;
const sql = await readFile(new URL('../../supabase/migrations/20260830153711_media_evidence_integrity_foundation.sql', import.meta.url), 'utf8');
const storageSql = await readFile(new URL('../../supabase/migrations/20260830155726_media_evidence_storage_contract.sql', import.meta.url), 'utf8');
const exec = (text) => db.exec(text);
const rpc = async (action, payload = {}, actor = id(1), evidence = id(10), key = id(100 + checks++)) => {
  const rows = await db.query('select public.media_evidence_operation($1,$2,$3,$4,$5,$6) as result', [actor, `session-${actor}`, action, evidence, payload, key]);
  return rows.rows[0].result;
};
const scalar = async (query) => (await db.query(query)).rows[0].value;

try {
  await exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create table public.reunification_cases(id uuid primary key);
    create table public.families(id uuid primary key);
    create table public.child_profiles(id uuid primary key, case_id uuid);
    create table public.case_memberships(case_id uuid, user_id uuid, status text);
    create table public.user_security_sessions(user_id uuid, auth_session_reference text, revoked_at timestamptz);
    grant usage on schema public to service_role,authenticated,anon;
    grant select on public.case_memberships, public.user_security_sessions, public.child_profiles to service_role;
    create schema storage;
    create table storage.buckets(id text primary key, name text not null, public boolean not null);
    create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text not null references storage.buckets(id), name text not null);
    alter table storage.buckets enable row level security;
    alter table storage.objects enable row level security;
    grant usage on schema storage to anon,authenticated,service_role;
    grant select,insert,update,delete on storage.buckets,storage.objects to anon,authenticated,service_role;
    create policy legacy_broad_objects on storage.objects for all to anon,authenticated using(true) with check(true);
    create policy legacy_broad_buckets on storage.buckets for all to anon,authenticated using(true) with check(true);
    insert into storage.buckets values('evidence-originals','evidence-originals',true),('avatars','avatars',true);
  `);
  await exec(sql);
  assert.equal(await scalar(`select count(*)::int as value from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind='r' and c.relrowsecurity`), 17);
  assert.equal(await scalar(`select prosecdef as value from pg_proc where proname='media_evidence_operation'`), false);
  checks++;
  console.log('PASS schema applies to disposable PostgreSQL');
  await exec(`
    insert into auth.users values('${id(1)}'),('${id(2)}'),('${id(3)}');
    insert into public.reunification_cases values('${id(4)}'),('${id(5)}');
    insert into public.families values('${id(6)}');
    insert into public.media_case_scopes(case_id,family_id,approved_by) values('${id(4)}','${id(6)}','${id(1)}');
    insert into public.case_memberships values('${id(4)}','${id(1)}','active'),('${id(4)}','${id(2)}','active');
    insert into public.user_security_sessions values('${id(1)}','session-${id(1)}',null),('${id(2)}','session-${id(2)}',null),('${id(3)}','session-${id(3)}',null);
    insert into public.evidence_consents(id,case_id,subject_id,authority_type,authority_reference,reviewed_by,notice_version,purposes,expires_at)
      values('${id(7)}','${id(4)}','${id(1)}','self','fixture','${id(1)}','v1',array['collect','view','review','export','analyse'],now()+interval '1 day');
    insert into public.media_evidence(id,case_id,family_id,consent_id,media_type,source_type,original_filename,mime_type,byte_size,uploaded_by,retention_class)
      values('${id(10)}','${id(4)}','${id(6)}','${id(7)}','photo','device_upload','fixture.jpg','image/jpeg',3,'${id(1)}','test');
    insert into public.media_evidence_grants(id,evidence_id,case_id,user_id,evidence_role,capabilities,granted_by,authority_reference,expires_at)
      values('${id(11)}','${id(10)}','${id(4)}','${id(1)}','forensic_reviewer',array['view','review','report_restriction','export'],'${id(1)}','fixture',now()+interval '1 day');
    set role service_role;
  `);
  assert.equal((await rpc('summary')).ok, true);
  const originalEnvelope = await scalar('select envelope::text as value from public.evidence_custody_events order by sequence limit 1');
  await exec('reset role');
  await exec(storageSql);
  assert.equal(await scalar(`select count(*)::int as value from storage.buckets where id like 'evidence-%' and not public`), 4);
  assert.equal(await scalar(`select created_at = uploaded_at and updated_at = uploaded_at as value from public.media_evidence where id='${id(10)}'`), true);
  assert.equal(await scalar(`select pg_typeof(media_type)::text as value from public.media_evidence where id='${id(10)}'`), 'media_evidence_type');
  assert.equal(await scalar(`select pg_typeof(safety_status)::text as value from public.media_evidence where id='${id(10)}'`), 'evidence_safety_status');
  assert.equal(await scalar(`select pg_typeof(analysis_status)::text as value from public.media_evidence where id='${id(10)}'`), 'evidence_analysis_status');
  assert.equal(await scalar('select envelope::text as value from public.evidence_custody_events order by sequence limit 1'), originalEnvelope);
  console.log('PASS upgrade preserves existing evidence timestamps and v1 custody while applying enums');
  await exec(`insert into storage.objects(bucket_id,name) select id,'test-object' from storage.buckets`);
  for (const role of ['authenticated','anon']) {
    await exec(`set role ${role}`);
    assert.equal(await scalar('select count(*)::int as value from storage.objects'), 1);
    assert.equal(await scalar('select count(*)::int as value from storage.buckets'), 1);
    for (const bucket of ['evidence-quarantine','evidence-originals','evidence-analysis','evidence-previews']) {
      await assert.rejects(exec(`insert into storage.objects(bucket_id,name) values('${bucket}','unauthorised')`), /row-level security/);
    }
    await assert.rejects(exec(`update storage.objects set bucket_id='evidence-originals' where bucket_id='avatars'`), /row-level security/);
    await exec(`update storage.buckets set public=true where id like 'evidence-%'; delete from storage.objects where bucket_id like 'evidence-%'`);
    await exec('reset role');
    assert.equal(await scalar(`select count(*)::int as value from storage.buckets where id like 'evidence-%' and not public`), 4);
    assert.equal(await scalar(`select count(*)::int as value from storage.objects where bucket_id like 'evidence-%'`), 4);
  }
  console.log('PASS private buckets resist broad legacy policies, direct uploads, path changes and deletion');
  await exec('set role service_role');
  await assert.rejects(exec(`update public.media_evidence set created_at=now()+interval '1 day' where id='${id(10)}'`), /creation time cannot be overwritten/);
  await assert.rejects(exec(`update public.media_evidence set safety_status='invalid' where id='${id(10)}'`), /invalid input value for enum/);
  assert.equal((await rpc('summary')).ok, true);
  assert.equal((await rpc('summary', {}, id(2))).status, 404); // Membership alone is insufficient.
  assert.equal((await rpc('summary', {}, id(3))).status, 404); // Outsider cannot enumerate.
  assert.equal((await rpc('preview')).code, 'MEDIA_NOT_CLEARED');
  console.log('PASS active membership without explicit evidence grant cannot access media');
  await exec('reset role; set role authenticated');
  await assert.rejects(exec('select * from public.media_evidence'), /permission denied/);
  await assert.rejects(rpc('summary'), /permission denied/);
  await exec('reset role; set role service_role');
  console.log('PASS direct authenticated table/RPC access denied');

  await assert.rejects(exec(`update public.media_evidence set integrity_status='verified',upload_status='preserved',sha256=repeat('a',64) where id='${id(10)}'`), /preserved original/);
  await assert.rejects(exec(`update public.media_evidence set original_filename='changed.jpg' where id='${id(10)}'`), /cannot be overwritten/);
  await assert.rejects(exec('update public.evidence_custody_events set action=\'forged\''), /permission denied|append-only/);
  await assert.rejects(exec('truncate public.evidence_custody_events'), /permission denied|append-only/);
  console.log('PASS original identity, verification receipt and append-only guards');

  await exec(`
    insert into public.media_files(id,evidence_id,kind,provider,bucket,object_key,object_version,byte_size,retention_receipt,mime_type)
      values('${id(12)}','${id(10)}','original','test','private','original','v1',3,'{"test":true}','image/jpeg');
    insert into public.media_hashes(evidence_id,file_id,digest,byte_size,object_version,verifier_version,purpose)
      values('${id(10)}','${id(12)}',repeat('a',64),3,'v1','test','preservation');
    update public.media_evidence set sha256=repeat('a',64),upload_status='preserved',integrity_status='verified',safety_status='cleared' where id='${id(10)}';
    insert into public.media_analysis_jobs(id,evidence_id,input_file_id,input_sha256,job_type,provider,model_version,tool_version,config_digest)
      values('${id(13)}','${id(10)}','${id(12)}',repeat('a',64),'metadata','test','test','test',repeat('b',64));
    insert into public.media_findings(id,evidence_id,job_id,source_file_id,finding,confidence_basis,method,model_version,limitations)
      values('${id(14)}','${id(10)}','${id(13)}','${id(12)}','Example indicator','not calibrated','test','test','Not proof of authenticity');
  `);
  const review = { findingId: id(14), decision: 'inconclusive', rationale: 'Insufficient data', qualificationReference: 'test-reviewer' };
  const first = await rpc('review', review, id(1), id(10), id(60));
  assert.equal(first.status, 201);
  assert.deepEqual(await rpc('review', review, id(1), id(10), id(60)), first);
  assert.equal((await rpc('review', { ...review, decision: 'accepted' }, id(1), id(10), id(60))).status, 409);
  assert.equal(await scalar('select count(*)::int as value from public.media_reviews'), 1);
  assert.equal((await rpc('review', { ...review, findingId: id(999) })).status, 400);
  console.log('PASS review retries are idempotent and foreign findings are rejected');

  assert.equal((await rpc('export')).code, 'MEDIA_CAPABILITY_NOT_CONFIGURED');
  const restriction = { category: 'privacy_concern' };
  assert.equal((await rpc('report-restriction', { ...restriction, attachment: 'must not enter custody history' })).status, 400);
  const incident = await rpc('report-restriction', restriction, id(1), id(10), id(61));
  assert.equal(incident.status, 201);
  assert.deepEqual(await rpc('report-restriction', restriction, id(1), id(10), id(61)), incident);
  assert.equal((await rpc('findings')).code, 'MEDIA_NOT_CLEARED');
  assert.equal(await scalar(`select status as value from public.media_analysis_jobs where id='${id(13)}'`), 'cancelled');
  console.log('PASS restriction blocks findings and cancels pending jobs atomically');

  const events = (await db.query('select sequence, previous_hash, event_hash, envelope::text as canonical from public.evidence_custody_events order by sequence')).rows;
  assert.equal(JSON.parse(events[0].canonical).version, 1);
  assert.equal(JSON.parse(events.at(-1).canonical).version, 2);
  let previous = '0'.repeat(64);
  for (const [index, event] of events.entries()) {
    assert.equal(Number(event.sequence), index + 1);
    assert.equal(event.previous_hash, previous);
    assert.equal(event.event_hash, createHash('sha256').update(event.canonical).digest('hex'));
    previous = event.event_hash;
  }
  console.log('PASS independent Node verifier validates custody sequence and digests');
  await exec('reset role');
  await exec(`insert into public.media_authority_revocations(grant_id,actor_id,reason) values('${id(11)}','${id(1)}','test revocation')`);
  await exec('set role service_role');
  assert.equal((await rpc('summary')).status, 404);
  console.log('PASS revoked grant blocks subsequent access');
  console.log(`Database checks passed (${checks} operations). No live database accessed.`);
} catch (error) {
  console.error('FAIL', error.code ?? '', error.message, error.where ?? '');
  process.exitCode = 1;
} finally { await db.close(); }
