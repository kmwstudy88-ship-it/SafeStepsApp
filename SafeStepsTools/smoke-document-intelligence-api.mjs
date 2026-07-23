import { spawn } from 'node:child_process';

const baseUrl = process.env.EXPO_PUBLIC_SAFESTEPS_API_URL ?? 'http://localhost:3000';
const server = spawn(process.execPath, ['backend/server.js'], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe'],
});

let stderr = '';

server.stderr.on('data', (chunk) => {
  stderr += chunk.toString();
});

try {
  await waitForHealth();
  const schema = await getJson('/documents/intelligence/schema');

  if (schema.schemaVersion !== '2026-07-15' || !Array.isArray(schema.sections) || schema.sections.length < 40) {
    throw new Error(`Unexpected document intelligence schema: ${JSON.stringify(schema)}`);
  }

  const response = await fetch(`${baseUrl}/documents/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: 'Parent attended a review session and brought a service letter.' }),
  });

  if (process.env.OPENAI_KEY || process.env.OPENAI_API_KEY) {
    if (!response.ok) {
      throw new Error(`Expected document analysis to run, received ${response.status}: ${await response.text()}`);
    }
  } else {
    const body = await response.text();

    if (response.status !== 503 || !body.includes('Set OPENAI_KEY or OPENAI_API_KEY')) {
      throw new Error(`Expected configured no-key 503, received ${response.status}: ${body}`);
    }
  }

  console.log(`Document intelligence API smoke passed (${response.status}).`);
} finally {
  server.kill();
}

async function getJson(path) {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`Expected ${path} to return 200, received ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

async function waitForHealth() {
  const deadline = Date.now() + 10_000;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Backend exited early.\n${stderr}`);
    }

    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      await sleep(250);
    }
  }

  throw new Error(`Backend health check timed out.\n${stderr}`);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
