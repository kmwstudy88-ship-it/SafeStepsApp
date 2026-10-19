import assert from "node:assert/strict";
import test from "node:test";

import { handlePrivateReportDownload } from "./handler.mjs";

const actorId = "actor-1";
const exportId = "export-1";
const rendered = {
  storage_bucket: "private-reports",
  storage_path: "case-1/report-v4.pdf",
  file_hash_sha256: "a".repeat(64),
};
const exportEvent = {
  id: exportId,
  requested_by: actorId,
  outcome: "allowed",
  action: "signed_url_requested",
  case_id: "case-1",
  release_event_id: "release-1",
  report_id: "report-1",
  report_version: 4,
  recipient_id: "recipient-1",
  rendered_file_id: "file-1",
  authority: "court_order",
  purpose: "court_filing",
  request_reference: "request-1",
  signed_url_expires_at: "2026-10-07T09:10:00.000Z",
  report_rendered_files: rendered,
};

function makeRequest(body, init = {}) {
  const method = init.method ?? "POST";
  return new Request("https://example.test/functions/v1/private-report-download", {
    method,
    headers: {
      authorization: "Bearer verified-token",
      "content-type": "application/json",
      origin: "https://app.test",
      ...(init.headers ?? {}),
    },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
}

function createHarness(options = {}) {
  const calls = [];
  const config = {
    event: exportEvent,
    eventError: null,
    authUser: { id: actorId },
    authError: null,
    rpcEventId: exportId,
    rpcError: null,
    signedUrl: "https://storage.test/signed",
    signError: null,
    insertError: null,
    ...options,
  };
  const createClient = (url, key, clientOptions) => {
    calls.push(["createClient", url, key, clientOptions]);
    if (key === "anon-key") {
      return {
        auth: {
          async getUser(token) {
            calls.push(["getUser", token]);
            return { data: { user: config.authUser }, error: config.authError };
          },
        },
        async rpc(name, args) {
          calls.push(["rpc", name, args]);
          return { data: config.rpcEventId, error: config.rpcError };
        },
      };
    }
    return {
      from(table) {
        calls.push(["from", table]);
        return {
          select(columns) {
            calls.push(["select", columns]);
            return this;
          },
          eq(column, value) {
            calls.push(["eq", column, value]);
            return this;
          },
          async single() {
            calls.push(["single"]);
            return { data: config.event, error: config.eventError };
          },
          async insert(row) {
            calls.push(["insert", table, row]);
            return { error: config.insertError };
          },
        };
      },
      storage: {
        from(bucket) {
          calls.push(["storage.from", bucket]);
          return {
            async createSignedUrl(path, expirySeconds, downloadOptions) {
              calls.push(["createSignedUrl", path, expirySeconds, downloadOptions]);
              return {
                data: config.signedUrl ? { signedUrl: config.signedUrl } : null,
                error: config.signError,
              };
            },
          };
        },
      },
    };
  };
  const envGet = (name) => ({
    SAFESTEPS_ALLOWED_ORIGINS: "https://app.test",
    SUPABASE_URL: "https://supabase.test",
    SUPABASE_ANON_KEY: "anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
  })[name];

  return {
    calls,
    config,
    handle: (request) => handlePrivateReportDownload(request, { envGet, createClient }),
  };
}

test("issues signed links only after user RPC authorization and actor-bound export lookup", async () => {
  const harness = createHarness();
  const response = await harness.handle(makeRequest({
    caseId: "case-1",
    releaseEventId: "release-1",
    recipientId: "recipient-1",
    authority: "court_order",
    purpose: "court_filing",
    expirySeconds: 600,
  }));

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    exportEventId: exportId,
    signedUrl: "https://storage.test/signed",
    expiresAt: exportEvent.signed_url_expires_at,
    reportVersion: 4,
    fileSha256: "a".repeat(64),
  });
  assert.ok(harness.calls.find((call) => call[0] === "rpc"));
  assert.deepEqual(harness.calls.filter((call) => call[0] === "eq"), [
    ["eq", "id", exportId],
    ["eq", "requested_by", actorId],
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "createSignedUrl"), [
    "createSignedUrl",
    rendered.storage_path,
    600,
    { download: true },
  ]);
});

test("clamps link duration to the supported minimum and maximum", async () => {
  for (const [requested, expected] of [[1, 60], [3600, 600]]) {
    const harness = createHarness();
    const response = await harness.handle(makeRequest({ expirySeconds: requested }));
    assert.equal(response.status, 200);
    assert.equal(harness.calls.find((call) => call[0] === "rpc")[2].p_expiry_seconds, expected);
    assert.equal(harness.calls.find((call) => call[0] === "createSignedUrl")[2], expected);
  }
});

