import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const serverPath = require.resolve('../../backend/server.js');
const pipelinePath = require.resolve('../../backend/document-intelligence/pipeline.js');
const supabasePath = require.resolve('../../backend/document-intelligence/supabase.js');

async function withLoadedServer(run, authenticateBearer = async (header) => (header ? { id: 'authenticated-user-123' } : null)) {
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
    const { createApp } = require('../../backend/server.js');
    await run(createApp);
  } finally {
    for (const [key, value] of Object.entries(prior)) {
      const targetPath = key === 'server' ? serverPath : key === 'pipeline' ? pipelinePath : supabasePath;
      if (value) require.cache[targetPath] = value;
      else delete require.cache[targetPath];
    }
  }
}

function mockFetch(port, path, options = {}) {
  const url = `http://127.0.0.1:${port}${path}`;
  return fetch(url, options);
}

test('curriculum routes require authentication and generate modules', async (t) => {
  await withLoadedServer(async (createApp) => {
    const { server, shutdown } = createApp({ port: 3091 });
    await new Promise((resolve) => server.listen(3091, resolve));
    t.after(() => shutdown());

    // 1. Unauthenticated request rejected
    const unauthRes = await mockFetch(3091, '/curriculum/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childAge: 8, riskLevel: 'medium', goals: ['emotional-regulation'] }),
    });
    assert.equal(unauthRes.status, 401);

    // 2. Authenticated request with token
    const authRes = await mockFetch(3091, '/curriculum/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-user-token',
      },
      body: JSON.stringify({
        childAge: 8,
        riskLevel: 'medium',
        goals: ['emotional-regulation', 'confidence-building'],
      }),
    });

    assert.equal(authRes.status, 200);
    const data = await authRes.json();
    assert.ok(Array.isArray(data.modules));
    assert.ok(data.modules.length >= 3); // Base + Safety Planning + Goals
    assert.equal(data.decisionSupportOnly, true);
    assert.equal(data.humanReviewRequired, true);
  });
});

test('telehealth routes support appointment lifecycle, waiting rooms, and recording policy', async (t) => {
  await withLoadedServer(async (createApp) => {
    const { server, shutdown } = createApp({ port: 3092 });
    await new Promise((resolve) => server.listen(3092, resolve));
    t.after(() => shutdown());

    const authHeader = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-user-token',
    };

    // 1. Create appointment
    const createRes = await mockFetch(3092, '/api/v1/telehealth/appointments', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        caseId: 'case-999',
        notes: 'Supervised parent-child telehealth session',
        participants: [{ id: 'p-1', role: 'parent' }],
      }),
    });
    assert.equal(createRes.status, 201);
    const createdAppt = await createRes.json();
    assert.ok(createdAppt.id);
    assert.equal(createdAppt.status, 'scheduled');

    // 2. List appointments
    const listRes = await mockFetch(3092, '/api/v1/telehealth/appointments', {
      method: 'GET',
      headers: authHeader,
    });
    assert.equal(listRes.status, 200);
    const list = await listRes.json();
    assert.ok(list.some((a) => a.id === createdAppt.id));

    // 3. Confirm appointment
    const confirmRes = await mockFetch(3092, `/api/v1/telehealth/appointments/${createdAppt.id}/confirm`, {
      method: 'POST',
      headers: authHeader,
    });
    assert.equal(confirmRes.status, 200);
    const confirmed = await confirmRes.json();
    assert.equal(confirmed.status, 'confirmed');

    // 4. Create video session
    const sessionRes = await mockFetch(3092, `/api/v1/telehealth/appointments/${createdAppt.id}/session`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ roomName: 'test-room-1' }),
    });
    assert.equal(sessionRes.status, 201);
    const session = await sessionRes.json();
    assert.ok(session.id);
    assert.equal(session.appointmentId, createdAppt.id);

    // 5. Join waiting room
    const waitRes = await mockFetch(3092, `/api/v1/telehealth/sessions/${session.id}/waiting-room`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ participantId: 'parent-123' }),
    });
    assert.equal(waitRes.status, 200);
    const waitEntry = await waitRes.json();
    assert.equal(waitEntry.status, 'waiting');

    // 6. Record attendance
    const attRes = await mockFetch(3092, `/api/v1/telehealth/sessions/${session.id}/attendance?participantId=parent-123`, {
      method: 'GET',
      headers: authHeader,
    });
    assert.equal(attRes.status, 200);
    const att = await attRes.json();
    assert.equal(att.present, true);

    // 7. Session note
    const noteRes = await mockFetch(3092, `/api/v1/telehealth/sessions/${session.id}/notes`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ noteText: 'Parent engaged in calm and supportive conversation.' }),
    });
    assert.equal(noteRes.status, 201);
    const note = await noteRes.json();
    assert.equal(note.humanReviewRequired, true);

    // 8. Recording policy check
    const recRes = await mockFetch(3092, '/api/v1/telehealth/recording-policy', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ recordingRequested: true }),
    });
    assert.equal(recRes.status, 200);
    const policy = await recRes.json();
    assert.equal(policy.allowed, false);
  });
});
