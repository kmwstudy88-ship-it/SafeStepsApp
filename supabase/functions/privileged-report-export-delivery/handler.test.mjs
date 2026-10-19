import assert from "node:assert/strict";
import test from "node:test";

import { handlePrivilegedReportExportDelivery } from "./handler.mjs";

const user = { id: "11111111-1111-4111-8111-111111111111" };
const ids = {
  tenant: "22222222-2222-4222-8222-222222222222",
  case: "33333333-3333-4333-8333-333333333333",
  release: "44444444-4444-4444-8444-444444444444",
  recipient: "55555555-5555-4555-8555-555555555555",
  report: "66666666-6666-4666-8666-666666666666",
  export: "77777777-7777-4777-8777-777777777777",
};
const sourceExport = {
  id: ids.export,
  case_id: ids.case,
  release_event_id: ids.release,
  report_id: ids.report,
  report_version: 3,
  recipient_id: ids.recipient,
  rendered_file_id: "file-1",
  authority: "court order",
  purpose: "court filing",
  request_reference: "request-1",
  action: "signed_url_requested",
  outcome: "allowed",
};

function request(body, method = "POST", origin = "https://app.test") {
  return new Request("https://edge.test/privileged-report-export-delivery", {
    method,
    headers: {
      origin,
      authorization: "Bearer token",
      "content-type": "application/json",
    },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
}

function createHarness(overrides = {}) {
  const calls = [];
  const userClient = {
    async rpc(name, args) {
      calls.push(["rpc", name, args]);
      return overrides.rpcResult ?? { data: ids.export, error: null };
    },
  };
  const adminClient = {
    from(table) {
      calls.push(["from", table]);
      const query = {
        select(columns) { calls.push(["select", columns]); return this; },
        eq(column, value) { calls.push(["eq", column, value]); return this; },
        async single() {
          calls.push(["single"]);
          return {
            data: Object.hasOwn(overrides, "source") ? overrides.source : sourceExport,
            error: overrides.sourceError ?? null,
          };
        },
        async insert(row) {
          calls.push(["insert", table, row]);
          return { error: overrides.insertError ?? null };
        },
      };
      return query;
    },
  };
  const dependencies = {
    assertCaseRole: async (client, caseId, roles) => {
      calls.push(["assertCaseRole", client, caseId, roles]);
      if (overrides.roleError) throw overrides.roleError;
    },
    assertCaseTenant: async (client, caseId, tenantId) => {
      calls.push(["assertCaseTenant", client, caseId, tenantId]);
      if (overrides.tenantError) throw overrides.tenantError;
    },
    authenticate: async () => {
      calls.push(["authenticate"]);
      if (overrides.authError) throw overrides.authError;
      return { user: overrides.user ?? user, userClient, adminClient };
    },
    corsHeaders: (req) => {
      calls.push(["corsHeaders", req.headers.get("origin")]);
      return req.headers.get("origin") === "https://blocked.test" ? null : { "Access-Control-Allow-Origin": "https://app.test" };
    },
    errorResponse: (error, cors) => {
      calls.push(["errorResponse", error.message]);
      return new Response(JSON.stringify({ error: error.message }), { status: error.status ?? 400, headers: cors });
    },
    findIdempotentAudit: async (client, value) => {
      calls.push(["findIdempotentAudit", value]);
      return overrides.existingAudit ?? null;
    },
    methodGuard: (req) => {
      calls.push(["methodGuard", req.method]);
      if (req.method === "OPTIONS") return new Response("ok", { status: 200 });
      if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
      return null;
    },
    optionalBoolean: (body, key, fallback) => {
      calls.push(["optionalBoolean", key, body[key]]);
      const value = body[key];
      if (value === undefined || value === null) return fallback;
      if (typeof value !== "boolean") throw new Error(`${key} must be boolean`);
      return value;
    },
    optionalInteger: (body, key, fallback, min, max) => {
      calls.push(["optionalInteger", key, body[key]]);
      const value = body[key] == null ? fallback : Number(body[key]);
      if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${key} is out of range`);
      return value;
    },
    parseBody: (body) => {
      if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Request body must be a JSON object");
      return body;
    },
    requiredEnum: (body, key, allowed) => {
      const value = body[key];
      if (typeof value !== "string" || !allowed.includes(value)) throw new Error(`${key} is invalid`);
      return value;
    },
    requiredString: (body, key, maxLength) => {
      const value = body[key];
      if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) throw new Error(`${key} is invalid`);
      return value.trim();
    },
    requiredUuid: (body, key) => {
      const value = body[key];
      if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
        throw new Error(`${key} is invalid`);
      }
      return value;
    },
    response: (payload, status, headers = {}) => new Response(JSON.stringify(payload), {
      status,
      headers: { ...headers, "Content-Type": "application/json" },
    }),
    writeAudit: async (client, audit) => {
      calls.push(["writeAudit", audit]);
      if (overrides.auditError) throw overrides.auditError;
      return { id: "audit-1" };
    },
  };
  return {
    calls,
    userClient,
    adminClient,
    handle: (req) => handlePrivilegedReportExportDelivery(req, dependencies),
  };
}

const requestExport = {
  action: "request_export",
  tenantId: ids.tenant,
  caseId: ids.case,
  releaseEventId: ids.release,
  recipientId: ids.recipient,
  authority: "court order",
  purpose: "court filing",
  expirySeconds: 300,
  idempotencyKey: "export-request-1",
};

test("request_export checks case role and tenant before scoped RPC approval and audit", async () => {
  const harness = createHarness();
  const response = await harness.handle(request(requestExport));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, exportEventId: ids.export, auditId: "audit-1" });
  assert.deepEqual(harness.calls.filter((call) => ["assertCaseRole", "assertCaseTenant", "findIdempotentAudit", "rpc", "writeAudit"].includes(call[0])).map((call) => call[0]), [
    "assertCaseRole", "assertCaseTenant", "findIdempotentAudit", "rpc", "writeAudit",
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "assertCaseRole").slice(2), [
    ids.case, ["caseworker", "supervisor", "admin", "court_viewer"],
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "rpc").slice(1), [
    "request_case_report_export",
    {
      p_case_id: ids.case,
      p_release_event_id: ids.release,
      p_recipient_id: ids.recipient,
      p_authority: "court order",
      p_purpose: "court filing",
      p_expiry_seconds: 300,
    },
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "writeAudit")[1], {
    caseId: ids.case,
    actorUserId: user.id,
    action: "report_export.request_export",
    resourceType: "report_export",
    resourceId: ids.export,
    details: { idempotency_key: "export-request-1" },
  });
});

test("request_correction uses the narrower role set and audits the correction identifier", async () => {
  const correctionId = "88888888-8888-4888-8888-888888888888";
  const harness = createHarness({ rpcResult: { data: correctionId, error: null } });
  const response = await harness.handle(request({
    action: "request_correction",
    tenantId: ids.tenant,
    caseId: ids.case,
    reportId: ids.report,
    correctionType: "factual_error",
    description: "Correct the date",
    idempotencyKey: "correction-1",
  }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, correctionId, auditId: "audit-1" });
  assert.deepEqual(harness.calls.find((call) => call[0] === "assertCaseRole").slice(2), [
    ids.case, ["caseworker", "supervisor", "admin"],
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "rpc").slice(1), [
    "request_case_report_correction",
    {
      p_case_id: ids.case,
      p_report_id: ids.report,
      p_correction_type: "factual_error",
      p_description: "Correct the date",
      p_material_change: false,
    },
  ]);
  assert.equal(harness.calls.find((call) => call[0] === "writeAudit")[1].details.correction_id, correctionId);
});

test("prepare_delivery is supervisor-only and returns challenge only after auditing", async () => {
  const challenge = {
    challenge_id: "99999999-9999-4999-8999-999999999999",
    delivery_token: "a".repeat(48),
    verification_code: "123456",
    expires_at: "2026-10-10T01:00:00Z",
  };
  const harness = createHarness({ rpcResult: { data: [challenge], error: null } });
  const response = await harness.handle(request({
    action: "prepare_delivery",
    tenantId: ids.tenant,
    caseId: ids.case,
    releaseEventId: ids.release,
    recipientId: ids.recipient,
    expiresMinutes: 120,
    maxDownloads: 3,
    idempotencyKey: "delivery-1",
  }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ok: true,
    challengeId: challenge.challenge_id,
    deliveryToken: challenge.delivery_token,
    verificationCode: challenge.verification_code,
    expiresAt: challenge.expires_at,
    auditId: "audit-1",
  });
  assert.deepEqual(harness.calls.find((call) => call[0] === "assertCaseRole").slice(2), [
    ids.case, ["supervisor", "admin"],
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "rpc").slice(1), [
    "prepare_case_report_delivery",
    {
      p_case_id: ids.case,
      p_release_event_id: ids.release,
      p_recipient_id: ids.recipient,
      p_expires_minutes: 120,
      p_max_downloads: 3,
    },
  ]);
});

test("prepare_delivery rejects incomplete or malformed challenge data without auditing success", async () => {
  const validChallenge = {
    challenge_id: "99999999-9999-4999-8999-999999999999",
    delivery_token: "a".repeat(48),
    verification_code: "000123",
    expires_at: "2026-10-10T01:00:00Z",
  };
  const invalidChallenges = [
    null,
    {},
    { ...validChallenge, challenge_id: "not-a-uuid" },
    { ...validChallenge, delivery_token: "short" },
    { ...validChallenge, verification_code: "12345" },
    { ...validChallenge, expires_at: "not-a-date" },
  ];
  for (const challenge of invalidChallenges) {
    const harness = createHarness({ rpcResult: { data: [challenge], error: null } });
    const response = await harness.handle(request({
      action: "prepare_delivery",
      tenantId: ids.tenant,
      caseId: ids.case,
      releaseEventId: ids.release,
      recipientId: ids.recipient,
      idempotencyKey: "malformed-challenge",
    }));
    assert.equal(response.status, 400);
    assert.equal(harness.calls.some((call) => call[0] === "writeAudit"), false);
  }
});

test("delivery RPC and audit failures never return challenge credentials as success", async () => {
  const body = {
    action: "prepare_delivery",
    tenantId: ids.tenant,
    caseId: ids.case,
    releaseEventId: ids.release,
    recipientId: ids.recipient,
    idempotencyKey: "delivery-failure",
  };
  const rpcFailure = createHarness({ rpcResult: { data: null, error: new Error("RPC failed") } });
  let response = await rpcFailure.handle(request(body));
  assert.equal(response.status, 400);
  assert.equal(rpcFailure.calls.some((call) => call[0] === "writeAudit"), false);

  const auditFailure = createHarness({
    rpcResult: {
      data: [{
        challenge_id: "99999999-9999-4999-8999-999999999999",
        delivery_token: "a".repeat(48),
        verification_code: "000123",
        expires_at: "2026-10-10T01:00:00Z",
      }],
      error: null,
    },
    auditError: new Error("Audit unavailable"),
  });
  response = await auditFailure.handle(request(body));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Audit unavailable" });
  assert.equal(auditFailure.calls.some((call) => call[0] === "writeAudit"), true);
});

test("all mutating actions replay the matching actor-scoped idempotent audit without repeating RPCs", async () => {
  const cases = [
    [requestExport, "report_export.request_export", "report_export", ids.release, ids.case],
    [{
      action: "request_correction",
      tenantId: ids.tenant,
      caseId: ids.case,
      reportId: ids.report,
      correctionType: "factual_error",
      description: "Correct this",
      idempotencyKey: "same-key",
    }, "report_export.request_correction", "report", ids.report, ids.case],
    [{
      action: "prepare_delivery",
      tenantId: ids.tenant,
      caseId: ids.case,
      releaseEventId: ids.release,
      recipientId: ids.recipient,
      idempotencyKey: "same-key",
    }, "report_export.prepare_delivery", "report_release", ids.release, ids.case],
    [{
      action: "confirm_export",
      exportEventId: ids.export,
      idempotencyKey: "same-key",
    }, "report_export.confirm_export", "report_export", ids.export, null],
  ];
  for (const [body, action, resourceType, resourceId, caseId] of cases) {
    const harness = createHarness({ existingAudit: { id: "prior-audit" } });
    const response = await harness.handle(request({ ...body, idempotencyKey: "same-key" }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, idempotent: true, auditId: "prior-audit" });
    assert.deepEqual(harness.calls.find((call) => call[0] === "findIdempotentAudit")[1], {
      idempotencyKey: "same-key",
      actorUserId: user.id,
      action,
      resourceType,
      resourceId,
      caseId,
    });
    assert.equal(harness.calls.some((call) => call[0] === "rpc"), false);
    assert.equal(harness.calls.some((call) => call[0] === "insert"), false);
    assert.equal(harness.calls.some((call) => call[0] === "writeAudit"), false);
  }
});

test("case authorization failures stop request/correction/delivery actions before RPC or audit", async () => {
  const actions = [
    [requestExport, ["caseworker", "supervisor", "admin", "court_viewer"]],
    [{
      action: "request_correction",
      tenantId: ids.tenant,
      caseId: ids.case,
      reportId: ids.report,
      correctionType: "factual_error",
      description: "Correct this",
      idempotencyKey: "correction-2",
    }, ["caseworker", "supervisor", "admin"]],
    [{
      action: "prepare_delivery",
      tenantId: ids.tenant,
      caseId: ids.case,
      releaseEventId: ids.release,
      recipientId: ids.recipient,
      idempotencyKey: "delivery-2",
    }, ["supervisor", "admin"]],
  ];
  for (const [body, expectedRoles] of actions) {
    const harness = createHarness({ roleError: Object.assign(new Error("Case access denied"), { status: 403 }) });
    const response = await harness.handle(request(body));
    assert.equal(response.status, 403);
    assert.deepEqual(harness.calls.find((call) => call[0] === "assertCaseRole").at(-1), expectedRoles);
    assert.equal(harness.calls.some((call) => call[0] === "rpc"), false);
    assert.equal(harness.calls.some((call) => call[0] === "writeAudit"), false);
  }
});

test("confirm_export is actor-scoped and rejects records that were not allowed signed-url requests", async () => {
  const body = { action: "confirm_export", exportEventId: ids.export, idempotencyKey: "confirm-1" };
  const allowed = createHarness();
  let response = await allowed.handle(request(body));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, confirmed: true, auditId: "audit-1" });
  assert.deepEqual(allowed.calls.filter((call) => call[0] === "eq"), [
    ["eq", "id", ids.export],
    ["eq", "requested_by", user.id],
  ]);
  assert.equal(allowed.calls.find((call) => call[0] === "select")[1].includes("action, outcome"), true);
  assert.deepEqual(allowed.calls.find((call) => call[0] === "insert")[2], {
    case_id: ids.case,
    release_event_id: ids.release,
    report_id: ids.report,
    report_version: 3,
    recipient_id: ids.recipient,
    rendered_file_id: "file-1",
    requested_by: user.id,
    authority: "court order",
    purpose: "court filing",
    action: "download_confirmed",
    outcome: "completed",
    request_reference: "request-1",
  });

  for (const source of [
    { ...sourceExport, action: "download_confirmed" },
    { ...sourceExport, outcome: "denied" },
  ]) {
    const harness = createHarness({ source });
    response = await harness.handle(request(body));
    assert.equal(response.status, 400);
    assert.equal(harness.calls.some((call) => call[0] === "insert"), false);
    assert.equal(harness.calls.some((call) => call[0] === "writeAudit"), false);
  }
  const missing = createHarness({ source: null });
  response = await missing.handle(request(body));
  assert.equal(response.status, 404);
  assert.equal(missing.calls.some((call) => call[0] === "insert"), false);
  assert.equal(missing.calls.some((call) => call[0] === "writeAudit"), false);

  const insertFailure = createHarness({ insertError: new Error("Insert failed") });
  response = await insertFailure.handle(request(body));
  assert.equal(response.status, 400);
  assert.equal(insertFailure.calls.some((call) => call[0] === "writeAudit"), false);
});

test("invalid action inputs and failed RPCs do not write successful audit events", async () => {
  const invalidBodies = [
    { ...requestExport, action: "unknown" },
    { ...requestExport, tenantId: "not-a-uuid" },
    { ...requestExport, authority: "" },
    { ...requestExport, expirySeconds: 601 },
    {
      action: "prepare_delivery",
      tenantId: ids.tenant,
      caseId: ids.case,
      releaseEventId: ids.release,
      recipientId: ids.recipient,
      expiresMinutes: 1441,
      idempotencyKey: "invalid-expiry",
    },
  ];
  for (const body of invalidBodies) {
    const harness = createHarness();
    const response = await harness.handle(request(body));
    assert.equal(response.status, 400);
    assert.equal(harness.calls.some((call) => call[0] === "rpc"), false);
    assert.equal(harness.calls.some((call) => call[0] === "writeAudit"), false);
  }

  for (const body of [requestExport, {
    action: "request_correction",
    tenantId: ids.tenant,
    caseId: ids.case,
    reportId: ids.report,
    correctionType: "factual_error",
    description: "Correct this",
    idempotencyKey: "correction-error",
  }]) {
    const harness = createHarness({ rpcResult: { data: null, error: new Error("RPC failed") } });
    const response = await harness.handle(request(body));
    assert.equal(response.status, 400);
    assert.equal(harness.calls.some((call) => call[0] === "writeAudit"), false);
  }
});

test("origin, method and preflight guards run before authentication", async () => {
  for (const [method, origin, status] of [
    ["POST", "https://blocked.test", 403],
    ["GET", "https://app.test", 405],
    ["OPTIONS", "https://app.test", 200],
  ]) {
    const harness = createHarness();
    const response = await harness.handle(request(requestExport, method, origin));
    assert.equal(response.status, status);
    assert.equal(harness.calls.some((call) => call[0] === "authenticate"), false);
  }
});
