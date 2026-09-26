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
  normalizeAnalysisSkills,
} = require('./ai');

const WORKER_ID = process.env.DOCUMENT_AI_WORKER_ID || `node-${process.pid}-${crypto.randomUUID().slice(0, 8)}`;
const DEFAULT_MODEL = () => providerName() === 'anthropic'
  ? (process.env.ANTHROPIC_DOCUMENT_MODEL || 'claude-sonnet-4-5')
  : (process.env.OPENAI_DOCUMENT_MODEL || 'gpt-5.6-terra');

const DEFAULT_LIMITATION = 'AI output is unverified decision-support material and requires documented human review before case action.';
const DOCUMENT_RETENTION_DAYS = Math.max(1, Number(process.env.DOCUMENT_RETENTION_DAYS || 90));

const SUPPORTED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'application/json',
  'application/xml',
  'text/xml',
  'text/csv',
  'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

async function expectNoError(request) {
  const result = await request;
  if (result?.error) throw result.error;
  return result?.data ?? null;
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function retentionExpiresAt(createdAt = Date.now()) {
  return new Date(createdAt + (DOCUMENT_RETENTION_DAYS * 24 * 60 * 60 * 1000)).toISOString();
}

function isSupportedMimeType(mimeType) {
  const type = String(mimeType || '').toLowerCase();
  return SUPPORTED_MIME_TYPES.has(type) || type.startsWith('text/');
}

async function cleanupCreatedDocument(document) {
  const storagePath = document?.storage_path;
  const documentId = document?.id;

  if (documentId) {
    try {
      await expectNoError(admin.from('documents').delete().eq('id', documentId));
    } catch (error) {
      console.error('[document-intelligence] failed to roll back document row', documentId, error);
    }
  }

  if (storagePath) {
    try {
      const { error } = await admin.storage.from('document-intelligence').remove([storagePath]);
      if (error) throw error;
    } catch (storageError) {
      console.error('[document-intelligence] failed to remove rolled-back storage object', storagePath, storageError);
    }
  }
}

async function cleanupCreatedAnalysis(analysisId) {
  if (!analysisId) return;
  try {
    await expectNoError(admin.from('document_analyses').delete().eq('id', analysisId));
  } catch (error) {
    console.error('[document-intelligence] failed to roll back analysis row', analysisId, error);
  }
}

function textFromBuffer(buffer, mimeType) {
  const type = String(mimeType || '').toLowerCase();
  return type.startsWith('text/') || type.includes('json') || type.includes('xml') || type.includes('csv')
    ? buffer.toString('utf8') : null;
}

function normalizeInputMetadata(metadata, extractedText) {
  const input = metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? metadata : {};
  const output = { extraction: extractedText ? 'inline' : 'provider_file_input' };
  for (const key of ['document_type', 'author_role', 'creation_date', 'source_system', 'version_number']) {
    if (typeof input[key] === 'string' && input[key].trim()) output[key] = input[key].trim();
  }
  return output;
}

function normalizeUserId(userId, authUserId) {
  return userId || authUserId || null;
}

function caseIdsMatch(left, right) {
  return (left || null) === (right || null);
}

function normalizeLimitations(limitations) {
  const values = (Array.isArray(limitations) ? limitations : [])
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  return values.length ? [...new Set(values)] : [DEFAULT_LIMITATION];
}

function humanReviewStatus(status) {
  if (status === 'completed') return 'pending_human_review';
  if (status === 'failed') return 'analysis_failed';
  return 'pending_analysis';
}

function annotateWorkflow(record) {
  if (!record || typeof record !== 'object') return record;
  return {
    ...record,
    human_review_required: true,
    decision_support_only: true,
    human_review_status: humanReviewStatus(record.status),
  };
}

function confidenceOverview(analysis) {
  const candidates = [];
  for (const value of [
    analysis?.risk?.confidence,
    ...(Array.isArray(analysis?.evidence) ? analysis.evidence.map((item) => item?.confidence) : []),
    ...(Array.isArray(analysis?.timeline) ? analysis.timeline.map((item) => item?.confidence) : []),
    ...(Array.isArray(analysis?.contradictions) ? analysis.contradictions.map((item) => item?.confidence) : []),
    ...(Array.isArray(analysis?.analysis_skills) ? analysis.analysis_skills.map((item) => item?.confidence) : []),
  ]) {
    if (Number.isFinite(value)) candidates.push(Number(value));
  }
  if (!candidates.length) return { overall_confidence: 0, inputs_considered: 0 };
  const average = candidates.reduce((sum, value) => sum + value, 0) / candidates.length;
  return {
    overall_confidence: Number(average.toFixed(3)),
    inputs_considered: candidates.length,
  };
}

async function loadActorContext(authUserId) {
  if (!authUserId) throw createHttpError(401, 'authUserId is required');
  const { data, error } = await admin
    .from('users')
    .select('id,auth_user_id')
    .eq('auth_user_id', authUserId)
    .maybeSingle();
  if (error) throw error;

  const appUserId = data?.id || null;
  const ownerUserIds = [...new Set([authUserId, appUserId].filter(Boolean))];
  return { authUserId, appUserId, ownerUserIds };
}

async function assertCaseAccess(actor, caseId) {
  if (!caseId) return;
  const { data: caseRecord, error } = await admin
    .from('cases')
    .select('id,parent_user_id')
    .eq('id', caseId)
    .maybeSingle();
  if (error) throw error;
  if (!caseRecord) throw createHttpError(404, 'Case not found.');
  if (actor.ownerUserIds.includes(caseRecord.parent_user_id)) return;

  const { data: assignment, error: assignmentError } = await admin
    .from('case_assignments')
    .select('id,user_id')
    .eq('case_id', caseId)
    .in('user_id', actor.ownerUserIds)
    .maybeSingle();
  if (assignmentError) throw assignmentError;
  if (!assignment) throw createHttpError(403, 'Case access denied.');
}

async function createAnalysisAndJob({ documentId, ownerUserId }) {
  const { data: analysis, error: analysisError } = await admin.from('document_analyses').insert({
    document_id: documentId,
    user_id: ownerUserId,
    provider: providerName(),
    model: DEFAULT_MODEL(),
    schema_version: ANALYSIS_SCHEMA_VERSION,
    status: 'queued',
  }).select('*').single();
  if (analysisError) throw analysisError;

  const { data: job, error: jobError } = await admin.from('document_analysis_jobs').insert({
    job_type: 'document_analysis',
    document_id: documentId,
    user_id: ownerUserId,
    payload: { analysis_id: analysis.id },
  }).select('*').single();
  if (jobError) {
    await cleanupCreatedAnalysis(analysis.id);
    throw jobError;
  }

  return { analysis, job };
}

async function createTextDocument({ userId, authUserId, caseId = null, text, fileName = 'pasted-text.txt', metadata = {} }) {
  const normalizedUserId = normalizeUserId(userId, authUserId);
  if (!normalizedUserId) throw new Error('userId is required');
  if (!text || !String(text).trim()) throw new Error('Document text is required');
  const buffer = Buffer.from(String(text), 'utf8');
  return createDocumentRecord({
    userId: normalizedUserId,
    caseId,
    fileName,
    mimeType: 'text/plain',
    buffer,
    extractedText: String(text),
    sourceType: 'text',
    metadata,
  });
}

async function createUploadDocument({ userId, authUserId, caseId = null, fileName, mimeType, contentBase64, extractedText = null, metadata = {} }) {
  const normalizedUserId = normalizeUserId(userId, authUserId);
  if (!normalizedUserId) throw new Error('userId is required');
  if (!fileName || !contentBase64) throw new Error('fileName and contentBase64 are required');
  if (!isSupportedMimeType(mimeType) && !String(extractedText || '').trim()) {
    throw new Error('Unsupported file type. Provide extractedText or upload a supported document format.');
  }
  const buffer = Buffer.from(contentBase64, 'base64');
  if (!buffer.length) throw new Error('Uploaded document is empty');
  if (buffer.length > 25 * 1024 * 1024) throw new Error('Document exceeds the 25 MB upload limit');
  const text = extractedText || textFromBuffer(buffer, mimeType);
  return createDocumentRecord({
    userId: normalizedUserId,
    caseId,
    fileName,
    mimeType: mimeType || 'application/octet-stream',
    buffer,
    extractedText: text,
    sourceType: 'upload',
    metadata,
  });
}

async function createDocumentRecord({ userId, caseId, fileName, mimeType, buffer, extractedText, sourceType, metadata = {} }) {
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  let duplicateQuery = admin
    .from('documents')
    .select('*')
    .eq('sha256', sha256)
    .in('user_id', [userId])
    .limit(1);
  duplicateQuery = caseId == null ? duplicateQuery.is('case_id', null) : duplicateQuery.eq('case_id', caseId);
  const duplicateResult = await expectNoError(duplicateQuery.maybeSingle());
  const duplicate = Array.isArray(duplicateResult) ? duplicateResult[0] || null : duplicateResult;
  if (duplicate) {
    const ownerUserId = duplicate.user_id || userId;
    const { analysis, job } = await createAnalysisAndJob({ documentId: duplicate.id, ownerUserId });
    return { document: duplicate, analysis, job, duplicate: true };
  }

  const ownerUserId = userId;
  const documentId = crypto.randomUUID();
  const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]+/g, '_').slice(-180) || 'document';
  const storagePath = `${ownerUserId}/${documentId}/${safeName}`;
  const { error: storageError } = await admin.storage.from('document-intelligence').upload(storagePath, buffer, { contentType: mimeType, upsert: false });
  if (storageError) throw storageError;

  const { data: document, error } = await admin.from('documents').insert({
    id: documentId, user_id: userId, case_id: caseId, file_name: fileName, mime_type: mimeType,
    storage_path: storagePath, byte_size: buffer.length, sha256, source_type: sourceType,
    processing_status: 'queued', extracted_text: extractedText,
    retention_expires_at: retentionExpiresAt(),
    metadata: normalizeInputMetadata(metadata, extractedText),
  }).select('*').single();
  if (error) {
    await admin.storage.from('document-intelligence').remove([storagePath]);
    throw error;
  }

  try {
    const { analysis, job } = await createAnalysisAndJob({ documentId: document.id, ownerUserId });
    return { document, analysis, job };
  } catch (error) {
    await cleanupCreatedDocument(document);
    throw error;
  }
}

