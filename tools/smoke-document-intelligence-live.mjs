const baseUrl = String(process.env.SAFESTEPS_BACKEND_URL || '').replace(/\/$/, '');
const primaryToken = process.env.SAFESTEPS_ACCESS_TOKEN;
const secondaryToken = process.env.SAFESTEPS_SECONDARY_ACCESS_TOKEN || null;
const allowedCaseId = process.env.SAFESTEPS_CASE_ID || null;
const forbiddenCaseId = process.env.SAFESTEPS_FORBIDDEN_CASE_ID || null;
const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || null;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || null;

if (!baseUrl) throw new Error('Set SAFESTEPS_BACKEND_URL to the deployed Node backend.');
if (!primaryToken) throw new Error('Set SAFESTEPS_ACCESS_TOKEN to a valid Supabase user access token.');

const jsonHeaders = { 'Content-Type': 'application/json' };

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { method = 'GET', token = null, body, expectedStatus } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { ...jsonHeaders, ...authHeaders(token) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;
  if (typeof expectedStatus === 'number' && response.status !== expectedStatus) {
    throw new Error(`${method} ${path} expected ${expectedStatus}, received ${response.status}: ${text}`);
  }
  if (typeof expectedStatus !== 'number' && !response.ok) {
    throw new Error(`${method} ${path} failed (${response.status}): ${text}`);
  }
  return { response, body: parsed, raw: text };
}

async function waitForDocument(id, token, timeoutMs = 180000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { body } = await request(`/documents/${id}`, { token });
    const status = body.analysis?.status;
    if (status === 'completed' || status === 'failed') return body;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(`Timed out waiting for document ${id}`);
}

async function waitForComparison(id, token, timeoutMs = 180000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { body } = await request(`/documents/comparisons/${id}`, { token });
    const status = body.comparison?.status;
    if (status === 'completed' || status === 'failed') return body;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(`Timed out waiting for comparison ${id}`);
}

function randomUuidLike() {
  return '00000000-0000-4000-8000-000000000000';
}

function makeUniqueComparisonIds(baseId, count) {
  const seed = baseId.replace(/-/g, '');
  const values = [];
  for (let i = 0; i < count; i += 1) {
    const hex = i.toString(16).padStart(2, '0');
    const raw = `${seed.slice(0, 30)}${hex}${seed.slice(32)}`.slice(0, 32);
    values.push(`${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`);
  }
  return values;
}

async function expectUnauthenticated() {
  const docId = randomUuidLike();
  const comparisonId = randomUuidLike();
  const checks = [
    request('/documents/text', { method: 'POST', expectedStatus: 401, body: { text: 'a' } }),
    request('/documents/upload', { method: 'POST', expectedStatus: 401, body: { fileName: 'a.txt', mimeType: 'text/plain', contentBase64: Buffer.from('a').toString('base64') } }),
    request('/documents/analyze', { method: 'POST', expectedStatus: 401, body: { text: 'a' } }),
    request('/documents/analyze/fairness', { method: 'POST', expectedStatus: 401, body: { text: 'a' } }),
    request('/documents/compare', { method: 'POST', expectedStatus: 401, body: { documentIds: [docId, docId] } }),
    request(`/documents/${docId}`, { expectedStatus: 401 }),
    request(`/documents/comparisons/${comparisonId}`, { expectedStatus: 401 }),
    request(`/documents/${docId}`, { method: 'DELETE', expectedStatus: 401 }),
  ];
  await Promise.all(checks);
}

function assertDecisionSupportEnvelope(result) {
  if (!result.analysis) throw new Error('Document result is missing analysis payload.');
  if (!Array.isArray(result.analysis.limitations) || result.analysis.limitations.length === 0) {
    throw new Error('Document analysis must include non-empty limitations.');
  }
  if (!result.analysis.confidence_overview || typeof result.analysis.confidence_overview.sample_count !== 'number') {
    throw new Error('Document analysis must include confidence_overview metadata.');
  }
  if (!result.analysis.decision_support_only || !result.analysis.unverified || !result.analysis.human_review_required) {
    throw new Error('Document analysis must be labelled as unverified decision-support with human review required.');
  }
  if (typeof result.analysis.human_review_status !== 'string') {
    throw new Error('Document analysis must include human_review_status.');
  }
}

