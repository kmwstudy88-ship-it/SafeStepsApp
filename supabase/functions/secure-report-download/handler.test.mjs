import assert from "node:assert/strict";
import test from "node:test";

import { handleSecureReportDownload } from "./handler.mjs";

const user = { id: "11111111-1111-4111-8111-111111111111" };
const exportRequest = {
  caseId: "22222222-2222-4222-8222-222222222222",
  releaseEventId: "33333333-3333-4333-8333-333333333333",
  recipientId: "44444444-4444-4444-8444-444444444444",
  authority: "Court order",
  purpose: "Case export",
  expirySeconds: 300,
};

function makeRequest(body = exportRequest, method = "POST", origin = "https://app.test") {
  return new Request("https://edge.test/secure-report-download", {
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
    auth: {
      async getUser(token) {
        calls.push(["getUser", token]);
        if (overrides.authError) return { data: null, error: overrides.authError };
        return { data: { user: overrides.user ?? user }, error: null };
      },
    },
    async rpc(name, args) {
      calls.push(["rpc", name, args]);
      return overrides.rpcResult ?? { data: "export-event-1", error: null };
    },
  };

  const admin = {
    from(table) {
      calls.push(["from", table]);
      const query = {
        select(cols) {
          calls.push(["select", cols]);
          return this;
        },
        eq(column, value) {
          calls.push(["eq", column, value]);
          return this;
        },
        single: async () => {
          calls.push(["single"]);
          return { data: overrides.event ?? {
            id: "export-event-1",
            report_version: 2,
            signed_url_expires_at: "2026-01-01T00:10:00Z",
            report_rendered_files: {
              storage_bucket: "reports",
              storage_path: "case-123/report.pdf",
              file_hash_sha256: "abc123",
            },
          }, error: overrides.eventError ?? null };
        },
        insert(row) {
          calls.push(["insert", row]);
          return { error: overrides.auditError ?? null };
        },
      };
      return query;
    },
    storage: {
      from(bucket) {
        calls.push(["storage.from", bucket]);
        return {
          async createSignedUrl(path, expirySeconds, options) {
            calls.push(["createSignedUrl", path, expirySeconds, options]);
            if (overrides.signError) return { data: null, error: overrides.signError };
            return { data: { signedUrl: "https://signed.example/report.pdf" }, error: null };
          },
        };
      },
    },
  };

  return {
    calls,
    handle: (req) => handleSecureReportDownload(req, {
      createClient: (url, key, cfg) => ({ url, key, cfg, auth: userClient.auth, rpc: userClient.rpc, storage: admin.storage, from: admin.from }),
      envGet: (name) => {
        const values = {
          SAFESTEPS_ALLOWED_ORIGINS: "https://app.test",
          SUPABASE_URL: "https://example.supabase.co",
          SUPABASE_ANON_KEY: "anon-key",
          SUPABASE_SERVICE_ROLE_KEY: "service-key",
        };
        return values[name] ?? null;
      },
    }),
  };
}

test("issues signed report URLs only after auth, export request, effective file lookup, and audit write succeed", async () => {
  const harness = createHarness();
  const response = await harness.handle(makeRequest());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    exportEventId: "export-event-1",
    signedUrl: "https://signed.example/report.pdf",
    expiresAt: "2026-01-01T00:10:00Z",
    reportVersion: 2,
    fileSha256: "abc123",
  });
  assert.deepEqual(harness.calls.filter((call) => ["getUser", "rpc", "select", "eq", "single", "storage.from", "createSignedUrl", "insert"].includes(call[0])).map((call) => call[0]), [
    "getUser", "rpc", "select", "eq", "eq", "single", "storage.from", "createSignedUrl", "insert",
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "rpc").slice(1), [
    "request_case_report_export",
    {
      p_case_id: exportRequest.caseId,
      p_release_event_id: exportRequest.releaseEventId,
      p_recipient_id: exportRequest.recipientId,
      p_authority: exportRequest.authority,
      p_purpose: exportRequest.purpose,
      p_expiry_seconds: 300,
    },
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "insert")[1], {
    case_id: exportRequest.caseId,
    actor_user_id: user.id,
    action: "secure_report_download_issued",
    resource_type: "report_export",
    resource_id: "export-event-1",
    details: {
      report_version: 2,
      expires_at: "2026-01-01T00:10:00Z",
    },
  });
});

