import assert from "node:assert/strict";
import test from "node:test";

import { handlePrivilegedEvidenceProcessing } from "./handler.mjs";

const user = { id: "11111111-1111-4111-8111-111111111111" };
const ids = {
  tenant: "22222222-2222-4222-8222-222222222222",
  case: "33333333-3333-4333-8333-333333333333",
  document: "44444444-4444-4444-8444-444444444444",
  version: "55555555-5555-4555-8555-555555555555",
  reviewEvent: "66666666-6666-4666-8666-666666666666",
  queueEvent: "77777777-7777-4777-8777-777777777777",
};

const reviewBody = {
  action: "review_document_version",
  tenantId: ids.tenant,
  caseId: ids.case,
  documentId: ids.document,
  documentVersionId: ids.version,
  decision: "accepted",
  includeInReport: true,
  reviewNotes: "Verified against the source record",
  idempotencyKey: "review-1",
};

const queueBody = {
  action: "queue_document_processing",
  tenantId: ids.tenant,
  caseId: ids.case,
  documentId: ids.document,
  idempotencyKey: "queue-1",
};

function request(body, method = "POST", origin = "https://app.test") {
  return new Request("https://edge.test/privileged-evidence-processing", {
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
      return overrides.rpcResult ?? { data: ids.reviewEvent, error: null };
    },
  };
  const adminClient = {
    from(table) {
      calls.push(["from", table]);
      return {
        insert(row) {
          calls.push(["insert", row]);
          return {
            select(columns) {
              calls.push(["select", columns]);
              return {
                async single() {
                  calls.push(["single"]);
                  return overrides.queueResult ?? {
                    data: { id: ids.queueEvent, created_at: "2026-10-12T00:00:00Z" },
                    error: null,
                  };
                },
              };
            },
          };
        },
      };
    },
  };

  const dependencies = {
    assertCaseRole: async (client, caseId, roles) => {
      calls.push(["assertCaseRole", caseId, roles]);
      if (overrides.roleError) throw overrides.roleError;
    },
    assertCaseTenant: async (client, caseId, tenantId) => {
      calls.push(["assertCaseTenant", caseId, tenantId]);
      if (overrides.tenantError) throw overrides.tenantError;
    },
    authenticate: async () => {
      calls.push(["authenticate"]);
      if (overrides.authError) throw overrides.authError;
      return { user: overrides.user ?? user, userClient, adminClient };
    },
    corsHeaders: (req) => {
      calls.push(["corsHeaders", req.headers.get("origin")]);
      return req.headers.get("origin") === "https://blocked.test"
        ? null
        : { "Access-Control-Allow-Origin": "https://app.test" };
    },
    errorResponse: (error, cors) => {
      calls.push(["errorResponse", error.message]);
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.status ?? 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
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
    optionalBoolean: (body, key, defaultValue) => {
      const value = body[key];
      if (value === undefined || value === null) return defaultValue;
      if (typeof value !== "boolean") throw new Error(`${key} must be boolean`);
      return value;
    },
    optionalString: (body, key, maxLength) => {
      const value = body[key];
      if (value === undefined || value === null || value === "") return null;
      if (typeof value !== "string" || value.trim().length > maxLength) {
        throw new Error(`${key} is invalid`);
      }
      return value.trim();
    },
    parseBody: (body) => {
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new Error("Request body must be a JSON object");
      }
      return body;
    },
    requiredEnum: (body, key, allowed) => {
      const value = body[key];
      if (typeof value !== "string" || !allowed.includes(value)) throw new Error(`${key} is invalid`);
      return value;
    },
    requiredString: (body, key, maxLength) => {
      const value = body[key];
      if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
        throw new Error(`${key} is invalid`);
      }
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
    handle: (req) => handlePrivilegedEvidenceProcessing(req, dependencies),
  };
}

test("document review uses the case-scoped RPC and records the actor-scoped audit", async () => {
  const harness = createHarness();
  const response = await harness.handle(request(reviewBody));

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ok: true,
    reviewEventId: ids.reviewEvent,
    auditId: "audit-1",
  });
  assert.deepEqual(harness.calls.filter((call) => [
    "assertCaseRole", "assertCaseTenant", "findIdempotentAudit", "rpc", "writeAudit",
  ].includes(call[0])).map((call) => call[0]), [
    "assertCaseRole", "assertCaseTenant", "findIdempotentAudit", "rpc", "writeAudit",
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "assertCaseRole").slice(1), [
    ids.case, ["caseworker", "supervisor", "admin", "clinician"],
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "rpc").slice(1), [
    "review_case_document_version",
    {
      p_case_id: ids.case,
      p_document_id: ids.document,
      p_document_version_id: ids.version,
      p_decision: "accepted",
      p_include_in_report: true,
      p_review_notes: "Verified against the source record",
    },
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "findIdempotentAudit")[1], {
    idempotencyKey: "review-1",
    actorUserId: user.id,
    action: "evidence.review_document_version",
    resourceType: "case_document",
    resourceId: ids.document,
    caseId: ids.case,
  });
  assert.deepEqual(harness.calls.find((call) => call[0] === "writeAudit")[1], {
    caseId: ids.case,
    actorUserId: user.id,
    action: "evidence.review_document_version",
    resourceType: "case_document",
    resourceId: ids.document,
    details: { idempotency_key: "review-1", review_event_id: ids.reviewEvent },
  });
});

