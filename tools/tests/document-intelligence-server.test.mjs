import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const serverPath = require.resolve('../../backend/server.js');
const pipelinePath = require.resolve('../../backend/document-intelligence/pipeline.js');
const supabasePath = require.resolve('../../backend/document-intelligence/supabase.js');

function cloneCacheEntry(entry) {
  return entry ? { ...entry } : undefined;
}

async function withEnv(overrides, run) {
  const previous = {};
  for (const [key, value] of Object.entries(overrides)) {
    previous[key] = process.env[key];
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  try {
    return await run();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
}

async function withLoadedServer(run) {
  const previousServer = cloneCacheEntry(require.cache[serverPath]);
  const previousPipeline = cloneCacheEntry(require.cache[pipelinePath]);
  const previousSupabase = cloneCacheEntry(require.cache[supabasePath]);

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
    },
  };
  require.cache[supabasePath] = {
    id: supabasePath,
    filename: supabasePath,
    loaded: true,
    exports: { authenticateBearer: async () => null },
  };

  try {
    return await run(require(serverPath));
  } finally {
    delete require.cache[serverPath];
    if (previousServer) require.cache[serverPath] = previousServer;
    else delete require.cache[serverPath];

    if (previousPipeline) require.cache[pipelinePath] = previousPipeline;
    else delete require.cache[pipelinePath];

    if (previousSupabase) require.cache[supabasePath] = previousSupabase;
    else delete require.cache[supabasePath];
  }
}

async function withRunningServer(createApp, run) {
  const app = createApp({ port: 0, workerIntervalMs: 60000 });
  await new Promise((resolve) => app.server.listen(0, resolve));
  try {
    return await run(app.server.address().port);
  } finally {
    await new Promise((resolve) => {
      app.server.once('close', resolve);
      app.shutdown();
    });
  }
}

test('GET /ready returns 200 when default OpenAI readiness requirements are present', async () => {
  await withEnv({
    DOCUMENT_AI_PROVIDER: undefined,
    SUPABASE_URL: undefined,
    EXPO_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    OPENAI_API_KEY: 'openai-key',
    ANTHROPIC_API_KEY: undefined,
  }, async () => {
    await withLoadedServer(async ({ createApp }) => {
      await withRunningServer(createApp, async (port) => {
        const response = await fetch(`http://127.0.0.1:${port}/ready`);
        const body = await response.json();

        assert.equal(response.status, 200);
        assert.equal(body.ready, true);
        assert.equal(body.provider, 'openai');
        assert.deepEqual(body.checks, {
          supabaseUrl: true,
          supabaseServiceRole: true,
          providerKey: true,
        });
        assert.equal(body.documentIntelligence, true);
        assert.match(body.timestamp, /^\d{4}-\d{2}-\d{2}T/);
      });
    });
  });
});

test('GET /ready returns 503 when anthropic is selected without its provider key', async () => {
  await withEnv({
    DOCUMENT_AI_PROVIDER: 'AnThRoPiC',
    SUPABASE_URL: 'https://project.supabase.co',
    EXPO_PUBLIC_SUPABASE_URL: undefined,
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    OPENAI_API_KEY: 'openai-key',
    ANTHROPIC_API_KEY: undefined,
  }, async () => {
    await withLoadedServer(async ({ createApp }) => {
      await withRunningServer(createApp, async (port) => {
        const response = await fetch(`http://127.0.0.1:${port}/ready`);
        const body = await response.json();

        assert.equal(response.status, 503);
        assert.equal(body.ready, false);
        assert.equal(body.provider, 'anthropic');
        assert.deepEqual(body.checks, {
          supabaseUrl: true,
          supabaseServiceRole: true,
          providerKey: false,
        });
      });
    });
  });
});

test('GET /ready fails closed when Supabase URL is missing from both server and Expo env vars', async () => {
  await withEnv({
    DOCUMENT_AI_PROVIDER: undefined,
    SUPABASE_URL: undefined,
    EXPO_PUBLIC_SUPABASE_URL: undefined,
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    OPENAI_API_KEY: 'openai-key',
    ANTHROPIC_API_KEY: undefined,
  }, async () => {
    await withLoadedServer(async ({ createApp }) => {
      await withRunningServer(createApp, async (port) => {
        const response = await fetch(`http://127.0.0.1:${port}/ready`);
        const body = await response.json();

        assert.equal(response.status, 503);
        assert.equal(body.ready, false);
        assert.equal(body.provider, 'openai');
        assert.deepEqual(body.checks, {
          supabaseUrl: false,
          supabaseServiceRole: true,
          providerKey: true,
        });
      });
    });
  });
});

test('GET /ready defaults unknown provider values to openai credential checks', async () => {
  await withEnv({
    DOCUMENT_AI_PROVIDER: 'azure-openai',
    SUPABASE_URL: 'https://project.supabase.co',
    EXPO_PUBLIC_SUPABASE_URL: undefined,
    SUPABASE_SERVICE_ROLE_KEY: 'service-role',
    OPENAI_API_KEY: undefined,
    ANTHROPIC_API_KEY: 'anthropic-key',
  }, async () => {
    await withLoadedServer(async ({ createApp }) => {
      await withRunningServer(createApp, async (port) => {
        const response = await fetch(`http://127.0.0.1:${port}/ready`);
        const body = await response.json();

        assert.equal(response.status, 503);
        assert.equal(body.ready, false);
        assert.equal(body.provider, 'openai');
        assert.deepEqual(body.checks, {
          supabaseUrl: true,
          supabaseServiceRole: true,
          providerKey: false,
        });
      });
    });
  });
});
