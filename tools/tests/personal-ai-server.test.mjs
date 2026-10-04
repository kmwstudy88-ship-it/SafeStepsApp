import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const serverPath = require.resolve('../../backend/server.js');
const pipelinePath = require.resolve('../../backend/document-intelligence/pipeline.js');
const supabasePath = require.resolve('../../backend/document-intelligence/supabase.js');

async function withLoadedServer(run, authenticateBearer = async () => ({ id: 'authenticated-user' })) {
  const prior = {
    server: require.cache[serverPath],
    pipeline: require.cache[pipelinePath],
    supabase: require.cache[supabasePath],
  };

  delete require.cache[serverPath];
  require.cache[pipelinePath] = {
    id: pipelinePath,
    filename: pipelinePath,
    loaded: true,
    exports: {
      createTextDocument: async () => { throw new Error('not used'); },
      createUploadDocument: async () => { throw new Error('not used'); },
      createComparison: async () => { throw new Error('not used'); },
      processNextJobs: async () => 0,
      getDocumentForUser: async () => null,
      getComparisonForUser: async () => null,
      deleteDocumentForUser: async () => null,
      getAnalysisForUser: async () => null,
    },
  };
  require.cache[supabasePath] = {
    id: supabasePath,
    filename: supabasePath,
    loaded: true,
    exports: { authenticateBearer },
  };

  try {
    await run(require(serverPath));
  } finally {
    delete require.cache[serverPath];
    for (const [key, path] of Object.entries({
      server: serverPath,
      pipeline: pipelinePath,
      supabase: supabasePath,
    })) {
      if (prior[key]) require.cache[path] = prior[key];
      else delete require.cache[path];
    }
  }
}

async function withServer(createApp, run, options = {}) {
  const app = createApp({ port: 0, workerIntervalMs: 60000, ...options });
  await new Promise(resolve => app.server.listen(0, resolve));
  try {
    await run(app.server.address().port);
  } finally {
    await new Promise(resolve => {
      app.server.once('close', resolve);
      app.shutdown();
    });
  }
}

test('Personal AI HTTP routes require authentication and remain disabled without trusted adapters', async () => {
  await withLoadedServer(async ({ createApp }) => {
    await withServer(createApp, async port => {
      const unauthenticated = await fetch(`http://127.0.0.1:${port}/personal-ai/flows`);
      assert.equal(unauthenticated.status, 401);

      const unavailable = await fetch(`http://127.0.0.1:${port}/personal-ai/flows`, {
        headers: { authorization: 'Bearer test-token' },
      });
      assert.equal(unavailable.status, 503);
      assert.deepEqual(await unavailable.json(), {
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Personal AI support is not configured for use.',
        },
      });
    });
  }, async header => header === 'Bearer test-token' ? { id: 'authenticated-user' } : null);
});

test('Personal AI HTTP handlers receive only the authenticated actor identity', async () => {
  const received = [];
  const handlers = {
    async getFlows(input) {
      received.push(['flows', input]);
      return { version: '1.0', product: 'SafeSteps Personal AI Support', flows: [] };
    },
    async classify(input) {
      received.push(['classify', input]);
      return { intent: 'general_support', riskLevel: 'low' };
    },
    async chat(input) {
      received.push(['chat', input]);
      return { assistantMessage: 'A scripted response.' };
    },
  };

  await withLoadedServer(async ({ createApp }) => {
    await withServer(createApp, async port => {
      const headers = { authorization: 'Bearer test-token', 'content-type': 'application/json' };
      const flows = await fetch(`http://127.0.0.1:${port}/personal-ai/flows`, { headers });
      assert.equal(flows.status, 200);

      const body = { message: 'Can you help?', consentToAiSupport: true };
      const classify = await fetch(`http://127.0.0.1:${port}/personal-ai/classify`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      assert.equal(classify.status, 200);

      const chat = await fetch(`http://127.0.0.1:${port}/personal-ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      assert.equal(chat.status, 200);
    }, { personalAiHandlers: handlers });
  }, async header => header === 'Bearer test-token' ? { id: 'authenticated-user' } : null);

  assert.deepEqual(received, [
    ['flows', { userId: 'authenticated-user' }],
    ['classify', {
      userId: 'authenticated-user',
      body: { message: 'Can you help?', consentToAiSupport: true },
    }],
    ['chat', {
      userId: 'authenticated-user',
      body: { message: 'Can you help?', consentToAiSupport: true },
    }],
  ]);
});