async function createComparison({ authUserId, caseId = null, documentIds }) {
  const actor = await loadActorContext(authUserId);
  await assertCaseAccess(actor, caseId);

  const ids = [...new Set(Array.isArray(documentIds) ? documentIds : [])];
  if (ids.length < 2 || ids.length > 10) throw createHttpError(400, 'Comparison requires 2 to 10 unique document IDs');

  const { data: owned, error: ownedError } = await admin
    .from('documents')
    .select('id,case_id,user_id')
    .in('user_id', actor.ownerUserIds)
    .in('id', ids);
  if (ownedError) throw ownedError;

  if ((owned || []).length !== ids.length) throw createHttpError(404, 'One or more documents are unavailable');
  const caseMismatch = (owned || []).find((document) => !caseIdsMatch(document.case_id, caseId));
  if (caseMismatch) throw createHttpError(400, 'All comparison documents must belong to the same requested case scope');

  const ownerUserId = actor.appUserId || actor.authUserId;
  const { data: comparison, error } = await admin.from('document_comparisons').insert({
    user_id: ownerUserId,
    case_id: caseId,
    document_ids: ids,
    provider: providerName(),
    model: DEFAULT_MODEL(),
    schema_version: COMPARISON_SCHEMA_VERSION,
    status: 'queued',
  }).select('*').single();
  if (error) throw error;

  const { data: job, error: jobError } = await admin.from('document_analysis_jobs').insert({
    job_type: 'document_comparison',
    comparison_id: comparison.id,
    user_id: ownerUserId,
    payload: {},
  }).select('*').single();
  if (jobError) throw jobError;

  return { comparison, job };
}

