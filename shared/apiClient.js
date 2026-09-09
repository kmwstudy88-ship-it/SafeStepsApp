const DEFAULT_API_URL = process.env.EXPO_PUBLIC_SAFESTEPS_API_URL || process.env.SAFESTEPS_API_URL || "http://localhost:3000";

function buildUrl(pathname) {
  return new URL(pathname, DEFAULT_API_URL).toString();
}

async function requestJson(pathname, options = {}) {
  const response = await fetch(buildUrl(pathname), {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(body?.error?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

function getDocumentSchema() {
  return requestJson("/documents/intelligence/schema");
}

function analyzeDocument(text) {
  return requestJson("/documents/analyze", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

function analyzeDocumentFairness(text) {
  return requestJson("/documents/analyze/fairness", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

module.exports = {
  DEFAULT_API_URL,
  getDocumentSchema,
  analyzeDocument,
  analyzeDocumentFairness,
};