test("document review accepts only supported decisions and applies safe optional defaults", async () => {
  for (const decision of ["accepted", "needs_update", "excluded"]) {
    const harness = createHarness();
    const response = await harness.handle(request({
      ...reviewBody,
      decision,
      includeInReport: undefined,
      reviewNotes: undefined,
    }));

    assert.equal(response.status, 200);
    assert.deepEqual(harness.calls.find((call) => call[0] === "rpc")[2], {
      p_case_id: ids.case,
      p_document_id: ids.document,
      p_document_version_id: ids.version,
      p_decision: decision,
      p_include_in_report: false,
      p_review_notes: "",
    });
  }

  const invalid = createHarness();
  const invalidResponse = await invalid.handle(request({ ...reviewBody, decision: "approved" }));
  assert.equal(invalidResponse.status, 400);
  assert.equal(invalid.calls.some((call) => call[0] === "rpc"), false);
  assert.equal(invalid.calls.some((call) => call[0] === "writeAudit"), false);
});

test("document processing queue records an event before writing its audit", async () => {
  const harness = createHarness();
  const response = await harness.handle(request(queueBody));

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ok: true,
    queueEventId: ids.queueEvent,
    auditId: "audit-1",
  });
  const insert = harness.calls.find((call) => call[0] === "insert")[1];
  assert.deepEqual({
    case_id: insert.case_id,
    document_id: insert.document_id,
    actor_user_id: insert.actor_user_id,
    event_type: insert.event_type,
    source: insert.event_payload.source,
    idempotency_key: insert.event_payload.idempotency_key,
  }, {
    case_id: ids.case,
    document_id: ids.document,
    actor_user_id: user.id,
    event_type: "document_processing_queued",
    source: "privileged-evidence-processing",
    idempotency_key: "queue-1",
  });
  assert.equal(Date.parse(insert.event_payload.requested_at) > 0, true);
  assert.deepEqual(harness.calls.find((call) => call[0] === "writeAudit")[1], {
    caseId: ids.case,
    actorUserId: user.id,
    action: "evidence.queue_document_processing",
    resourceType: "case_document",
    resourceId: ids.document,
    details: { idempotency_key: "queue-1", queue_event_id: ids.queueEvent },
  });
});

test("role and tenant denials prevent both evidence mutations and their audits", async () => {
  for (const body of [reviewBody, queueBody]) {
    for (const override of ["roleError", "tenantError"]) {
      const harness = createHarness({
        [override]: Object.assign(new Error("Access denied"), { status: 403 }),
      });
      const response = await harness.handle(request(body));

      assert.equal(response.status, 403);
      assert.equal(harness.calls.some((call) => call[0] === "rpc"), false);
      assert.equal(harness.calls.some((call) => call[0] === "insert"), false);
      assert.equal(harness.calls.some((call) => call[0] === "writeAudit"), false);
    }
  }
});

test("idempotent retries for both actions return the prior audit without repeating mutations", async () => {
  for (const body of [reviewBody, queueBody]) {
    const harness = createHarness({ existingAudit: { id: "prior-audit" } });
    const response = await harness.handle(request(body));

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, idempotent: true, auditId: "prior-audit" });
    assert.equal(harness.calls.some((call) => call[0] === "rpc"), false);
    assert.equal(harness.calls.some((call) => call[0] === "insert"), false);
    assert.equal(harness.calls.some((call) => call[0] === "writeAudit"), false);
    assert.deepEqual(harness.calls.find((call) => call[0] === "findIdempotentAudit")[1], {
      idempotencyKey: body.idempotencyKey,
      actorUserId: user.id,
      action: body.action === "review_document_version"
        ? "evidence.review_document_version"
        : "evidence.queue_document_processing",
      resourceType: "case_document",
      resourceId: ids.document,
      caseId: ids.case,
    });
  }
});

test("failed RPCs, queue inserts, or audit writes never produce success responses", async () => {
  const reviewFailure = createHarness({ rpcResult: { data: null, error: new Error("RPC denied") } });
  let response = await reviewFailure.handle(request(reviewBody));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Evidence review failed" });
  assert.equal(reviewFailure.calls.some((call) => call[0] === "writeAudit"), false);

  const queueFailure = createHarness({
    queueResult: { data: null, error: new Error("Insert denied") },
  });
  response = await queueFailure.handle(request(queueBody));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Document processing queue failed" });
  assert.equal(queueFailure.calls.some((call) => call[0] === "writeAudit"), false);

  for (const body of [reviewBody, queueBody]) {
    const auditFailure = createHarness({ auditError: Object.assign(new Error("Audit failed"), { status: 500 }) });
    response = await auditFailure.handle(request(body));
    assert.equal(response.status, 500);
    assert.equal(auditFailure.calls.some((call) => call[0] === "writeAudit"), true);
  }
});

test("request guards and malformed payloads reject before evidence mutations", async () => {
  const blocked = createHarness();
  let response = await blocked.handle(request(reviewBody, "POST", "https://blocked.test"));
  assert.equal(response.status, 403);
  assert.equal(blocked.calls.some((call) => call[0] === "authenticate"), false);

  const preflight = createHarness();
  response = await preflight.handle(request(undefined, "OPTIONS"));
  assert.equal(response.status, 200);
  assert.equal(preflight.calls.some((call) => call[0] === "authenticate"), false);

  const wrongMethod = createHarness();
  response = await wrongMethod.handle(request(undefined, "GET"));
  assert.equal(response.status, 405);
  assert.equal(wrongMethod.calls.some((call) => call[0] === "authenticate"), false);

  const invalidBody = createHarness();
  response = await invalidBody.handle(request({ ...queueBody, documentId: "not-a-uuid" }));
  assert.equal(response.status, 400);
  assert.equal(invalidBody.calls.some((call) => call[0] === "insert"), false);

  const authFailure = createHarness({ authError: Object.assign(new Error("Authentication failed"), { status: 401 }) });
  response = await authFailure.handle(request(queueBody));
  assert.equal(response.status, 401);
  assert.equal(authFailure.calls.some((call) => call[0] === "insert"), false);
});
