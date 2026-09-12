const baseUrl = String(process.env.SAFESTEPS_BACKEND_URL || '').replace(/\/$/, '');
const token = process.env.SAFESTEPS_ACCESS_TOKEN;

if (!baseUrl) throw new Error('Set SAFESTEPS_BACKEND_URL to the deployed Node backend.');
if (!token) throw new Error('Set SAFESTEPS_ACCESS_TOKEN to a valid Supabase user access token.');

const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

async function request(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`${init.method || 'GET'} ${path} failed (${response.status}): ${text}`);
  return body;
}

async function waitForDocument(id) {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    const result = await request(`/documents/${id}`);
    const status = result.analysis?.status;
    if (status === 'completed') return result;
    if (status === 'failed') throw new Error(`Analysis failed: ${result.analysis?.error_message || 'unknown error'}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  throw new Error(`Timed out waiting for document ${id}`);
}

async function waitForComparison(id) {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    const result = await request(`/documents/comparisons/${id}`);
    const status = result.comparison?.status;
    if (status === 'completed') return result;
    if (status === 'failed') throw new Error(`Comparison failed: ${result.comparison?.error_message || 'unknown error'}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  throw new Error(`Timed out waiting for comparison ${id}`);
}

const ready = await request('/ready');
if (!ready.ready) throw new Error(`Backend readiness failed: ${JSON.stringify(ready)}`);

const first = await request('/documents/analyze/fairness', {
  method: 'POST',
  body: JSON.stringify({
    text: 'The parent attended the scheduled meeting. The note states that the parent failed to cooperate but does not describe the specific request or response.'
  }),
});
const firstResult = await waitForDocument(first.document_id);

if (!firstResult.analysis?.fairness || !firstResult.analysis?.bias) {
  throw new Error('First analysis did not return fairness and bias structures.');
}
if (!Array.isArray(firstResult.analysis?.evidence) || !Array.isArray(firstResult.analysis?.timeline)) {
  throw new Error('First analysis did not return evidence/timeline arrays.');
}

const second = await request('/documents/text', {
  method: 'POST',
  body: JSON.stringify({
    fileName: 'comparison-note.txt',
    text: 'The parent attended the meeting at 9:05 AM. The worker requested a signed form. The parent asked to review it before signing and the discussion ended at 9:20 AM.'
  }),
});
await waitForDocument(second.document_id);

const comparison = await request('/documents/compare', {
  method: 'POST',
  body: JSON.stringify({ documentIds: [first.document_id, second.document_id] }),
});
const comparisonResult = await waitForComparison(comparison.comparison_id);

if (!comparisonResult.comparison?.result) throw new Error('Comparison completed without a result payload.');

console.log(JSON.stringify({
  status: 'passed',
  provider: ready.provider,
  documentIds: [first.document_id, second.document_id],
  comparisonId: comparison.comparison_id,
  fairnessScore: firstResult.analysis?.fairness?.score ?? null,
}, null, 2));
