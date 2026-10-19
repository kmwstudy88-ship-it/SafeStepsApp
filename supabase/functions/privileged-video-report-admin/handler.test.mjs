import assert from "node:assert/strict";
import test from "node:test";

import { handlePrivilegedVideoReportAdmin } from "./handler.mjs";

const user = { id: "11111111-1111-4111-8111-111111111111" };
const ids = {
  tenant: "22222222-2222-4222-8222-222222222222",
  case: "33333333-3333-4333-8333-333333333333",
  report: "44444444-4444-4444-8444-444444444444",
  version: "55555555-5555-4555-8555-555555555555",
  file: "66666666-6666-4666-8666-666666666666",
  delivery: "77777777-7777-4777-8777-777777777777",
  operation: "88888888-8888-4888-8888-888888888888",
};

const decisionBody = {
  action: "decide_report_version",
  tenantId: ids.tenant,
  caseId: ids.case,
  reportId: ids.report,
  reportVersionId: ids.version,
  decision: "approved",
  decisionReason: "Reviewed independently",
  idempotencyKey: "decision-1",
};

function request(body, method = "POST", origin = "https://app.test") {
  return new Request("https://edge.test/privileged-video-report-admin", {
    method,
    headers: { origin, authorization: "Bearer token", "content-type": "application/json" },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
}

function createHarness(overrides = {}) {
  const calls = [];
  const userClient = {
    async rpc(name, args) {
      calls.push(["rpc", name, args]);
      return overrides.rpcResult ?? { data: ids.operation, error: null };
    },
  };
  const adminClient = { id: "admin-client" };
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
    optionalString: (body, key, maxLength) => {
      calls.push(["optionalString", key, body[key]]);
      const value = body[key];
      if (value === undefined || value === null) return null;
      if (typeof value !== "string" || value.length > maxLength) throw new Error(`${key} is invalid`);
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
    handle: (req) => handlePrivilegedVideoReportAdmin(req, dependencies),
  };
}

test("report decisions enforce supervisor role and tenant before invoking the decision RPC and audit", async () => {
  const harness = createHarness();
  const response = await harness.handle(request(decisionBody));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, approvalId: ids.operation, auditId: "audit-1" });
  assert.deepEqual(harness.calls.filter((call) => [
    "assertCaseRole", "assertCaseTenant", "findIdempotentAudit", "rpc", "writeAudit",
  ].includes(call[0])).map((call) => call[0]), [
    "assertCaseRole", "assertCaseTenant", "findIdempotentAudit", "rpc", "writeAudit",
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "assertCaseRole").slice(2), [
    ids.case, ["supervisor", "admin"],
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "rpc").slice(1), [
    "decide_case_report_version",
    {
      p_case_id: ids.case,
      p_report_id: ids.report,
      p_report_version_id: ids.version,
      p_decision: "approved",
      p_decision_reason: "Reviewed independently",
    },
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "writeAudit")[1], {
    caseId: ids.case,
    actorUserId: user.id,
    action: "video_report_admin.decide_report_version",
    resourceType: "report",
    resourceId: ids.report,
    details: { idempotency_key: "decision-1", decision: "approved" },
  });
});

test("all allowed report decisions preserve optional reason values", async () => {
  for (const decision of ["approved", "changes_requested", "rejected"]) {
    const harness = createHarness();
    const response = await harness.handle(request({ ...decisionBody, decision, decisionReason: undefined }));
    assert.equal(response.status, 200);
    assert.deepEqual(harness.calls.find((call) => call[0] === "rpc")[2], {
      p_case_id: ids.case,
      p_report_id: ids.report,
      p_report_version_id: ids.version,
      p_decision: decision,
      p_decision_reason: "",
    });
  }
});

test("report release calls the versioned release RPC and audits its case-scoped operation", async () => {
  const harness = createHarness();
  const response = await harness.handle(request({
    action: "release_report_version",
    tenantId: ids.tenant,
    caseId: ids.case,
    reportId: ids.report,
    reportVersionId: ids.version,
    renderedFileId: ids.file,
    releaseNotes: "Final approved report",
    idempotencyKey: "release-1",
  }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, releaseEventId: ids.operation, auditId: "audit-1" });
  assert.deepEqual(harness.calls.find((call) => call[0] === "rpc").slice(1), [
    "release_case_report_version",
    {
      p_case_id: ids.case,
      p_report_id: ids.report,
      p_report_version_id: ids.version,
      p_rendered_file_id: ids.file,
      p_release_notes: "Final approved report",
    },
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "writeAudit")[1], {
    caseId: ids.case,
    actorUserId: user.id,
    action: "video_report_admin.release_report_version",
    resourceType: "report",
    resourceId: ids.report,
    details: { idempotency_key: "release-1" },
  });
});

test("video delivery acknowledgement validates the RPC result and returns its acknowledgement identifier", async () => {
  const acknowledgement = { id: ids.operation, delivery_id: ids.delivery };
  const harness = createHarness({ rpcResult: { data: [acknowledgement], error: null } });
  const response = await harness.handle(request({
    action: "acknowledge_video_delivery",
    tenantId: ids.tenant,
    caseId: ids.case,
    deliveryId: ids.delivery,
    acknowledgementText: "Received securely",
    idempotencyKey: "ack-1",
  }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, acknowledgementId: ids.operation, auditId: "audit-1" });
  assert.deepEqual(harness.calls.find((call) => call[0] === "rpc").slice(1), [
    "acknowledge_video_report_delivery",
    { target_delivery_id: ids.delivery, acknowledgement_text: "Received securely" },
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "writeAudit")[1], {
    caseId: ids.case,
    actorUserId: user.id,
    action: "video_report_admin.acknowledge_video_delivery",
    resourceType: "video_report_delivery",
    resourceId: ids.delivery,
    details: { idempotency_key: "ack-1" },
  });

  for (const data of [null, {}, { id: "not-a-uuid" }, { delivery_id: ids.delivery }]) {
    const malformed = createHarness({ rpcResult: { data, error: null } });
    const failed = await malformed.handle(request({
      action: "acknowledge_video_delivery",
      tenantId: ids.tenant,
      caseId: ids.case,
      deliveryId: ids.delivery,
      acknowledgementText: "Received securely",
      idempotencyKey: "ack-invalid",
    }));
    assert.equal(failed.status, 400);
    assert.equal(malformed.calls.some((call) => call[0] === "writeAudit"), false);
  }
});

