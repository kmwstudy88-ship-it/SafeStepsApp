'use strict';

const crypto = require('node:crypto');
const { admin } = require('./supabase');
const {
  ANALYSIS_SCHEMA_VERSION,
  COMPARISON_SCHEMA_VERSION,
  providerName,
  analyzeDocument,
  compareDocuments,
  createEmptyMediaAssessment,
} = require('./ai');

const WORKER_ID = process.env.DOCUMENT_AI_WORKER_ID || `node-${process.pid}-${crypto.randomUUID().slice(0, 8)}`;
const DEFAULT_MODEL = () => providerName() === 'anthropic'
  ? (process.env.ANTHROPIC_DOCUMENT_MODEL || 'claude-sonnet-4-5')
  : (process.env.OPENAI_DOCUMENT_MODEL || 'gpt-5.6-terra');

function textFromBuffer(buffer, mimeType) {
  const type = String(mimeType || '').toLowerCase();
  return type.startsWith('text/') || type.includes('json') || type.includes('xml') || type.includes('csv')
    ? buffer.toString('utf8') : null;
}

async function createTextDocument({ userId, caseId = null, text, fileName = 'pasted-text.txt' }) {
  if (!text || !String(text).trim()) throw new Error('Document text is required');
  const buffer = Buffer.from(String(text), 'utf8');
  return createDocumentRecord({ userId, caseId, fileName, mimeType: 'text/plain', buffer, extractedText: String(text), sourceType: 'text' });
}

async function createUploadDocument({ userId, caseId = null, fileName, mimeType, contentBase64, extractedText = null }) {
  if (!fileName || !contentBase64) throw new Error('fileName and contentBase64 are required');
  const buffer = Buffer.from(contentBase64, 'base64');
  if (!buffer.length) throw new Error('Uploaded document is empty');
  if (buffer.length > 25 * 1024 * 1024) throw new Error('Document exceeds the 25 MB upload limit');
  const text = extractedText || textFromBuffer(buffer, mimeType);
  return createDocumentRecord({ userId, caseId, fileName, mimeType: mimeType || 'application/octet-stream', buffer, extractedText: text, sourceType: 'upload' });
}

async function createDocumentRecord({ userId, caseId, fileName, mimeType, buffer, extractedText, sourceType }) {
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  const documentId = crypto.randomUUID();
  const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]+/g, '_').slice(-180) || 'document';
  const storagePath = `${userId}/${documentId}/${safeName}`;
  const { error: storageError } = await admin.storage.from('document-intelligence').upload(storagePath, buffer, { contentType: mimeType, upsert: false });
  if (storageError) throw storageError;

  const { data: document, error } = await admin.from('documents').insert({
    id: documentId, user_id: userId, case_id: caseId, file_name: fileName, mime_type: mimeType,
    storage_path: storagePath, byte_size: buffer.length, sha256, source_type: sourceType,
    processing_status: 'queued', extracted_text: extractedText,
    metadata: { extraction: extractedText ? 'inline' : 'provider_file_input' },
  }).select('*').single();
  if (error) {
    await admin.storage.from('document-intelligence').remove([storagePath]);
    throw error;
  }

  const { data: analysis, error: analysisError } = await admin.from('document_analyses').insert({
    document_id: document.id, user_id: userId, provider: providerName(), model: DEFAULT_MODEL(),
    schema_version: ANALYSIS_SCHEMA_VERSION, status: 'queued',
  }).select('*').single();
  if (analysisError) throw analysisError;

  const { data: job, error: jobError } = await admin.from('document_analysis_jobs').insert({
    job_type: 'document_analysis', document_id: document.id, user_id: userId, payload: { analysis_id: analysis.id },
  }).select('*').single();
  if (jobError) throw jobError;
  return { document, analysis, job };
}

async function createComparison({ userId, caseId = null, documentIds }) {
  const ids = [...new Set(Array.isArray(documentIds) ? documentIds : [])];
  if (ids.length < 2 || ids.length > 10) throw new Error('Comparison requires 2 to 10 unique document IDs');
  const { data: owned, error: ownedError } = await admin.from('documents').select('id').eq('user_id', userId).in('id', ids);
  if (ownedError) throw ownedError;
  if ((owned || []).length !== ids.length) throw new Error('One or more documents are unavailable');

  const { data: comparison, error } = await admin.from('document_comparisons').insert({
    user_id: userId, case_id: caseId, document_ids: ids, provider: providerName(), model: DEFAULT_MODEL(),
    schema_version: COMPARISON_SCHEMA_VERSION, status: 'queued',
  }).select('*').single();
  if (error) throw error;
  const { data: job, error: jobError } = await admin.from('document_analysis_jobs').insert({
    job_type: 'document_comparison', comparison_id: comparison.id, user_id: userId, payload: {},
  }).select('*').single();
  if (jobError) throw jobError;
  return { comparison, job };
}

async function loadBinary(document) {
  if (!document.storage_path) return null;
  const { data, error } = await admin.storage.from('document-intelligence').download(document.storage_path);
  if (error) throw error;
  return Buffer.from(await data.arrayBuffer());
}

