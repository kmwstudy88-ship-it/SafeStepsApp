'use strict';

function createServiceError(code, message, status = 400) {
  const err = new Error(message || code);
  err.code = code;
  err.status = status;
  return err;
}

function assertAuthenticatedContext(auth) {
  if (
    !auth
    || typeof auth !== 'object'
    || auth.isLocalBypass === true
    || !auth.user?.id
    || typeof auth.sessionReference !== 'string'
    || !auth.sessionReference.trim()
  ) {
    throw createServiceError('MEDIA_AUTH_REQUIRED', 'Authenticated non-bypass session is required', 401);
  }
}

async function requireMediaStepUp(auth, nowMs = Date.now()) {
  assertAuthenticatedContext(auth);
  if (typeof auth.supabase?.auth?.getClaims !== 'function') {
    throw createServiceError('MEDIA_STEP_UP_REQUIRED', 'Step-up claim verification is unavailable', 403);
  }

  const result = await auth.supabase.auth.getClaims();
  const claims = result?.data?.claims;
  if (result?.error || !claims || typeof claims !== 'object') {
    throw createServiceError('MEDIA_STEP_UP_REQUIRED', 'Unable to verify signed session claims', 403);
  }

  if (
    claims.sub !== auth.user.id
    || claims.session_id !== auth.sessionReference
    || claims.aal !== 'aal2'
    || !Array.isArray(claims.amr)
  ) {
    throw createServiceError('MEDIA_STEP_UP_REQUIRED', 'AAL2 step-up authentication is required', 403);
  }

  const nowSeconds = nowMs / 1000;
  const freshMfa = claims.amr.some((entry) => {
    if (!entry || typeof entry !== 'object') return false;
    const isMfaMethod = ['totp', 'webauthn', 'mfa', 'recovery'].includes(String(entry.method || '').toLowerCase());
    const ts = Number(entry.timestamp);
    return isMfaMethod && Number.isFinite(ts) && (nowSeconds - ts) <= 300 && (ts - nowSeconds) <= 60;
  });

  if (!freshMfa) {
    throw createServiceError('MEDIA_STEP_UP_REQUIRED', 'Recent MFA verification (<= 300s) is required', 403);
  }

  return true;
}

const ALLOWED_START_KEYS = new Set([
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

const ISO_TIMESTAMP_WITH_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function validateStart(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createServiceError('VALIDATION_ERROR', 'Upload start payload must be an object');
  }

  for (const key of Object.keys(body)) {
    if (!ALLOWED_START_KEYS.has(key)) {
      throw createServiceError('VALIDATION_ERROR', `Disallowed upload field: ${key}`);
    }
  }

  const filename = String(body.originalFilename || '');
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw createServiceError('VALIDATION_ERROR', 'Invalid originalFilename');
  }

  if (!Number.isSafeInteger(body.byteSize) || body.byteSize <= 0) {
    throw createServiceError('VALIDATION_ERROR', 'byteSize must be a positive safe integer');
  }

  if (body.claimedCapturedAt !== undefined && !ISO_TIMESTAMP_WITH_TIME.test(String(body.claimedCapturedAt))) {
    throw createServiceError('VALIDATION_ERROR', 'claimedCapturedAt must be an ISO-8601 timestamp with time and zone');
  }

  return { ...body };
}

const ALLOWED_RESTRICTION_KEYS = new Set(['category', 'reasonCode']);

function validateRestrictionReport(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createServiceError('VALIDATION_ERROR', 'Restriction report body must be an object');
  }
  for (const key of Object.keys(body)) {
    if (!ALLOWED_RESTRICTION_KEYS.has(key)) {
      throw createServiceError('VALIDATION_ERROR', `Disallowed restriction report field: ${key}`);
    }
  }
  if (typeof body.category !== 'string' || !body.category.trim()) {
    throw createServiceError('VALIDATION_ERROR', 'Restriction category is required');
  }
  return { category: body.category.trim(), reasonCode: body.reasonCode || null };
}

function formatMilliseconds(ms) {
  if (!Number.isFinite(ms) || ms < 0) return null;
  const totalMs = Math.floor(ms);
  const hours = String(Math.floor(totalMs / 3600000)).padStart(2, '0');
  const minutes = String(Math.floor((totalMs % 3600000) / 60000)).padStart(2, '0');
  const seconds = String(Math.floor((totalMs % 60000) / 1000)).padStart(2, '0');
  const millis = String(totalMs % 1000).padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${millis}`;
}

function mapFindingDto(row = {}) {
  return {
    id: row.id,
    evidenceId: row.evidence_id,
    sourceFileId: row.source_file_id,
    finding: row.finding,
    confidence: typeof row.confidence === 'number' ? row.confidence : null,
    confidenceBasis: row.confidence_basis || 'Not calibrated',
    sourceTimestamp: formatMilliseconds(row.source_time_ms),
    method: row.method,
    modelVersion: row.model_version,
    limitations: row.limitations,
    reviewStatus: 'human_review_required',
  };
}

function createMediaEvidenceService({ clientFactory, ingestionReady = false } = {}) {
  async function execute({ auth, action, id, body = {}, requestId }) {
    assertAuthenticatedContext(auth);

    if (action === 'start') {
      validateStart(body);
      if (!ingestionReady) {
        throw createServiceError('MEDIA_INGESTION_NOT_CONFIGURED', 'Media ingestion infrastructure is not configured', 503);
      }
    }

    if (action === 'report-restriction') {
      validateRestrictionReport(body);
    }

    if (typeof clientFactory !== 'function') {
      throw createServiceError('MEDIA_SERVICE_UNAVAILABLE', 'Database client factory is required', 503);
    }

    const client = clientFactory();
    const { data, error } = await client.rpc('media_evidence_action', {
      p_actor: auth.user.id,
      p_action: action,
      p_evidence_id: id || null,
      p_request_id: requestId || null,
    });

    if (error) {
      throw createServiceError(error.code || 'MEDIA_RPC_FAILED', error.message || 'Media RPC failed', 500);
    }

    if (!data || data.ok === false) {
      throw createServiceError(data?.code || 'MEDIA_DENIED', data?.message || 'Access denied', data?.status || 403);
    }

    if (action === 'findings' && Array.isArray(data.findings)) {
      return {
        ok: true,
        findings: data.findings.map(mapFindingDto),
      };
    }

    return data;
  }

  return { execute };
}

module.exports = {
  requireMediaStepUp,
  validateStart,
  createMediaEvidenceService,
};
