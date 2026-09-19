import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const requiredFiles = [
  'backend/server.js',
  'backend/document-intelligence/ai.js',
  'backend/document-intelligence/pipeline.js',
  'backend/document-intelligence/supabase.js',
  'lib/documentIntelligenceApi.ts',
  'lib/fairness/DocumentFairnessViewerScreen.tsx',
  'shared/documentIntelligenceMediaSignals.js',
  'supabase/migrations/20260911173000_document_intelligence_pipeline.sql',
];

let failed = false;

function fail(message) {
  console.error(`FAIL: ${message}`);
  failed = true;
}

function read(rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    fail(`Missing required file: ${rel}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

for (const rel of requiredFiles) read(rel);

for (const rel of [
  'backend/server.js',
  'backend/document-intelligence/ai.js',
  'backend/document-intelligence/pipeline.js',
  'backend/document-intelligence/supabase.js',
]) {
  const result = spawnSync(process.execPath, ['--check', rel], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) fail(`${rel} failed node --check: ${result.stderr || result.stdout}`);
}

const server = read('backend/server.js');
for (const route of [
  '/ready',
  '/documents/text',
  '/documents/upload',
  '/documents/analyze/fairness',
  '/documents/',
  '/documents/compare',
  '/documents/comparisons/',
]) {
  if (!server.includes(route)) fail(`Backend route missing: ${route}`);
}
if (!server.includes("req.method === 'DELETE' && documentId")) fail('Document deletion route is missing.');
if (!server.includes('authenticateBearer')) fail('Backend does not require authenticated bearer identity.');
if (!server.includes('processNextJobs')) fail('Backend worker loop is not wired.');
if (!server.includes('SUPABASE_SERVICE_ROLE_KEY')) fail('Readiness checks do not cover the Supabase service-role credential.');
if (!server.includes('OPENAI_API_KEY') || !server.includes('ANTHROPIC_API_KEY')) fail('Readiness checks do not cover AI provider credentials.');

const ai = read('backend/document-intelligence/ai.js');
for (const skill of ['"evidence"', '"contradictions"', '"timeline"', '"risk"', '"bias"', '"fairness"', '"media_assessment"']) {
  if (!ai.includes(skill)) fail(`AI schema missing analysis skill ${skill}.`);
}
if (!ai.includes('api.openai.com/v1/responses')) fail('OpenAI Responses API integration missing.');
if (!ai.includes('api.anthropic.com/v1/messages')) fail('Anthropic Messages API integration missing.');
if (!ai.includes('Do not make automated child-protection decisions')) fail('Human-decision safety instruction missing.');
const sharedMediaSignals = read('shared/documentIntelligenceMediaSignals.js');
if (!sharedMediaSignals.includes('Environmental Safety') || !sharedMediaSignals.includes('Digital Integrity & Authenticity')) {
  fail('Upgraded media signal domains are missing from shared schema definitions.');
}

const pipeline = read('backend/document-intelligence/pipeline.js');
for (const table of ['documents', 'document_analyses', 'document_comparisons', 'document_analysis_jobs']) {
  if (!pipeline.includes(`'${table}'`)) fail(`Pipeline is not persisting to ${table}.`);
}
if (!pipeline.includes("rpc('claim_document_analysis_jobs'")) fail('Atomic queue claim RPC is not used by the worker.');
if (!pipeline.includes('2 to 10 unique document IDs')) fail('Multi-document comparison bounds are missing.');
if (!pipeline.includes("createHash('sha256')")) fail('Document integrity SHA-256 fingerprinting is missing.');
if (!pipeline.includes('Unsupported file type. Provide extractedText or upload a supported document format.')) fail('Unsupported file-type validation is missing.');
if (!pipeline.includes('retention_expires_at')) fail('Retention metadata wiring is missing for uploaded documents.');
if (!pipeline.includes('human_review_status')) fail('Human review status metadata is missing in document workflow responses.');

const migration = read('supabase/migrations/20260911173000_document_intelligence_pipeline.sql');
for (const token of [
  'create table if not exists public.document_analyses',
  'create table if not exists public.document_comparisons',
  'create table if not exists public.document_analysis_jobs',
  'for update skip locked',
  "grant execute on function public.claim_document_analysis_jobs(text, integer) to service_role",
  "values ('document-intelligence', 'document-intelligence', false, 26214400)",
]) {
  if (!migration.toLowerCase().includes(token.toLowerCase())) fail(`Migration invariant missing: ${token}`);
}

const client = read('lib/documentIntelligenceApi.ts');
if (!client.includes('Authorization: `Bearer ${token}`')) fail('Client does not send Supabase access token to backend.');
if (!client.includes('/documents/analyze/fairness')) fail('Fairness client route missing.');
if (!client.includes('/documents/compare')) fail('Comparison client route missing.');

const screen = read('lib/fairness/DocumentFairnessViewerScreen.tsx');
if (!screen.includes('queueFairnessAnalysis')) fail('Fairness screen is not wired to backend analysis queue.');
if (!screen.includes('waitForDocumentAnalysis')) fail('Fairness screen does not poll durable analysis results.');

if (failed) {
  console.error('Document Intelligence structural verification failed.');
  process.exit(1);
}

console.log('Document Intelligence structural verification passed.');
