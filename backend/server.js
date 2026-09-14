'use strict';

const http = require('node:http');
const {
  ANALYSIS_SCHEMA_VERSION,
  mediaSignalDomains,
} = require('./document-intelligence/ai');
const {
  createTextDocument,
  createUploadDocument,
  createComparison,
  processNextJobs,
  getDocumentForUser,
  getComparisonForUser,
} = require('./document-intelligence/pipeline');
const { authenticateBearer } = require('./document-intelligence/supabase');
const { createCaseRiskService } = require('./case-risk/service');

const PORT = Number(process.env.PORT || 3000);
const MAX_BODY_BYTES = 35 * 1024 * 1024;
const WORKER_INTERVAL_MS = Math.max(1000, Number(process.env.DOCUMENT_AI_WORKER_INTERVAL_MS || 2500));
const RATE_LIMIT_WINDOW_MS = Math.max(1000, Number(process.env.BACKEND_RATE_LIMIT_WINDOW_MS || 60000));
const RATE_LIMIT_MAX_REQUESTS = Math.max(1, Number(process.env.BACKEND_RATE_LIMIT_MAX_REQUESTS || 120));
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const DEV_DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:8099',
  'http://127.0.0.1:8099',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
const rateLimitBuckets = new Map();

const DOCUMENT_SECTIONS = [
  'Case Identification & Reference', 'Family Composition & Demographics', 'Child Safety History & Intakes',
  'Substantiated Harm Details', 'Allegation & Harm Matrix', 'Parental Capacity Assessment',
  'Protective Factors & Strengths', 'Safety Network & Kinship Support', 'Substance & AOD Screening',
  'Mental Health Context & History', 'Domestic & Family Violence Screening', 'Safety Plan Versions & Commitments',
  'Housing & Stability Verification', 'Financial Self-Sufficiency', 'Child Voice & Developmental Wishes',
  'Education & School Attendance', 'Pediatric & Healthcare Records', 'Contact Visit Attendance Log',
  'Contact Visit Observation Summaries', 'Caseworker Field Notes', 'Service Provider Progress Letters',
  'Case Conference Minutes', 'Court Orders & Interim Directions', 'Reunification Milestone Progress',
  'Behavioral Regulation Observations', 'Positive Discipline Practices', 'Co-Parenting & Communication',
  'Parenting Program Attendance', 'Routine & Schedule Verification', 'Emotional Availability Evaluation',
  'Child Adjustment to Visits', 'Risk Mitigation Measures', 'Cultural Safety & Community Connection',
  'Trauma-Informed Care Application', 'Urinalysis & Toxicology Logs', 'Police & Background Verifications',
  'Evidence Chain of Custody Registry', 'Fairness & Bias Analysis Layer', 'Coercion & Framing Checkpoints',
  'Remediation & Reframe Directives', 'CSO Supervisory Endorsements', 'Case Closure & Reunification Orders',
  'Interagency Collaboration Notes', 'Parent-Child Attachment Indicators', 'Incident Escalation Trail',
  'Compliance Obligations Tracking', 'Service Referral Timelines', 'Outcome Measurement Benchmarks',
];

const caseRiskService = createCaseRiskService();

function setCors(req, res) {
  const origin = req.headers.origin;
  const configuredOrigins = (process.env.BACKEND_ALLOWED_ORIGINS || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);
  const allowedOrigins = configuredOrigins.length ? configuredOrigins : (IS_PRODUCTION ? [] : DEV_DEFAULT_ALLOWED_ORIGINS);
  const allowsWildcard = allowedOrigins.includes('*') && !IS_PRODUCTION;
  const allowsOrigin = Boolean(origin) && (allowsWildcard || allowedOrigins.includes(origin));
  res.setHeader('Access-Control-Allow-Origin', allowsOrigin ? (allowsWildcard ? '*' : origin) : 'null');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Vary', 'Origin');
}

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