async function processAnalysisJob(job) {
  const analysisId = job.payload?.analysis_id;
  if (!analysisId) throw new Error('Analysis job has no analysis_id');
  const { data: document, error: documentError } = await admin.from('documents').select('*').eq('id', job.document_id).single();
  if (documentError) throw documentError;

  const now = new Date().toISOString();
  await Promise.all([
    admin.from('documents').update({ processing_status: 'processing', updated_at: now }).eq('id', document.id),
    admin.from('document_analyses').update({ status: 'processing', started_at: now }).eq('id', analysisId),
  ]);

  const fileBuffer = document.extracted_text ? null : await loadBinary(document);
  const ai = await analyzeDocument(document, fileBuffer);
  const result = ai.result || {};
  const mediaAssessment = result.media_assessment || result.risk?.media_assessment || createEmptyMediaAssessment();
  const risk = result.risk && typeof result.risk === 'object' ? result.risk : {};
  const completedAt = new Date().toISOString();
  const { error } = await admin.from('document_analyses').update({
    provider: ai.provider, model: ai.model, status: 'completed', summary: result.summary || {}, evidence: result.evidence || [],
    contradictions: result.contradictions || [], timeline: result.timeline || [], risk: { ...risk, media_assessment: mediaAssessment }, bias: result.bias || {},
    fairness: result.fairness || {}, limitations: result.limitations || [], raw_output: result, usage: ai.usage || {}, completed_at: completedAt,
  }).eq('id', analysisId);
  if (error) throw error;
  await admin.from('documents').update({ processing_status: 'completed', updated_at: completedAt }).eq('id', document.id);
}

function normalizeAnalysisRecord(analysis) {
  if (!analysis) return null;
  const requirements =
    analysis.raw_output?.requirements
    || analysis.summary?.requirements
    || [];
  const concernClassification =
    analysis.raw_output?.concern_classification
    || analysis.risk?.concern_classification
    || { concerns: [] };
  return {
    ...analysis,
    requirements,
    concern_classification: concernClassification,
    media_assessment:
      analysis.risk?.media_assessment
      || analysis.raw_output?.media_assessment
      || analysis.raw_output?.risk?.media_assessment
      || createEmptyMediaAssessment(),
  };
}

async function processComparisonJob(job) {
  const { data: comparison, error } = await admin.from('document_comparisons').select('*').eq('id', job.comparison_id).single();
  if (error) throw error;
  await admin.from('document_comparisons').update({ status: 'processing', started_at: new Date().toISOString() }).eq('id', comparison.id);
  const { data: documents, error: docError } = await admin.from('documents').select('*').eq('user_id', comparison.user_id).in('id', comparison.document_ids);
  if (docError) throw docError;

  const items = [];
  for (const document of documents || []) {
    const { data: analysis } = await admin.from('document_analyses').select('*').eq('document_id', document.id).eq('status', 'completed').order('created_at', { ascending: false }).limit(1).maybeSingle();
    items.push({ document, analysis });
  }
  if (items.length !== comparison.document_ids.length) throw new Error('Not all comparison documents are available');
  const ai = await compareDocuments(items);
  const { error: updateError } = await admin.from('document_comparisons').update({
    provider: ai.provider, model: ai.model, status: 'completed', result: ai.result, usage: ai.usage || {}, completed_at: new Date().toISOString(),
  }).eq('id', comparison.id);
  if (updateError) throw updateError;
}

async function failJob(job, error) {
  const message = String(error?.message || error).slice(0, 4000);
  const retry = job.attempts < job.max_attempts;
  await admin.from('document_analysis_jobs').update({
    status: retry ? 'queued' : 'failed',
    available_at: retry ? new Date(Date.now() + Math.min(60000, 2000 * (2 ** job.attempts))).toISOString() : job.available_at,
    completed_at: retry ? null : new Date().toISOString(), last_error: message,
  }).eq('id', job.id);
  if (!retry && job.job_type === 'document_analysis') {
    await admin.from('documents').update({ processing_status: 'failed', updated_at: new Date().toISOString() }).eq('id', job.document_id);
    if (job.payload?.analysis_id) await admin.from('document_analyses').update({ status: 'failed', error_code: 'ANALYSIS_FAILED', error_message: message, completed_at: new Date().toISOString() }).eq('id', job.payload.analysis_id);
  }
  if (!retry && job.job_type === 'document_comparison') {
    await admin.from('document_comparisons').update({ status: 'failed', error_code: 'COMPARISON_FAILED', error_message: message, completed_at: new Date().toISOString() }).eq('id', job.comparison_id);
  }
}

async function processNextJobs(limit = 2) {
  const { data: jobs, error } = await admin.rpc('claim_document_analysis_jobs', { p_worker_id: WORKER_ID, p_limit: limit });
  if (error) throw error;
  for (const job of jobs || []) {
    try {
      if (job.job_type === 'document_analysis') await processAnalysisJob(job); else await processComparisonJob(job);
      await admin.from('document_analysis_jobs').update({ status: 'completed', completed_at: new Date().toISOString(), last_error: null }).eq('id', job.id);
    } catch (err) {
      console.error('[document-intelligence] job failed', job.id, err);
      await failJob(job, err);
    }
  }
  return (jobs || []).length;
}

async function getDocumentForUser(id, userId) {
  const { data: document, error } = await admin.from('documents').select('*').eq('id', id).eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!document) return null;
  const { data: analysis } = await admin.from('document_analyses').select('*').eq('document_id', id).eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  return { document, analysis: normalizeAnalysisRecord(analysis) };
}

async function getComparisonForUser(id, userId) {
  const { data, error } = await admin.from('document_comparisons').select('*').eq('id', id).eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

module.exports = { createTextDocument, createUploadDocument, createComparison, processNextJobs, getDocumentForUser, getComparisonForUser };
