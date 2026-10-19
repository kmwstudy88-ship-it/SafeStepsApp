import assert from "node:assert/strict";
import test from "node:test";

import { handlePrivilegedSensitiveDataExport } from "./handler.mjs";

const user = { id: "actor-1" };
const input = {
  tenantId: "tenant-1",
  organisationId: "organisation-1",
  exportRequestId: "export-request-1",
  idempotencyKey: "request-123",
};
const cors = { "Access-Control-Allow-Origin": "https://app.test" };

function makeRequest(body = input, origin = "https://app.test", method = "POST") {
  return new Request("https://edge.test/privileged-sensitive-data-export", {
    method,
    headers: { origin, "content-type": "application/json" },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
}

function createHarness(overrides = {}) {
  const calls = [];
  const userClient = {
    async rpc(name, args) {
      calls.push(["rpc", name, args]);
      return overrides.approvalResult ?? { data: true, error: null };
    },
  };
  const adminClient = { id: "admin-client" };
  const dependencies = {
    assertAdminRole: overrides.assertAdminRole ?? (async (client) => { calls.push(["assertAdminRole", client]); }),
    assertOrganisationTenantAccess: overrides.assertOrganisationTenantAccess ?? (async (client, actor, organisationId, tenantId) => {
      calls.push(["assertOrganisationTenantAccess", client, actor, organisationId, tenantId]);
    }),
    authenticate: async () => {
      calls.push(["authenticate"]);
      return { user: overrides.user ?? user, userClient, adminClient };
    },
    corsHeaders: (req) => {
      calls.push(["corsHeaders", req.headers.get("origin")]);
      return req.headers.get("origin") === "https://blocked.test" ? null : cors;
    },
    errorResponse: (error, headers) => {
      calls.push(["errorResponse", error.message, headers]);
      return new Response(JSON.stringify({ error: error.message }), { status: error.status ?? 400, headers });
    },
    findIdempotentAudit: async (client, check) => {
      calls.push(["findIdempotentAudit", client, check]);
      return overrides.existingAudit ?? null;
    },
    methodGuard: (req) => {
      calls.push(["methodGuard", req.method]);
      if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
      if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
      return null;
    },
    parseBody: (body) => {
      calls.push(["parseBody", body]);
      if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Request body must be a JSON object");
      return body;
    },
    requiredString: (body, key, maxLength) => {
      calls.push(["requiredString", key, maxLength]);
      const value = body[key];
      if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
        throw new Error(`${key} is invalid`);
      }
      return value.trim();
    },
    requiredUuid: (body, key) => {
      calls.push(["requiredUuid", key]);
      const value = body[key];
      if (typeof value !== "string" || !/^[a-z]+-[a-z0-9-]+$/.test(value)) throw new Error(`${key} is invalid`);
      return value;
    },
    response: (body, status, headers = {}) => {
      calls.push(["response", body, status]);
      return new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
    },
    writeAudit: async (client, audit) => {
      calls.push(["writeAudit", client, audit]);
      if (overrides.auditError) throw overrides.auditError;
      return { id: "audit-1" };
    },
  };

  return {
    calls,
    userClient,
    adminClient,
    dependencies,
    handle: (req) => handlePrivilegedSensitiveDataExport(req, dependencies),
  };
}

test("valid export requires admin, tenant membership, approval and records actor-scoped audit", async () => {
  const harness = createHarness();
  const response = await harness.handle(makeRequest());

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, exportApproved: true, auditId: "audit-1" });
  assert.deepEqual(harness.calls.filter((call) => [
    "assertAdminRole",
    "assertOrganisationTenantAccess",
    "findIdempotentAudit",
    "rpc",
    "writeAudit",
  ].includes(call[0])).map((call) => call[0]), [
    "assertAdminRole",
    "assertOrganisationTenantAccess",
    "findIdempotentAudit",
    "rpc",
    "writeAudit",
  ]);

  const membershipCall = harness.calls.find((call) => call[0] === "assertOrganisationTenantAccess");
  assert.deepEqual(membershipCall.slice(1), [
    harness.userClient,
    user,
    input.organisationId,
    input.tenantId,
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "rpc").slice(1), [
    "can_export_platform_tenant_data",
    { p_export_request_id: input.exportRequestId },
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "writeAudit").slice(1), [
    harness.adminClient,
    {
      actorUserId: user.id,
      action: "sensitive_export.validate_tenant_export",
      resourceType: "platform_tenant_export_request",
      resourceId: input.exportRequestId,
      details: {
        idempotency_key: input.idempotencyKey,
        tenant_id: input.tenantId,
        organisation_id: input.organisationId,
      },
    },
  ]);
});

