import { spawn } from 'node:child_process';
import crypto from 'node:crypto';

const baseUrl = 'http://localhost:3000';
const caseId = crypto.randomUUID();

const server = spawn(process.execPath, ['backend/server.js'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    SAFESTEPS_ALLOW_UNAUTHENTICATED_LOCAL_API: 'true',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let stderr = '';
server.stderr.on('data', (chunk) => {
  stderr += chunk.toString();
});

try {
  await waitForHealth();

  const schema = await getJson('/documents/intelligence/schema');
  if (!Array.isArray(schema.sections) || schema.sections.length < 48) {
    throw new Error(`Expected >=48 document sections, got ${schema.sections?.length}`);
  }

  const upload = await postJson('/documents/upload', {
    caseId,
    fileName: 'smoke-note.txt',
    mimeType: 'text/plain',
    text: 'Parent missed one visit and then provided a service-provider progress note. Staff reported aggressive language.',
  });

  if (!upload.documentId) {
    throw new Error(`Upload response missing documentId: ${JSON.stringify(upload)}`);
  }

  const processed = await postJson('/documents/process', {
    caseId,
    documentId: upload.documentId,
  });

  if (!processed.analysisId || !processed.riskAssessmentId) {
    throw new Error(`Processing response missing IDs: ${JSON.stringify(processed)}`);
  }

  const analysis = await getJson(`/analyses/${processed.analysisId}`);
  if (!Array.isArray(analysis.sectionResults) || analysis.sectionResults.length < 48) {
    throw new Error(`Analysis response missing section results: ${JSON.stringify(analysis)}`);
  }

  const compare = await postJson('/analyses/compare', {
    analysisIds: [processed.analysisId],
    texts: ['A second comparison note with different language and lower risk indicators.'],
  });

  if (compare.comparedCount < 2) {
    throw new Error(`Expected compare endpoint to process two analyses: ${JSON.stringify(compare)}`);
  }

  const risk = await postJson('/risk-assessment/compute', {
    caseId,
    analysisId: processed.analysisId,
  });

  if (typeof risk.riskScore !== 'number' || !risk.riskLevel) {
    throw new Error(`Risk endpoint returned unexpected payload: ${JSON.stringify(risk)}`);
  }

  const analyzeResponse = await fetch(`${baseUrl}/documents/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'quick check' }),
  });

  if (!process.env.OPENAI_API_KEY && !process.env.OPENAI_KEY && analyzeResponse.status !== 503) {
    throw new Error(`Expected /documents/analyze 503 without OpenAI key, got ${analyzeResponse.status}`);
  }

  console.log('Backend pipeline smoke passed.');
} finally {
  server.kill();
}

async function getJson(path) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status} ${body}`);
  }
  return body ? JSON.parse(body) : null;
}

async function postJson(path, payload) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`POST ${path} failed: ${response.status} ${body}`);
  }
  return body ? JSON.parse(body) : null;
}

async function waitForHealth() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Backend exited early.\n${stderr}`);
    }
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // ignore and retry
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Backend health check timed out.\n${stderr}`);
}