function sendJson(res, statusCode, data) {
  const json = JSON.stringify(data);
  res.writeHead(statusCode, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(json) });
  res.end(json);
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function rateLimited(req, pathname) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) return null;
  const now = Date.now();
  const key = `${clientIp(req)}:${req.method}:${pathname}`;
  const windowStartedAt = now - RATE_LIMIT_WINDOW_MS;
  const current = rateLimitBuckets.get(key);
  const windowRecord = current && current.windowStartedAt >= windowStartedAt
    ? current
    : { windowStartedAt: now, count: 0 };
  windowRecord.count += 1;
  rateLimitBuckets.set(key, windowRecord);

  for (const [bucketKey, bucketValue] of rateLimitBuckets) {
    if (bucketValue.windowStartedAt < windowStartedAt) {
      rateLimitBuckets.delete(bucketKey);
    }
  }

  if (windowRecord.count <= RATE_LIMIT_MAX_REQUESTS) return null;
  const retryAfterSeconds = Math.max(1, Math.ceil((windowRecord.windowStartedAt + RATE_LIMIT_WINDOW_MS - now) / 1000));
  return retryAfterSeconds;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Request body exceeds limit'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); }
      catch { reject(Object.assign(new Error('Invalid JSON request body'), { statusCode: 400 })); }
    });
    req.on('error', reject);
  });
}

async function requireUser(req, res) {
  const user = await authenticateBearer(req.headers.authorization);
  if (!user) sendJson(res, 401, { error: { code: 'UNAUTHENTICATED', message: 'A valid Supabase access token is required.' } });
  return user;
}

function routeId(pathname, prefix) {
  if (!pathname.startsWith(prefix)) return null;
  const value = pathname.slice(prefix.length);
  return /^[0-9a-f-]{36}$/i.test(value) ? value : null;
}

function routeCaseSubpath(pathname) {
  const match = pathname.match(/^\/cases\/([0-9a-f-]{36})\/([a-z-]+)$/i);
  if (!match) return null;
  return { caseId: match[1], action: match[2] };
}

