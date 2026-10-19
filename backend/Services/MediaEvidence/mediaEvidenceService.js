'use strict';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const START_FIELDS = new Set([
  'caseId',
  'familyId',
  'childId',
  'consentId',
  'mediaType',
  'sourceType',
  'originalFilename',
  'mimeType',
  'byteSize',
  'claimedCapturedAt',
]);
const MEDIA_TYPES = new Set(['photo', 'video', 'audio']);
const SOURCE_TYPES = new Set(['in_app_capture', 'device_upload', 'professional_upload']);
const RESTRICTION_CATEGORIES = new Set([
  'suspected_illegal_content',
  'privacy_concern',
  'other_safety_concern',
]);

function mediaError(code, message, statusCode) {
  const error = new Error(message);
  error.code = code;
  if (statusCode !== undefined) error.statusCode = statusCode;
  return error;
}

function validateStart(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw mediaError('VALIDATION_ERROR', 'Upload details must be an object');
  }
  for (const key of Object.keys(input)) {
    if (!START_FIELDS.has(key)) throw mediaError('VALIDATION_ERROR', `Unsupported upload field: ${key}`);
  }
  for (const key of ['caseId', 'familyId', 'consentId']) {
    if (typeof input[key] !== 'string' || !UUID_PATTERN.test(input[key])) {
      throw mediaError('VALIDATION_ERROR', `${key} must be a UUID`);
    }
  }
  if (input.childId != null && (typeof input.childId !== 'string' || !UUID_PATTERN.test(input.childId))) {
    throw mediaError('VALIDATION_ERROR', 'childId must be a UUID when provided');
  }
  if (!MEDIA_TYPES.has(input.mediaType)) throw mediaError('VALIDATION_ERROR', 'Unsupported mediaType');
  if (!SOURCE_TYPES.has(input.sourceType)) throw mediaError('VALIDATION_ERROR', 'Unsupported sourceType');

  if (typeof input.originalFilename !== 'string'
    || input.originalFilename.trim() !== input.originalFilename
    || input.originalFilename.length < 1
    || input.originalFilename.length > 255
    || /[\\/\u0000-\u001f\u007f]/.test(input.originalFilename)
    || input.originalFilename === '.'
    || input.originalFilename === '..') {
    throw mediaError('VALIDATION_ERROR', 'originalFilename must be a plain filename');
  }
  if (typeof input.mimeType !== 'string'
    || input.mimeType.length > 127
    || !/^[A-Za-z0-9!#$&^_.+-]+\/[A-Za-z0-9!#$&^_.+-]+$/.test(input.mimeType)) {
    throw mediaError('VALIDATION_ERROR', 'mimeType must be a valid media type');
  }
  if (!Number.isSafeInteger(input.byteSize) || input.byteSize < 1) {
    throw mediaError('VALIDATION_ERROR', 'byteSize must be a positive safe integer');
  }
  if (input.claimedCapturedAt !== undefined
    && (typeof input.claimedCapturedAt !== 'string'
      || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(input.claimedCapturedAt)
      || Number.isNaN(Date.parse(input.claimedCapturedAt)))) {
    throw mediaError('VALIDATION_ERROR', 'claimedCapturedAt must be an ISO timestamp');
  }
  return input;
}

async function requireMediaStepUp(identity, now = Date.now()) {
  if (!identity?.user?.id || !identity?.sessionReference || typeof identity?.supabase?.auth?.getClaims !== 'function') {
    throw mediaError('MEDIA_STEP_UP_REQUIRED', 'Recent multi-factor authentication is required');
  }
  let result;
  try {
    result = await identity.supabase.auth.getClaims();
  } catch {
    throw mediaError('MEDIA_STEP_UP_REQUIRED', 'Recent multi-factor authentication is required');
  }
  const claims = result?.data?.claims;
  const verifiedAt = Number(claims?.amr?.find((item) => item.method === 'totp')?.timestamp);
  const ageSeconds = (now / 1000) - verifiedAt;
  if (result?.error
    || claims?.sub !== identity.user.id
    || claims?.session_id !== identity.sessionReference
    || claims?.aal !== 'aal2'
    || !Number.isFinite(verifiedAt)
    || ageSeconds < 0
    || ageSeconds > 300) {
    throw mediaError('MEDIA_STEP_UP_REQUIRED', 'Recent multi-factor authentication is required');
  }
  return true;
}