test("authorization denials and RPC errors stop before approval audit write", async () => {
  const adminDenied = createHarness({
    assertAdminRole: async () => { throw Object.assign(new Error("Administrator access required"), { status: 403 }); },
  });
  let response = await adminDenied.handle(makeRequest());
  assert.equal(response.status, 403);
  assert.equal(adminDenied.calls.some((call) => call[0] === "rpc"), false);
  assert.equal(adminDenied.calls.some((call) => call[0] === "writeAudit"), false);

  const organisationDenied = createHarness({
    assertOrganisationTenantAccess: async () => { throw Object.assign(new Error("Organisation access denied"), { status: 403 }); },
  });
  response = await organisationDenied.handle(makeRequest());
  assert.equal(response.status, 403);
  assert.equal(organisationDenied.calls.some((call) => call[0] === "rpc"), false);
  assert.equal(organisationDenied.calls.some((call) => call[0] === "writeAudit"), false);

  for (const approvalResult of [
    { data: false, error: null },
    { data: null, error: new Error("RPC unavailable") },
  ]) {
    const harness = createHarness({ approvalResult });
    response = await harness.handle(makeRequest());
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { error: "Sensitive export request not approved" });
    assert.equal(harness.calls.some((call) => call[0] === "writeAudit"), false);
  }
});

test("repeated actor/resource/idempotency key returns the prior audit without rechecking approval or writing", async () => {
  const harness = createHarness({ existingAudit: { id: "prior-audit" } });
  const response = await harness.handle(makeRequest());

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, idempotent: true, auditId: "prior-audit" });
  const lookup = harness.calls.find((call) => call[0] === "findIdempotentAudit");
  assert.deepEqual(lookup[2], {
    idempotencyKey: input.idempotencyKey,
    actorUserId: user.id,
    action: "sensitive_export.validate_tenant_export",
    resourceType: "platform_tenant_export_request",
    resourceId: input.exportRequestId,
    caseId: null,
  });
  assert.equal(harness.calls.some((call) => call[0] === "rpc"), false);
  assert.equal(harness.calls.some((call) => call[0] === "writeAudit"), false);
});

test("invalid requests fail before privileged authorization or export approval", async () => {
  const malformedRequests = [
    { ...input, tenantId: "bad" },
    { ...input, organisationId: "bad" },
    { ...input, exportRequestId: "bad" },
    { ...input, idempotencyKey: "" },
    { ...input, idempotencyKey: "k".repeat(129) },
  ];
  for (const body of malformedRequests) {
    const harness = createHarness();
    const response = await harness.handle(makeRequest(body));
    assert.equal(response.status, 400);
    assert.equal(harness.calls.some((call) => call[0] === "assertAdminRole"), false);
    assert.equal(harness.calls.some((call) => call[0] === "rpc"), false);
    assert.equal(harness.calls.some((call) => call[0] === "writeAudit"), false);
  }
});

test("origin and method guards run before authentication", async () => {
  const blockedOrigin = createHarness();
  let response = await blockedOrigin.handle(makeRequest(input, "https://blocked.test"));
  assert.equal(response.status, 403);
  assert.equal(blockedOrigin.calls.some((call) => call[0] === "authenticate"), false);

  const preflight = createHarness();
  response = await preflight.handle(makeRequest(undefined, "https://app.test", "OPTIONS"));
  assert.equal(response.status, 200);
  assert.equal(preflight.calls.some((call) => call[0] === "authenticate"), false);

  const get = createHarness();
  response = await get.handle(makeRequest(undefined, "https://app.test", "GET"));
  assert.equal(response.status, 405);
  assert.equal(get.calls.some((call) => call[0] === "authenticate"), false);
});
