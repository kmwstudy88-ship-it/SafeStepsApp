const DEFAULT_API_URL =
  process.env.EXPO_PUBLIC_SAFESTEPS_API_URL || process.env.SAFESTEPS_API_URL || 'http://localhost:3000';

function buildUrl(pathname) {
  return new URL(pathname, DEFAULT_API_URL).toString();
}

async function requestJson(pathname, options = {}) {
  const response = await fetch(buildUrl(pathname), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let body = null;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!response.ok) {
    const error = new Error(body?.error?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

function getDocumentSchema() {
  return requestJson('/documents/intelligence/schema');
}

function analyzeDocument(text) {
  return requestJson('/documents/analyze', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

function analyzeDocumentFairness(text) {
  return requestJson('/documents/analyze/fairness', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

function uploadDocument(payload) {
  return requestJson('/documents/upload', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function processDocument(payload) {
  return requestJson('/documents/process', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function getAnalysis(id) {
  return requestJson(`/analyses/${encodeURIComponent(id)}`);
}

function compareAnalyses(payload) {
  return requestJson('/analyses/compare', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function computeRiskAssessment(payload) {
  return requestJson('/risk-assessment/compute', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

module.exports = {
  DEFAULT_API_URL,
  buildUrl,
  getDocumentSchema,
  analyzeDocument,
  analyzeDocumentFairness,
  uploadDocument,
  processDocument,
  getAnalysis,
  compareAnalyses,
  computeRiskAssessment,
};