async function queueDocumentAnalysis({ authUserId, actorUserId = null, documentId }) {
  if (!documentId) throw createHttpError(400, 'documentId is required');
  const actor = await loadActorContext(authUserId);
  const { data: document, error: documentError } = await admin
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .in('user_id', actor.ownerUserIds)
    .maybeSingle();
  if (documentError) throw documentError;
  if (!document) {
    throw createHttpError(404, 'Document not found.');
  }
  await assertCaseAccess(actor, document.case_id);

  const now = new Date().toISOString();
  const previousStatus = document.processing_status || null;
  const previousUpdatedAt = document.updated_at || null;
  const ownerUserId = document.user_id || actor.appUserId || actor.authUserId;
  const { data: analysis, error: analysisError } = await admin.from('document_analyses').insert({
    document_id: document.id,
    user_id: ownerUserId,
    provider: providerName(),
    model: DEFAULT_MODEL(),
    schema_version: ANALYSIS_SCHEMA_VERSION,
    status: 'queued',
  }).select('*').single();
  if (analysisError) throw analysisError;

  const { data: job, error: jobError } = await admin.from('document_analysis_jobs').insert({
    job_type: 'document_analysis',
    document_id: document.id,
    user_id: ownerUserId,
    payload: { analysis_id: analysis.id },
  }).select('*').single();
  if (jobError) {
    await cleanupCreatedAnalysis(analysis.id);
    throw jobError;
  }

  const { error: updateError } = await admin.from('documents').update({ processing_status: 'queued', updated_at: now }).eq('id', document.id);
  if (updateError) throw updateError;

  const auditActorUserId = actorUserId || actor.appUserId || null;
  if (auditActorUserId) {
    const { error: auditError } = await admin.from('audit_logs').insert({
      case_id: document.case_id || null,
      actor_user_id: auditActorUserId,
      action: 'document_processing_requested',
      resource_type: 'document',
      resource_id: document.id,
      details: {
        analysis_id: analysis.id,
        job_id: job.id,
        human_review_required: true,
        human_review_status: 'pending_analysis',
      },
    });
    if (auditError) {
      await Promise.all([
        expectNoError(admin.from('document_analysis_jobs').delete().eq('id', job.id)).catch((error) => {
          console.error('[document-intelligence] failed to roll back queued job', job.id, error);
        }),
        cleanupCreatedAnalysis(analysis.id),
        expectNoError(admin.from('documents').update({
          processing_status: previousStatus || 'completed',
          updated_at: previousUpdatedAt || document.updated_at || now,
        }).eq('id', document.id)).catch((error) => {
          console.error('[document-intelligence] failed to restore document status after audit failure', document.id, error);
        }),
      ]);
      throw auditError;
    }
  }
  return { document, analysis, job };
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
  const document = await expectNoError(admin.from('documents').select('*').eq('id', job.document_id).single());

  const now = new Date().toISOString();
  await Promise.all([
    admin.from('documents').update({ processing_status: 'processing', updated_at: now }).eq('id', document.id),
    admin.from('document_analyses').update({ status: 'processing', started_at: now }).eq('id', analysisId),
  ].map(expectNoError));

  const fileBuffer = document.extracted_text ? null : await loadBinary(document);
  const ai = await analyzeDocument(document, fileBuffer);
  const result = ai.result || {};
  const mediaAssessment = result.media_assessment || result.risk?.media_assessment || createEmptyMediaAssessment();
  const analysisSkills = normalizeAnalysisSkills(result.analysis_skills || result.analysisSkills);
  const risk = result.risk && typeof result.risk === 'object' ? result.risk : {};
  const limitations = normalizeLimitations(result.limitations || []);
  const completedAt = new Date().toISOString();
  await expectNoError(admin.from('document_analyses').update({
    provider: ai.provider,
    model: ai.model,
    status: 'completed',
    summary: result.summary || {},
    evidence: result.evidence || [],
    contradictions: result.contradictions || [],
    timeline: result.timeline || [],
    risk: { ...risk, media_assessment: mediaAssessment },
    bias: result.bias || {},
    fairness: result.fairness || {},
    limitations,
    raw_output: { ...result, analysis_skills: analysisSkills, limitations },
    usage: ai.usage || {},
    completed_at: completedAt,
  }).eq('id', analysisId));
  await expectNoError(admin.from('documents').update({ processing_status: 'completed', updated_at: completedAt }).eq('id', document.id));
}