test("rejects malformed expiry and unsupported actions without requesting a signed link", async () => {
  for (const body of [
    { expirySeconds: "not-a-number" },
    { expirySeconds: 60.5 },
    { action: "delete" },
  ]) {
    const harness = createHarness();
    const response = await harness.handle(makeRequest(body));
    assert.equal(response.status, 400);
    assert.equal(harness.calls.some((call) => call[0] === "rpc"), false);
    assert.equal(harness.calls.some((call) => call[0] === "createSignedUrl"), false);
  }
});

test("does not sign when the actor-bound export row cannot be loaded", async () => {
  const harness = createHarness({ event: null, eventError: new Error("not found") });
  const response = await harness.handle(makeRequest({}));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Authorised export record not found" });
  assert.equal(harness.calls.some((call) => call[0] === "createSignedUrl"), false);
});

test("does not sign when a private file location is missing or signed URL creation fails", async () => {
  const withoutPath = createHarness({ event: { ...exportEvent, report_rendered_files: { storage_bucket: "private-reports" } } });
  const missingFileResponse = await withoutPath.handle(makeRequest({}));
  assert.equal(missingFileResponse.status, 400);
  assert.equal(withoutPath.calls.some((call) => call[0] === "createSignedUrl"), false);

  const signingFailure = createHarness({ signError: new Error("storage failure") });
  const signingResponse = await signingFailure.handle(makeRequest({}));
  assert.equal(signingResponse.status, 400);
  assert.deepEqual(await signingResponse.json(), { error: "Private download could not be issued" });
});

test("confirms only the requesting actor's allowed signed-url event", async () => {
  const harness = createHarness();
  const response = await harness.handle(makeRequest({ action: "confirm", exportEventId: exportId }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { confirmed: true });
  assert.deepEqual(harness.calls.filter((call) => call[0] === "eq"), [
    ["eq", "id", exportId],
    ["eq", "requested_by", actorId],
  ]);
  assert.deepEqual(harness.calls.find((call) => call[0] === "insert"), [
    "insert",
    "case_report_export_events",
    {
      case_id: exportEvent.case_id,
      release_event_id: exportEvent.release_event_id,
      report_id: exportEvent.report_id,
      report_version: exportEvent.report_version,
      recipient_id: exportEvent.recipient_id,
      rendered_file_id: exportEvent.rendered_file_id,
      requested_by: actorId,
      authority: exportEvent.authority,
      purpose: exportEvent.purpose,
      action: "download_confirmed",
      outcome: "completed",
      request_reference: exportEvent.request_reference,
    },
  ]);
  assert.equal(harness.calls.some((call) => call[0] === "createSignedUrl"), false);
});

test("rejects confirmation of denied or unrelated export events without writing a confirmation", async () => {
  for (const event of [
    { ...exportEvent, outcome: "denied" },
    { ...exportEvent, action: "download_confirmed" },
    null,
  ]) {
    const harness = createHarness({ event });
    const response = await harness.handle(makeRequest({ action: "confirm", exportEventId: exportId }));
    assert.equal(response.status, 400);
    assert.equal(harness.calls.some((call) => call[0] === "insert"), false);
  }
});

test("authentication, origin, method, and body validation fail before report access", async () => {
  const unauthenticated = createHarness();
  let response = await unauthenticated.handle(makeRequest({}, { headers: { authorization: "" } }));
  assert.equal(response.status, 400);
  assert.equal(unauthenticated.calls.some((call) => call[0] === "rpc"), false);

  const invalidSession = createHarness({ authUser: null, authError: new Error("invalid token") });
  response = await invalidSession.handle(makeRequest({}));
  assert.equal(response.status, 400);
  assert.equal(invalidSession.calls.some((call) => call[0] === "rpc"), false);

  const blockedOrigin = createHarness();
  response = await blockedOrigin.handle(makeRequest({}, { headers: { origin: "https://blocked.test" } }));
  assert.equal(response.status, 403);
  assert.equal(blockedOrigin.calls.length, 0);

  const wrongMethod = createHarness();
  response = await wrongMethod.handle(makeRequest({}, { method: "GET" }));
  assert.equal(response.status, 405);
  assert.equal(wrongMethod.calls.length, 0);

  const preflight = createHarness();
  response = await preflight.handle(makeRequest({}, { method: "OPTIONS" }));
  assert.equal(response.status, 200);
  assert.equal(preflight.calls.length, 0);
});
