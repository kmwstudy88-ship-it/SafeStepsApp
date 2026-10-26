import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationPath = resolve(__dirname, '../../supabase/migrations/20260911200000_document_intelligence_storage_unification.sql');
const migrationSql = readFileSync(migrationPath, 'utf8');

test('document entities canonical storage is protected by RLS and ownership-aware access paths', () => {
  assert.match(migrationSql, /create table if not exists public\.document_entities/i);
  assert.match(migrationSql, /create index if not exists idx_document_entities_case_document/i);
  assert.match(migrationSql, /create index if not exists idx_document_entities_case/i);
  assert.match(migrationSql, /alter table public\.document_entities enable row level security;/i);
  assert.match(migrationSql, /create policy document_entities_select on public\.document_entities\s+for select to authenticated/i);
  assert.match(migrationSql, /where document\.id = document_entities\.case_document_id[\s\S]*document\.parent_user_id = \(select auth\.uid\(\)\)[\s\S]*document\.worker_user_id = \(select auth\.uid\(\)\)[\s\S]*document\.created_by = \(select auth\.uid\(\)\)[\s\S]*public\.can_manage_assessments\(\)/i);
  assert.match(migrationSql, /where version\.id = document_entities\.document_version_id[\s\S]*join public\.case_documents as document[\s\S]*document\.id = version\.document_id/i);
  assert.match(migrationSql, /where document_entities\.case_document_id is null[\s\S]*document_entities\.document_version_id is null[\s\S]*document\.case_id = document_entities\.case_id/i);
});

test('document text canonical view prefers same-case SHA matches before file-path fallback', () => {
  assert.match(migrationSql, /create or replace view public\.document_text/i);
  assert.match(migrationSql, /coalesce\(parsed_by_sha\.extracted_text, parsed_by_path\.extracted_text\) as text_content/i);
  assert.match(migrationSql, /where version\.file_sha256 is not null[\s\S]*d\.sha256 = version\.file_sha256[\s\S]*\(d\.case_id is null or d\.case_id = document\.case_id\)[\s\S]*order by d\.created_at desc[\s\S]*limit 1/i);
  assert.match(migrationSql, /where parsed_by_sha\.created_at is null[\s\S]*d\.storage_path = version\.file_path[\s\S]*\(d\.case_id is null or d\.case_id = document\.case_id\)/i);
  assert.match(migrationSql, /coalesce\(parsed_by_sha\.created_at, parsed_by_path\.created_at, version\.uploaded_at\) as source_created_at/i);
});

test('retrieval contradiction views derive case linkage from either referenced document side', () => {
  assert.match(migrationSql, /create or replace view public\.document_contradictions/i);
  assert.match(migrationSql, /when contradiction\.source_a_type ilike '%version%' then \([\s\S]*where version\.id = contradiction\.source_a_id/i);
  assert.match(migrationSql, /when contradiction\.source_a_type ilike '%document%' then \([\s\S]*where document\.id = contradiction\.source_a_id/i);
  assert.match(migrationSql, /when contradiction\.source_b_type ilike '%version%' then \([\s\S]*where version\.id = contradiction\.source_b_id/i);
  assert.match(migrationSql, /when contradiction\.source_b_type ilike '%document%' then \([\s\S]*where document\.id = contradiction\.source_b_id/i);
  assert.match(migrationSql, /coalesce\(contradiction\.source_a_reference, contradiction\.source_a_type\) as source_a/i);
  assert.match(migrationSql, /coalesce\(contradiction\.source_b_reference, contradiction\.source_b_type\) as source_b/i);
});

test('document concerns preserve fail-closed review status and service-role-only canonical access', () => {
  assert.match(migrationSql, /create or replace view public\.document_concerns/i);
  assert.match(migrationSql, /case when contradiction\.resolved_at is null then 'open' else 'resolved' end as concern_status/i);
  assert.match(migrationSql, /case when contradiction\.requires_resolution then 'open' else 'closed' end as concern_status/i);
  assert.match(migrationSql, /case when contradiction\.requires_resolution then null::timestamptz else contradiction\.reviewed_at end as resolved_at/i);
  assert.match(migrationSql, /revoke all on public\.document_entities from public, anon, authenticated;/i);
  assert.match(migrationSql, /grant insert, update on public\.document_entities to service_role;/i);
  assert.match(migrationSql, /revoke all on[\s\S]*public\.document_text,[\s\S]*public\.document_contradictions,[\s\S]*public\.document_fairness,[\s\S]*public\.document_risks,[\s\S]*public\.document_timeline,[\s\S]*public\.document_concerns[\s\S]*from public, anon, authenticated;/i);
  assert.match(migrationSql, /grant select on[\s\S]*public\.document_text,[\s\S]*public\.document_contradictions,[\s\S]*public\.document_fairness,[\s\S]*public\.document_risks,[\s\S]*public\.document_timeline,[\s\S]*public\.document_concerns[\s\S]*to service_role;/i);
});