function normalizeAnalysisRecord(analysis) {
  if (!analysis) return null;
  const requirements =
    analysis.requirements
    || analysis.raw_output?.requirements
    || [];
  const concernClassification =
    analysis.concern_classification
    || analysis.raw_output?.concern_classification
    || { concerns: [] };
  return {
  const normalized = {
    ...analysis,
    requirements,
    concern_classification: concernClassification,
    media_assessment:
      analysis.risk?.media_assessment
      || analysis.raw_output?.media_assessment
      || analysis.raw_output?.risk?.media_assessment
      || createEmptyMediaAssessment(),
    analysis_skills: normalizeAnalysisSkills(
      analysis.raw_output?.analysis_skills
      || analysis.raw_output?.analysisSkills
      || analysis.analysis_skills
      || analysis.analysisSkills,
    ),
    limitations: normalizeLimitations(analysis.limitations || []),
  };
  normalized.confidence_overview = confidenceOverview(normalized);
  return annotateWorkflow(normalized);
}

function normalizeComparisonResult(comparison) {
  if (!comparison) return null;
  const result = comparison.result && typeof comparison.result === 'object' ? comparison.result : {};
  const limitations = normalizeLimitations(result.limitations || []);
  return annotateWorkflow({
    ...comparison,
    result: {
      ...result,
      limitations,
    },
  });
}

async function processComparisonJob(job) {
  const comparison = await expectNoError(admin.from('document_comparisons').select('*').eq('id', job.comparison_id).single());
  await expectNoError(admin.from('document_comparisons').update({ status: 'processing', started_at: new Date().toISOString() }).eq('id', comparison.id));

  const documents = await expectNoError(
    admin
      .from('documents')
      .select('*')
      .eq('user_id', comparison.user_id)
      .in('id', comparison.document_ids),
  );

  const documentsById = new Map((documents || []).map((document) => [document.id, document]));
  const items = [];
  for (const documentId of comparison.document_ids || []) {
    const document = documentsById.get(documentId);
    if (!document) continue;
    const analysis = await expectNoError(
      admin.from('document_analyses').select('*').eq('document_id', document.id).eq('status', 'completed').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    );
    items.push({ document, analysis });
  }
  if (items.length !== comparison.document_ids.length) throw new Error('Not all comparison documents are available');

  const ai = await compareDocuments(items);
  await expectNoError(admin.from('document_comparisons').update({
    provider: ai.provider,
    model: ai.model,
    status: 'completed',
    result: {
      ...(ai.result || {}),
      limitations: normalizeLimitations(ai.result?.limitations || []),
    },
    usage: ai.usage || {},
    completed_at: new Date().toISOString(),
  }).eq('id', comparison.id));
}

async function failJob(job, error) {
  const message = String(error?.message || error).slice(0, 4000);
  const retry = job.attempts < job.max_attempts;
  await expectNoError(admin.from('document_analysis_jobs').update({
    status: retry ? 'queued' : 'failed',
    available_at: retry ? new Date(Date.now() + Math.min(60000, 2000 * (2 ** job.attempts))).toISOString() : job.available_at,
    completed_at: retry ? null : new Date().toISOString(),
    last_error: message,
  }).eq('id', job.id));

  if (!retry && job.job_type === 'document_analysis') {
    await expectNoError(admin.from('documents').update({ processing_status: 'failed', updated_at: new Date().toISOString() }).eq('id', job.document_id));
    if (job.payload?.analysis_id) {
      await expectNoError(admin.from('document_analyses').update({
        status: 'failed',
        error_code: 'ANALYSIS_FAILED',
        error_message: message,
        completed_at: new Date().toISOString(),
      }).eq('id', job.payload.analysis_id));
    }
  }

  if (!retry && job.job_type === 'document_comparison') {
    await expectNoError(admin.from('document_comparisons').update({
      status: 'failed',
      error_code: 'COMPARISON_FAILED',
      error_message: message,
      completed_at: new Date().toISOString(),
    }).eq('id', job.comparison_id));
  }
}

async function processNextJobs(limit = 2) {
  const { data: jobs, error } = await admin.rpc('claim_document_analysis_jobs', { p_worker_id: WORKER_ID, p_limit: limit });
  if (error) throw error;

  for (const job of jobs || []) {
    try {
      if (job.job_type === 'document_analysis') await processAnalysisJob(job);
      else await processComparisonJob(job);
      await expectNoError(admin.from('document_analysis_jobs').update({ status: 'completed', completed_at: new Date().toISOString(), last_error: null }).eq('id', job.id));
    } catch (err) {
      console.error('[document-intelligence] job failed', job.id, err);
      await failJob(job, err);
    }
  }

  return (jobs || []).length;
}

async function getDocumentForUser(id, authUserId) {
  const actor = await loadActorContext(authUserId);
  const { data: document, error } = await admin
    .from('documents')
    .select('*')
    .eq('id', id)
    .in('user_id', actor.ownerUserIds)
    .maybeSingle();
  if (error) throw error;
  if (!document) return null;

  await assertCaseAccess(actor, document.case_id);

  const { data: analysis } = await admin
    .from('document_analyses')
    .select('*')
    .eq('document_id', id)
    .in('user_id', actor.ownerUserIds)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    document: annotateWorkflow(document),
    analysis: normalizeAnalysisRecord(analysis),
  };
}