test("required auth and validation guards fire before any export request or signed URL creation", async () => {
  const noAuth = createHarness({ authError: new Error("Authentication failed") });
  let response = await noAuth.handle(makeRequest());
  assert.equal(response.status, 401);
  assert.equal(noAuth.calls.some((call) => call[0] === "rpc"), false);

  const invalidBody = createHarness();
  response = await invalidBody.handle(makeRequest({ ...exportRequest, caseId: "" }));
  assert.equal(response.status, 400);
  assert.equal(invalidBody.calls.some((call) => call[0] === "rpc"), false);

  const blockedOrigin = createHarness();
  response = await blockedOrigin.handle(makeRequest(exportRequest, "POST", "https://blocked.test"));
  assert.equal(response.status, 403);
  assert.equal(blockedOrigin.calls.some((call) => call[0] === "getUser"), false);

  const preflight = createHarness();
  response = await preflight.handle(makeRequest(undefined, "OPTIONS", "https://app.test"));
  assert.equal(response.status, 200);
  assert.equal(preflight.calls.some((call) => call[0] === "getUser"), false);

  const get = createHarness();
  response = await get.handle(makeRequest(undefined, "GET", "https://app.test"));
  assert.equal(response.status, 405);
  assert.equal(get.calls.some((call) => call[0] === "getUser"), false);
});

test("missing export metadata and storage failures fail closed without issuing a signed URL or audit", async () => {
  const missingRecord = createHarness({ eventError: new Error("record missing") });
  let response = await missingRecord.handle(makeRequest());
  assert.equal(response.status, 404);
  assert.equal(missingRecord.calls.some((call) => call[0] === "createSignedUrl"), false);
  assert.equal(missingRecord.calls.some((call) => call[0] === "insert"), false);

  const missingFile = createHarness({ event: {
    id: "export-event-1",
    report_version: 2,
    signed_url_expires_at: "2026-01-01T00:10:00Z",
    report_rendered_files: { storage_bucket: null, storage_path: null, file_hash_sha256: null },
  } });
  response = await missingFile.handle(makeRequest());
  assert.equal(response.status, 400);
  assert.equal(missingFile.calls.some((call) => call[0] === "createSignedUrl"), false);
  assert.equal(missingFile.calls.some((call) => call[0] === "insert"), false);

  const signFailure = createHarness({ signError: new Error("Signed URL unavailable") });
  response = await signFailure.handle(makeRequest());
  assert.equal(response.status, 400);
  assert.equal(signFailure.calls.some((call) => call[0] === "insert"), false);

  const auditFailure = createHarness({ auditError: new Error("Audit failed") });
  response = await auditFailure.handle(makeRequest());
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: "Audit write failed" });
});

test("expirySeconds is clamped to the 60-900 second window before signing and auditing", async () => {
  for (const [input, expected] of [
    [30, 60],
    [10_000, 900],
    [300, 300],
  ]) {
    const harness = createHarness();
    const response = await harness.handle(makeRequest({ ...exportRequest, expirySeconds: input }));
    assert.equal(response.status, 200);
    assert.deepEqual(harness.calls.find((call) => call[0] === "rpc")[2], {
      p_case_id: exportRequest.caseId,
      p_release_event_id: exportRequest.releaseEventId,
      p_recipient_id: exportRequest.recipientId,
      p_authority: exportRequest.authority,
      p_purpose: exportRequest.purpose,
      p_expiry_seconds: expected,
    });
    assert.deepEqual(harness.calls.find((call) => call[0] === "createSignedUrl").slice(1), [
      "case-123/report.pdf",
      expected,
      { download: true },
    ]);
  }
});