function asOperationError(result) {
  const error = mediaError(
    typeof result?.code === 'string' ? result.code : 'MEDIA_OPERATION_FAILED',
    typeof result?.message === 'string' ? result.message : 'Media operation failed',
    Number.isInteger(result?.status) ? result.status : undefined,
  );
  return error;
}

function formatSourceTimestamp(value) {
  if (!Number.isSafeInteger(value) || value < 0) return null;
  const hours = Math.floor(value / 3_600_000);
  const minutes = Math.floor((value % 3_600_000) / 60_000);
  const seconds = Math.floor((value % 60_000) / 1000);
  const milliseconds = value % 1000;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':')
    + `.${String(milliseconds).padStart(3, '0')}`;
}

function normalizeFinding(finding) {
  return {
    id: finding.id,
    evidenceId: finding.evidence_id,
    sourceFileId: finding.source_file_id,
    finding: finding.finding,
    confidence: finding.confidence ?? null,
    confidenceBasis: finding.confidence_basis,
    sourceTimestamp: formatSourceTimestamp(finding.source_time_ms),
    method: finding.method,
    modelVersion: finding.model_version,
    limitations: finding.limitations,
    reviewStatus: finding.review_status ?? 'human_review_required',
    ...(finding.supersedes_id ? { supersedesId: finding.supersedes_id } : {}),
  };
}

function createMediaEvidenceService({ clientFactory, ingestionAdapter } = {}) {
  return {
    async execute({ auth, action, id, body = {}, requestId } = {}) {
      if (!auth?.user?.id || !auth.accessToken || !auth.sessionReference || auth.isLocalBypass === true) {
        throw mediaError('MEDIA_AUTH_REQUIRED', 'Authenticated, non-bypass session required');
      }
      if (action === 'start') {
        if (!ingestionAdapter) {
          throw mediaError('MEDIA_INGESTION_NOT_CONFIGURED', 'Media ingestion requires approved storage and retention infrastructure', 503);
        }
        throw mediaError('MEDIA_INGESTION_NOT_CONFIGURED', 'Media ingestion is not enabled', 503);
      }
      if (typeof clientFactory !== 'function') {
        throw mediaError('MEDIA_CAPABILITY_NOT_CONFIGURED', 'Media operations are not configured', 503);
      }
      if (!UUID_PATTERN.test(id ?? '') || !UUID_PATTERN.test(requestId ?? '')) {
        throw mediaError('VALIDATION_ERROR', 'Evidence and request IDs must be UUIDs', 400);
      }

      let payload = body;
      if (action === 'report-restriction') {
        if (!body || typeof body !== 'object' || Array.isArray(body)
          || Object.keys(body).some((key) => key !== 'category')
          || !RESTRICTION_CATEGORIES.has(body.category)) {
          throw mediaError('VALIDATION_ERROR', 'A supported restriction category is required', 400);
        }
        payload = { category: body.category };
      } else if (!['summary', 'findings', 'custody', 'metadata', 'transcript'].includes(action)) {
        throw mediaError('VALIDATION_ERROR', 'Unsupported media action', 400);
      } else {
        payload = {};
      }

      const client = clientFactory(auth);
      const { data, error } = await client.rpc('media_evidence_operation', {
        p_actor: auth.user.id,
        p_session: auth.sessionReference,
        p_action: action,
        p_evidence: id,
        p_body: payload,
        p_request: requestId,
      });
      if (error) throw mediaError('MEDIA_OPERATION_FAILED', 'Media operation failed');
      if (!data || data.ok !== true) throw asOperationError(data);
      if (action === 'findings') {
        return { ...data, findings: (Array.isArray(data.findings) ? data.findings : []).map(normalizeFinding) };
      }
      return data;
    },
  };
}

module.exports = { createMediaEvidenceService, requireMediaStepUp, validateStart };