async function getComparisonForUser(id, authUserId) {
  const actor = await loadActorContext(authUserId);
  const { data, error } = await admin
    .from('document_comparisons')
    .select('*')
    .eq('id', id)
    .in('user_id', actor.ownerUserIds)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  await assertCaseAccess(actor, data.case_id);
  return normalizeComparisonResult(data);
}

async function deleteDocumentForUser(id, authUserId, reason = 'user_request') {
  const actor = await loadActorContext(authUserId);
  const { data: document, error } = await admin
    .from('documents')
    .select('*')
    .eq('id', id)
    .in('user_id', actor.ownerUserIds)
    .maybeSingle();
  if (error) throw error;
  if (!document) return null;

  await assertCaseAccess(actor, document.case_id);

  if (document.storage_path) {
    const { error: storageError } = await admin.storage.from('document-intelligence').remove([document.storage_path]);
    if (storageError) throw storageError;
  }

  await expectNoError(admin.from('documents').delete().eq('id', document.id));

  return {
    id: document.id,
    deleted: true,
    deleted_at: new Date().toISOString(),
    deletion_reason: reason,
    retention_days: DOCUMENT_RETENTION_DAYS,
  };
}

async function getAnalysisForUser(id, authUserId) {
  const actor = await loadActorContext(authUserId);
  const { data, error } = await admin
    .from('document_analyses')
    .select('*')
    .eq('id', id)
    .in('user_id', actor.ownerUserIds)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  if (data.document_id) {
    const { data: document, error: documentError } = await admin
      .from('documents')
      .select('id,case_id,user_id')
      .eq('id', data.document_id)
      .in('user_id', actor.ownerUserIds)
      .maybeSingle();
    if (documentError) throw documentError;
    if (!document) return null;
    await assertCaseAccess(actor, document.case_id);
  }

  return normalizeAnalysisRecord(data);
}

module.exports = {
  createTextDocument,
  createUploadDocument,
  createComparison,
  queueDocumentAnalysis,
  processNextJobs,
  getDocumentForUser,
  getComparisonForUser,
  deleteDocumentForUser,
  getAnalysisForUser,
};
