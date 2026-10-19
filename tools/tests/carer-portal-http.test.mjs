import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

test('HTTP routes verify identity, carry user credentials, reject forged fields and preserve RPC denial', async () => {
  const user = '11111111-1111-4111-8111-111111111111';
  const caseId = '22222222-2222-4222-8222-222222222222';
  const tenant = '33333333-3333-4333-8333-333333333333';
  const start = '2026-01-01T00:00:00Z';
  const requests = [];
  let rpcDenied = false;
  const uploadId='dddddddd-dddd-4ddd-8ddd-dddddddddddd';
  const png=Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0]);
  const fake = http.createServer(async (req, res) => {
    const chunks = []; for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString();
    const url = new URL(req.url, 'http://local.test');
    const body=raw && req.headers['content-type']?.includes('json') ? JSON.parse(raw) : null;
    requests.push({ path: url.pathname, query: url.searchParams, headers: req.headers, body });
    res.setHeader('Content-Type', 'application/json');
    if (url.pathname === '/auth/v1/user') {
      if (req.headers.authorization === 'Bearer actor-token-fixture') return res.end(JSON.stringify({ id: user, aud: 'authenticated' }));
      res.statusCode = 401; return res.end(JSON.stringify({ message: 'Invalid token' }));
    }
    if(url.pathname.endsWith('/rpc/finalize_carer_media')) {
      if(req.headers.authorization!=='Bearer server-only-key-fixture' || req.headers.apikey!=='server-only-key-fixture') {
        res.statusCode=403;return res.end(JSON.stringify({code:'42501',message:'Verifier identity required'}));
      }
      return res.end(JSON.stringify({id:uploadId,state:'ready'}));
    }
    if (req.headers.authorization !== 'Bearer actor-token-fixture' || req.headers.apikey !== 'publishable-key-fixture') {
      res.statusCode = 403; return res.end(JSON.stringify({ code: '42501', message: 'Incorrect scoped headers' }));
    }
    if(url.pathname.startsWith('/storage/v1/object/') && req.method==='GET') {
      res.setHeader('Content-Type','image/png');return res.end(png);
    }
    if(url.pathname.startsWith('/storage/v1/object/sign/')) {
      return res.end(JSON.stringify({signedURL:'/object/sign/carer-media/fixture?token=test-only'}));
    }
    if (url.pathname.endsWith('/case_participants')) return res.end(JSON.stringify([{ case_id: caseId, tenant_id: tenant, user_id: user,
      participant_role: 'carer', status: 'active', participation_status: 'active', effective_from: start, effective_to: null,
      participation_start_at: start, participation_end_at: null, allowed_actions: ['carer.portal.read','carer.journal.create'], denied_actions: [] }]));
    if (url.pathname.endsWith('/tenant_memberships')) return res.end(JSON.stringify([{ tenant_id: tenant, user_id: user,
      membership_status: 'active', effective_from: start, effective_to: null, suspended_at: null, revoked_at: null }]));
    if (url.pathname.endsWith('/cases')) {
      const row = { id: caseId, tenant_id: tenant, title: 'Assigned operational case', status: 'active' };
      return res.end(JSON.stringify(url.searchParams.has('id') && url.searchParams.get('id').startsWith('eq.') ? row : [row]));
    }
    if (url.pathname.endsWith('/case_notes')) return res.end('[]');
    if(url.pathname.endsWith('/platform_tenants')) return res.end(JSON.stringify([{id:tenant,tenant_status:'active'}]));
    if(url.pathname.endsWith('/rpc/get_carer_assigned_case')) return res.end(JSON.stringify({id:caseId,tenant_id:tenant,title:'Assigned operational case',status:'active'}));
    if(url.pathname.endsWith('/rpc/list_carer_assigned_cases')) return res.end(JSON.stringify([{id:caseId,tenant_id:tenant,title:'Assigned operational case',status:'active'}]));
    if (url.pathname.includes('/rpc/') && !url.pathname.endsWith('/submit_carer_journal')) {
      if (rpcDenied) { res.statusCode=403; return res.end(JSON.stringify({ code:'42501',message:'Private internal review diagnostic' })); }
      const body = raw ? JSON.parse(raw) : {};
      if(url.pathname.endsWith('/get_carer_media_location')) return res.end(JSON.stringify({id:uploadId,bucket:'carer-media',
        path:`${tenant}/${caseId}/${uploadId}/original`,mimeType:'image/png',byteSize:png.length,state:body.p_for_completion?'reserved':'ready'}));
      if(url.pathname.endsWith('/list_carer_media')) return res.end('[]');
      if(url.pathname.endsWith('/reserve_carer_media')) return res.end(JSON.stringify({id:uploadId,bucket:'carer-media',path:`${tenant}/${caseId}/${uploadId}/original`,mimeType:'image/png'}));
      if(url.pathname.endsWith('/list_carer_media_recipients')) return res.end(JSON.stringify([{id:caseId,displayName:'Fixture parent',memberReference:'FM-FIXTURE'}]));
      if (url.pathname.endsWith('/list_carer_message_channels')) return res.end(JSON.stringify([{ id:caseId,operationalCaseId:caseId,
        enabled:false,canManage:true,canSend:false,canReview:false,revoked:false,expiresAt:'2027-01-01T00:00:00Z' }]));
      if (url.pathname.endsWith('/get_carer_channel_messages')) return res.end('[]');
      if (url.pathname.endsWith('/set_carer_channel_enabled')) return res.end(JSON.stringify({ id:body.p_channel_id,enabled:body.p_enabled }));
      return res.end(JSON.stringify({ id:body.p_submission_id || body.p_message_id || caseId,reviewStatus:body.p_decision || 'pending' }));
    }
    if (url.pathname.endsWith('/rpc/submit_carer_journal')) {
      if (rpcDenied) { res.statusCode = 403; return res.end(JSON.stringify({ code: '42501', message: 'Internal database diagnostic' })); }
      const body = JSON.parse(raw); return res.end(JSON.stringify({ id: body.p_submission_id, caseId, status: 'submitted', familyShared: false }));
    }
    res.statusCode = 404; res.end('{}');
  });
  fake.listen(0, '127.0.0.1'); await once(fake, 'listening');
  const envNames = ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_PUBLISHABLE_KEY'];
  const original = Object.fromEntries(envNames.map(name => [name, process.env[name]]));
  process.env.SUPABASE_URL = `http://127.0.0.1:${fake.address().port}`;
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'server-only-key-fixture';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'publishable-key-fixture';
  let app;
  try {
    const { createApp } = require('../../backend/server');
    app = createApp({ port: 0, workerIntervalMs: 3600000 });
    app.server.listen(0, '127.0.0.1'); await once(app.server, 'listening');
    const base = `http://127.0.0.1:${app.server.address().port}`;
    const headers = { Authorization: 'Bearer actor-token-fixture', 'Content-Type': 'application/json' };
    assert.equal((await fetch(`${base}/carers/cases`)).status, 401);
    assert.equal((await fetch(`${base}/carers/cases`, { headers: { Authorization: 'Bearer invalid-fixture' } })).status, 401);
    const cases = await fetch(`${base}/carers/cases`, { headers });
    assert.equal(cases.status, 200); assert.equal(cases.headers.get('cache-control'), 'no-store');
    assert.equal((await cases.json()).cases[0].id, caseId);
    const path = `${base}/carers/cases/${caseId}/journal`;
    assert.equal((await fetch(path, { headers })).status, 200);
    const noteRequest = requests.find(req => req.path.endsWith('/case_notes'));
    assert.equal(noteRequest.query.get('author_user_id'), `eq.${user}`);
    assert.equal(noteRequest.query.get('tenant_id'), `eq.${tenant}`);
    const body = { kind: 'achievement', title: 'Progress', detail: 'Observed achievement', submissionId: '55555555-5555-4555-8555-555555555555' };
    const forged = await fetch(path, { method: 'POST', headers, body: JSON.stringify({ ...body, family_shared: true }) });
    assert.equal(forged.status, 400); assert.equal(requests.filter(r => r.path.endsWith('/rpc/submit_carer_journal')).length, 0);
    const submitted = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
    assert.equal(submitted.status, 201); assert.equal((await submitted.json()).familyShared, false);
    rpcDenied = true;
    const denied = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
    assert.equal(denied.status, 403);
    const error = await denied.json(); assert.equal(error.error.code, 'CARER_PERMISSION_REQUIRED');
    assert.ok(!error.error.message.includes('Internal database'));
    rpcDenied=false;
    const channels=await fetch(`${base}/carers/channels`, { headers });
    assert.equal(channels.status,200); assert.equal((await channels.json()).channels[0].canSend,false);
    const channelPath=`${base}/carers/channels/${caseId}`;
    assert.equal((await fetch(`${channelPath}/messages`,{ headers })).status,200);
    const toggle=await fetch(`${channelPath}/enabled`,{ method:'POST',headers,body:JSON.stringify({enabled:true}) });
    assert.equal(toggle.status,200); assert.equal((await toggle.json()).enabled,true);
    const sent=await fetch(`${channelPath}/messages`,{method:'POST',headers,body:JSON.stringify({text:'Message',submissionId:body.submissionId})});
    assert.equal(sent.status,201); assert.equal((await sent.json()).reviewStatus,'pending');
    const forgedSender=await fetch(`${channelPath}/messages`,{method:'POST',headers,body:JSON.stringify({text:'Message',submissionId:body.submissionId,created_by:user})});
    assert.equal(forgedSender.status,400);
    rpcDenied=true;
    const review=await fetch(`${channelPath}/review`,{method:'POST',headers,body:JSON.stringify({messageId:body.submissionId,decision:'approved',reason:'Reviewed'})});
    assert.equal(review.status,403); assert.ok(!(await review.json()).error.message.includes('Private internal'));
    rpcDenied=false;
    const reserved=await fetch(`${base}/carers/cases/${caseId}/media`,{method:'POST',headers,body:JSON.stringify({
      submissionId:uploadId,fileName:'photo.png',title:'Care photo',description:'Observed context',mimeType:'image/png',byteSize:png.length})});
    assert.equal(reserved.status,201);
    const mediaPath=`${base}/carers/media/${uploadId}`;
    const completed=await fetch(`${mediaPath}/complete`,{method:'POST',headers,body:'{}'});
    assert.equal(completed.status,200);assert.equal((await completed.json()).state,'ready');
    const verifierCall=requests.find(r=>r.path.endsWith('/rpc/finalize_carer_media'));
    assert.equal(verifierCall.body.p_actor_user_id,user);assert.equal(verifierCall.body.p_actual_bytes,png.length);
    assert.equal(verifierCall.headers.apikey,'server-only-key-fixture');
    const forgedHash=await fetch(`${mediaPath}/complete`,{method:'POST',headers,body:JSON.stringify({p_actor_user_id:caseId,sha256:'fake'})});
    assert.equal(forgedHash.status,400);assert.equal(requests.filter(r=>r.path.endsWith('/rpc/finalize_carer_media')).length,1);
    const preview=await fetch(`${mediaPath}/view`,{headers});assert.equal(preview.status,200);
    assert.equal((await preview.json()).mimeType,'image/png');assert.equal(preview.headers.get('cache-control'),'no-store');
    const recipients=await fetch(`${mediaPath}/recipients`,{headers});assert.equal(recipients.status,200);
    const approved=await fetch(`${mediaPath}/review`,{method:'POST',headers,body:JSON.stringify({decision:'approved',parentUserId:caseId,
      expiresAt:new Date(Date.now()+7*86400000).toISOString(),reason:'Reviewed original',originalDisclosureConfirmed:true})});assert.equal(approved.status,200);
    const scoped = requests.filter(r => r.path.startsWith('/rest/') && !r.path.endsWith('/rpc/finalize_carer_media'));
    assert.ok(scoped.length > 0);
    for (const req of scoped) {
      assert.equal(req.headers.authorization, 'Bearer actor-token-fixture');
      assert.equal(req.headers.apikey, 'publishable-key-fixture');
    }
  } finally {
    app?.shutdown();
    fake.closeAllConnections(); await new Promise(resolve => fake.close(resolve));
    for (const name of envNames) original[name] === undefined ? delete process.env[name] : process.env[name] = original[name];
  }
});