function readiness() {
  const provider = String(process.env.DOCUMENT_AI_PROVIDER || 'openai').toLowerCase() === 'anthropic' ? 'anthropic' : 'openai';
  const checks = {
    supabaseUrl: Boolean(process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL),
    supabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    providerKey: provider === 'anthropic' ? Boolean(process.env.ANTHROPIC_API_KEY) : Boolean(process.env.OPENAI_API_KEY),
  };
  return { ready: Object.values(checks).every(Boolean), provider, checks };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  setCors(req, res);
  setSecurityHeaders(res);
  const retryAfterSeconds = rateLimited(req, url.pathname);
  if (retryAfterSeconds) {
    res.setHeader('Retry-After', String(retryAfterSeconds));
    return sendJson(res, 429, {
      error: {
        code: 'RATE_LIMITED',
        message: `Too many requests. Retry in ${retryAfterSeconds} seconds.`,
      },
    });
  }
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(res, 200, { status: 'ok', documentIntelligence: true, timestamp: new Date().toISOString() });
    }

    if (req.method === 'GET' && url.pathname === '/ready') {
      const state = readiness();
      return sendJson(res, state.ready ? 200 : 503, { ...state, documentIntelligence: true, timestamp: new Date().toISOString() });
    }

    if (req.method === 'GET' && url.pathname === '/documents/intelligence/schema') {
      return sendJson(res, 200, {
        schemaVersion: ANALYSIS_SCHEMA_VERSION,
        sections: DOCUMENT_SECTIONS,
        totalSections: DOCUMENT_SECTIONS.length,
        mediaSignalDomains,
        totalMediaSignalDomains: mediaSignalDomains.length,
        timestamp: new Date().toISOString(),
      });
    }

    if (req.method === 'POST' && (url.pathname === '/documents/text' || url.pathname === '/documents/analyze' || url.pathname === '/documents/analyze/fairness')) {
      const user = await requireUser(req, res); if (!user) return;
      const body = await parseBody(req);
      const created = await createTextDocument({ userId: user.id, caseId: body.caseId || null, text: body.text, fileName: body.fileName || 'fairness-analysis.txt' });
      processNextJobs(1).catch(err => console.error('[document-intelligence] immediate worker error', err));
      return sendJson(res, 202, {
        document_id: created.document.id,
        analysis_id: created.analysis.id,
        job_id: created.job.id,
        status: 'queued',
        poll_url: `/documents/${created.document.id}`,
        human_review_required: true,
      });
    }

    if (req.method === 'POST' && url.pathname === '/documents/upload') {
      const user = await requireUser(req, res); if (!user) return;
      const body = await parseBody(req);
      const created = await createUploadDocument({
        userId: user.id, caseId: body.caseId || null, fileName: body.fileName, mimeType: body.mimeType,
        contentBase64: body.contentBase64, extractedText: body.extractedText || null,
      });
      processNextJobs(1).catch(err => console.error('[document-intelligence] immediate worker error', err));
      return sendJson(res, 202, { document_id: created.document.id, analysis_id: created.analysis.id, job_id: created.job.id, status: 'queued', poll_url: `/documents/${created.document.id}` });
    }

    const documentId = routeId(url.pathname, '/documents/');
    if (req.method === 'GET' && documentId) {
      const user = await requireUser(req, res); if (!user) return;
      const record = await getDocumentForUser(documentId, user.id);
      if (!record) return sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Document not found.' } });
      return sendJson(res, 200, record);
    }

    if (req.method === 'POST' && url.pathname === '/documents/compare') {
      const user = await requireUser(req, res); if (!user) return;
      const body = await parseBody(req);
      const created = await createComparison({ userId: user.id, caseId: body.caseId || null, documentIds: body.documentIds });
      processNextJobs(1).catch(err => console.error('[document-intelligence] comparison worker error', err));
      return sendJson(res, 202, { comparison_id: created.comparison.id, job_id: created.job.id, status: 'queued', poll_url: `/documents/comparisons/${created.comparison.id}` });
    }

    const comparisonId = routeId(url.pathname, '/documents/comparisons/');
    if (req.method === 'GET' && comparisonId) {
      const user = await requireUser(req, res); if (!user) return;
      const comparison = await getComparisonForUser(comparisonId, user.id);
      if (!comparison) return sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Comparison not found.' } });
      return sendJson(res, 200, { comparison });
    }

    const caseRoute = routeCaseSubpath(url.pathname);
    if (caseRoute?.action === 'events' && req.method === 'POST') {
      const user = await requireUser(req, res); if (!user) return;
      const body = await parseBody(req);
      const result = await caseRiskService.createCaseEventAndRecompute({
        authUserId: user.id,
        caseId: caseRoute.caseId,
        body,
      });
      return sendJson(res, 201, result);
    }

    if (caseRoute?.action === 'recompute-risk' && req.method === 'POST') {
      const user = await requireUser(req, res); if (!user) return;
      const result = await caseRiskService.recomputeRisk({
        authUserId: user.id,
        caseId: caseRoute.caseId,
      });
      return sendJson(res, 200, result);
    }

    if (caseRoute?.action === 'risk-history' && req.method === 'GET') {
      const user = await requireUser(req, res); if (!user) return;
      const result = await caseRiskService.getCaseRiskHistory({
        authUserId: user.id,
        caseId: caseRoute.caseId,
      });
      return sendJson(res, 200, result);
    }

    if (req.method === 'GET' && url.pathname === '/dashboard/supervisor') {
      const user = await requireUser(req, res); if (!user) return;
      const dashboard = await caseRiskService.getSupervisorDashboard({ authUserId: user.id });
      return sendJson(res, 200, dashboard);
    }

    return sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Route not found.' } });
  } catch (error) {
    console.error('[backend]', error);
    return sendJson(res, error.statusCode || 500, { error: { code: error.statusCode === 400 ? 'BAD_REQUEST' : 'INTERNAL_ERROR', message: error.message || 'Unexpected server error' } });
  }
});

let workerBusy = false;
const workerTimer = setInterval(async () => {
  if (workerBusy) return;
  workerBusy = true;
  try { await processNextJobs(2); }
  catch (error) { console.error('[document-intelligence] worker poll failed', error); }
  finally { workerBusy = false; }
}, WORKER_INTERVAL_MS);
workerTimer.unref?.();

server.listen(PORT, () => console.log(`SafeSteps backend listening on port ${PORT}`));

function shutdown() {
  clearInterval(workerTimer);
  server.close();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