test("authorization denials prevent all three mutations and their audit records", async () => {
  const bodies = [
    decisionBody,
    {
      action: "release_report_version",
      tenantId: ids.tenant,
      caseId: ids.case,
      reportId: ids.report,
      reportVersionId: ids.version,
      renderedFileId: ids.file,
      idempotencyKey: "release-denied",
    },
    {
      action: "acknowledge_video_delivery",
      tenantId: ids.tenant,
      caseId: ids.case,
      deliveryId: ids.delivery,
      acknowledgementText: "Received",
      idempotencyKey: "ack-denied",
    },
  ];
  for (const body of bodies) {
    for (const override of ["roleError", "tenantError"]) {
      const harness = createHarness({
        [override]: Object.assign(new Error("Access denied"), { status: 403 }),
      });
      const response = await harness.handle(request(body));
      assert.equal(response.status, 403);
      assert.equal(harness.calls.some((call) => call[0] === "rpc"), false);
      assert.equal(harness.calls.some((call) => call[0] === "writeAudit"), false);
    }
  }
});

test("idempotent retries for each action return the existing actor-scoped audit without repeating RPCs", async () => {
  const bodiesAndLookups = [
    [decisionBody, "video_report_admin.decide_report_version", "report", ids.report],
    [{
      action: "release_report_version",
      tenantId: ids.tenant,
      caseId: ids.case,
      reportId: ids.report,
      reportVersionId: ids.version,
      renderedFileId: ids.file,
      idempotencyKey: "release-2",
    }, "video_report_admin.release_report_version", "report", ids.report],
    [{
      action: "acknowledge_video_delivery",
      tenantId: ids.tenant,
      caseId: ids.case,
      deliveryId: ids.delivery,
      acknowledgementText: "Received",
      idempotencyKey: "ack-2",
    }, "video_report_admin.acknowledge_video_delivery", "video_report_delivery", ids.delivery],
  ];
  for (const [body, action, resourceType, resourceId] of bodiesAndLookups) {
    const harness = createHarness({ existingAudit: { id: "prior-audit" } });
    const response = await harness.handle(request(body));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, idempotent: true, auditId: "prior-audit" });
    assert.deepEqual(harness.calls.find((call) => call[0] === "findIdempotentAudit")[1], {
      idempotencyKey: body.idempotencyKey,
      actorUserId: user.id,
      action,
      resourceType,
      resourceId,
      caseId: ids.case,
    });
    assert.equal(harness.calls.some((call) => call[0] === "rpc"), false);
    assert.equal(harness.calls.some((call) => call[0] === "writeAudit"), false);
  }
});

test("invalid inputs and failed RPC results do not create successful audit records", async () => {
  const invalidBodies = [
    { ...decisionBody, decision: "publish" },
    { ...decisionBody, reportVersionId: "invalid-uuid" },
    { ...decisionBody, decisionReason: "r".repeat(1001) },
    { ...decisionBody, idempotencyKey: "" },
    {
      action: "release_report_version",
      tenantId: ids.tenant,
      caseId: ids.case,
      reportId: ids.report,
      reportVersionId: ids.version,
      renderedFileId: "bad",
      idempotencyKey: "invalid-release",
    },
    {
      action: "acknowledge_video_delivery",
      tenantId: ids.tenant,
      caseId: ids.case,
      deliveryId: ids.delivery,
      acknowledgementText: "  ",
      idempotencyKey: "invalid-ack",
    },
  ];
  for (const body of invalidBodies) {
    const harness = createHarness();
    const response = await harness.handle(request(body));
    assert.equal(response.status, 400);
    assert.equal(harness.calls.some((call) => call[0] === "rpc"), false);
    assert.equal(harness.calls.some((call) => call[0] === "writeAudit"), false);
  }

  const mutationBodies = [decisionBody, {
    action: "release_report_version",
    tenantId: ids.tenant,
    caseId: ids.case,
    reportId: ids.report,
    reportVersionId: ids.version,
    renderedFileId: ids.file,
    idempotencyKey: "release-failure",
  }, {
    action: "acknowledge_video_delivery",
    tenantId: ids.tenant,
    caseId: ids.case,
    deliveryId: ids.delivery,
    acknowledgementText: "Received",
    idempotencyKey: "ack-failure",
  }];
  for (const body of mutationBodies) {
    const harness = createHarness({ rpcResult: { data: null, error: new Error("RPC failed") } });
    const response = await harness.handle(request(body));
    assert.equal(response.status, 400);
    assert.equal(harness.calls.some((call) => call[0] === "writeAudit"), false);
  }
  for (const body of mutationBodies) {
    const harness = createHarness({ rpcResult: { data: "unexpected-result", error: null } });
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
    const response = await harness.handle(request(decisionBody, method, origin));
    assert.equal(response.status, status);
    assert.equal(harness.calls.some((call) => call[0] === "authenticate"), false);
  }
});