async function verifyStorageBucketPrivacy() {
  if (!supabaseUrl || !serviceRoleKey) {
    return { checked: false, reason: 'Skipped bucket privacy check (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing).' };
  }

  const endpoint = `${supabaseUrl}/storage/v1/bucket/document-intelligence`;
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
  });

  if (!response.ok) {
    return { checked: false, reason: `Bucket metadata query failed (${response.status}).` };
  }

  const bucket = await response.json();
  if (bucket.public !== false) throw new Error('document-intelligence bucket must remain private (public=false).');
  if (bucket.file_size_limit !== 26214400) throw new Error(`document-intelligence bucket must enforce 25 MiB limit; got ${bucket.file_size_limit}`);

  return { checked: true, public: bucket.public, file_size_limit: bucket.file_size_limit };
}

const summary = {
  authenticated_routes: {},
  constraints: {},
  isolation: {},
  case_access: {},
  storage_policy: {},
  deletion: {},
};

await expectUnauthenticated();
summary.authenticated_routes.unauthenticated_blocked = true;

const { body: ready } = await request('/ready');
if (!ready.ready) throw new Error(`Backend readiness failed: ${JSON.stringify(ready)}`);
summary.authenticated_routes.ready = { provider: ready.provider, ready: ready.ready };

const first = await request('/documents/analyze/fairness', {
  method: 'POST',
  token: primaryToken,
  body: {
    caseId: allowedCaseId,
    text: 'The parent attended the scheduled meeting. The note states that the parent failed to cooperate but does not describe the specific request or response.',
  },
});

const firstResult = await waitForDocument(first.body.document_id, primaryToken);
assertDecisionSupportEnvelope(firstResult);
summary.authenticated_routes.fairness_analysis = {
  document_id: first.body.document_id,
  analysis_status: firstResult.analysis?.status,
  human_review_status: firstResult.analysis?.human_review_status,
};

const second = await request('/documents/text', {
  method: 'POST',
  token: primaryToken,
  body: {
    caseId: allowedCaseId,
    fileName: 'comparison-note.txt',
    text: 'The parent attended the meeting at 9:05 AM. The worker requested a signed form. The parent asked to review it before signing and the discussion ended at 9:20 AM.',
  },
});
await waitForDocument(second.body.document_id, primaryToken);

const analyzeRouteDocument = await request('/documents/analyze', {
  method: 'POST',
  token: primaryToken,
  body: {
    caseId: allowedCaseId,
    text: 'Observed behavior note used to verify /documents/analyze route under authenticated access.',
  },
});
await waitForDocument(analyzeRouteDocument.body.document_id, primaryToken);
summary.authenticated_routes.analyze_route = { document_id: analyzeRouteDocument.body.document_id };

const comparison = await request('/documents/compare', {
  method: 'POST',
  token: primaryToken,
  body: { caseId: allowedCaseId, documentIds: [first.body.document_id, second.body.document_id] },
});
const comparisonResult = await waitForComparison(comparison.body.comparison_id, primaryToken);
if (!comparisonResult.comparison?.decision_support_only || !comparisonResult.comparison?.unverified || !comparisonResult.comparison?.human_review_required) {
  throw new Error('Comparison result is missing decision-support and human-review labels.');
}
if (!Array.isArray(comparisonResult.comparison?.result?.limitations) || comparisonResult.comparison.result.limitations.length === 0) {
  throw new Error('Comparison result must include limitations.');
}
summary.authenticated_routes.comparison = {
  comparison_id: comparison.body.comparison_id,
  status: comparisonResult.comparison?.status,
};

await request('/documents/compare', {
  method: 'POST',
  token: primaryToken,
  expectedStatus: 400,
  body: { caseId: allowedCaseId, documentIds: [first.body.document_id] },
});
summary.constraints.comparison_fewer_than_two = true;

await request('/documents/compare', {
  method: 'POST',
  token: primaryToken,
  expectedStatus: 400,
  body: { caseId: allowedCaseId, documentIds: makeUniqueComparisonIds(first.body.document_id, 11) },
});
summary.constraints.comparison_more_than_ten = true;

await request('/documents/compare', {
  method: 'POST',
  token: primaryToken,
  expectedStatus: 400,
  body: { caseId: allowedCaseId, documentIds: [first.body.document_id, first.body.document_id] },
});
summary.constraints.comparison_duplicate_documents = true;

const duplicateUpload = await request('/documents/upload', {
  method: 'POST',
  token: primaryToken,
  body: {
    caseId: allowedCaseId,
    fileName: 'dup-one.txt',
    mimeType: 'text/plain',
    contentBase64: Buffer.from('duplicate hash body', 'utf8').toString('base64'),
  },
});
const duplicateUpload2 = await request('/documents/upload', {
  method: 'POST',
  token: primaryToken,
  body: {
    caseId: allowedCaseId,
    fileName: 'dup-two.txt',
    mimeType: 'text/plain',
    contentBase64: Buffer.from('duplicate hash body', 'utf8').toString('base64'),
  },
});
if (!duplicateUpload2.body.duplicate_document) throw new Error('Expected duplicate upload to be flagged via SHA-256 deduplication.');
summary.constraints.duplicate_upload_sha256 = {
  first_document_id: duplicateUpload.body.document_id,
  second_document_id: duplicateUpload2.body.document_id,
  duplicate_document: duplicateUpload2.body.duplicate_document,
};

await request('/documents/upload', {
  method: 'POST',
  token: primaryToken,
  expectedStatus: 400,
  body: {
    caseId: allowedCaseId,
    fileName: 'unsupported.bin',
    mimeType: 'application/x-msdownload',
    contentBase64: Buffer.from('binary body', 'utf8').toString('base64'),
  },
});
summary.constraints.unsupported_file_type = true;

await request('/documents/upload', {
  method: 'POST',
  token: primaryToken,
  expectedStatus: 400,
  body: {
    caseId: allowedCaseId,
    fileName: 'too-large.txt',
    mimeType: 'text/plain',
    contentBase64: Buffer.alloc((25 * 1024 * 1024) + 1, 65).toString('base64'),
  },
});
summary.constraints.large_file_limit = true;

if (forbiddenCaseId) {
  await request('/documents/text', {
    method: 'POST',
    token: primaryToken,
    expectedStatus: 403,
    body: { caseId: forbiddenCaseId, text: 'attempting forbidden case access' },
  });
  summary.case_access.forbidden_case_blocked = true;
} else {
  summary.case_access.forbidden_case_blocked = 'skipped (set SAFESTEPS_FORBIDDEN_CASE_ID to verify)';
}

if (secondaryToken) {
  await request(`/documents/${first.body.document_id}`, { token: secondaryToken, expectedStatus: 404 });
  await request(`/documents/comparisons/${comparison.body.comparison_id}`, { token: secondaryToken, expectedStatus: 404 });
  await request('/documents/compare', {
    method: 'POST',
    token: secondaryToken,
    expectedStatus: 404,
    body: { caseId: allowedCaseId, documentIds: [first.body.document_id, second.body.document_id] },
  });
  summary.isolation.cross_user_access_blocked = true;
} else {
  summary.isolation.cross_user_access_blocked = 'skipped (set SAFESTEPS_SECONDARY_ACCESS_TOKEN to verify)';
}

const deleted = await request(`/documents/${second.body.document_id}`, { method: 'DELETE', token: primaryToken, expectedStatus: 200 });
if (!deleted.body?.deleted) throw new Error('Expected document deletion response to confirm deletion.');
await request(`/documents/${second.body.document_id}`, { token: primaryToken, expectedStatus: 404 });
summary.deletion.user_delete_flow = { document_id: second.body.document_id, deleted: true };

summary.storage_policy = await verifyStorageBucketPrivacy();

console.log(JSON.stringify({ status: 'passed', summary }, null, 2));
