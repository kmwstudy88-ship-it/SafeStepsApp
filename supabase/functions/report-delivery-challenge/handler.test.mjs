import assert from "node:assert/strict";
import test from "node:test";

import { handleReportDeliveryChallenge } from "./handler.mjs";

const deliveryToken = "0123456789abcdef".repeat(3);
const verificationCode = "001927";
const decision = {
  allowed: true,
  bucket: "private-reports",
  path: "case-1/report-v4.pdf",
  reportVersion: 4,
  fileSha256: "a".repeat(64),
};

function makeRequest(body, method = "POST") {
  return new Request("https://example.test/functions/v1/report-delivery-challenge", {
    method,
    headers: { "content-type": "application/json" },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
}

function createHarness(options = {}) {
  const calls = [];
  const config = {
    decision,
    rpcError: null,
    signedUrl: "https://storage.test/signed",
    signError: null,
    ...options,
  };
  const envGet = (name) => ({
    SUPABASE_URL: "https://supabase.test",
    SUPABASE_ANON_KEY: "anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
  })[name];
  const createClient = (url, key, clientOptions) => {
    calls.push(["createClient", url, key, clientOptions]);
    if (key === "anon-key") {
      return {
        async rpc(name, args) {
          calls.push(["rpc", name, args]);
          return { data: config.decision, error: config.rpcError };
        },
      };
    }
    return {
      storage: {
        from(bucket) {
          calls.push(["storage.from", bucket]);
          return {
            async createSignedUrl(path, expiry, options) {
              calls.push(["createSignedUrl", path, expiry, options]);
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
  return {
    calls,
    handle: (request) => handleReportDeliveryChallenge(request, { envGet, createClient }),
  };
}

test("valid one-time challenge asks the authorization RPC and signs only its allowed private object", async () => {
  const harness = createHarness();
  const response = await harness.handle(makeRequest({ deliveryToken, verificationCode }));

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), {
    allowed: true,
    signedUrl: "https://storage.test/signed",
    expiresIn: 600,
    reportVersion: 4,
    fileSha256: "a".repeat(64),
    notice: "Access confirms delivery interaction only; it does not indicate agreement with report contents.",
  });
  assert.deepEqual(harness.calls.find((call) => call[0] === "rpc"), [
    "rpc",
    "consume_case_report_delivery",
    { p_token: deliveryToken, p_code: verificationCode },
  ]);
  assert.deepEqual(harness.calls.filter((call) => call[0] === "createSignedUrl"), [[
    "createSignedUrl",
    decision.path,
    600,
    { download: true },
  ]]);
});

test("rejects malformed, short, non-hex, or non-numeric challenge values before backend access", async () => {
  const invalidBodies = [
    {},
    { deliveryToken: "0".repeat(47), verificationCode },
    { deliveryToken: "g".repeat(48), verificationCode },
    { deliveryToken, verificationCode: "1927" },
    { deliveryToken, verificationCode: "01927x" },
    { deliveryToken, verificationCode: 1927 },
    null,
  ];
  for (const body of invalidBodies) {
    const harness = createHarness();
    const response = await harness.handle(makeRequest(body));
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { allowed: false });
    assert.equal(harness.calls.length, 0);
  }
});

test("denied or failed challenge consumption never signs a report URL", async () => {
  for (const options of [
    { decision: { allowed: false, reason: "expired" } },
    { decision: null },
    { rpcError: new Error("database error") },
  ]) {
    const harness = createHarness(options);
    const response = await harness.handle(makeRequest({ deliveryToken, verificationCode }));
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { allowed: false });
    assert.equal(harness.calls.some((call) => call[0] === "createSignedUrl"), false);
  }
});

test("malformed allowed decisions and signed URL failures fail closed", async () => {
  for (const malformed of [
    { ...decision, bucket: "" },
    { ...decision, path: null },
  ]) {
    const harness = createHarness({ decision: malformed });
    const response = await harness.handle(makeRequest({ deliveryToken, verificationCode }));
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { allowed: false });
    assert.equal(harness.calls.some((call) => call[0] === "createSignedUrl"), false);
  }

  for (const options of [
    { signError: new Error("storage error") },
    { signedUrl: null },
  ]) {
    const harness = createHarness(options);
    const response = await harness.handle(makeRequest({ deliveryToken, verificationCode }));
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { allowed: false });
  }
});

test("only POST is accepted and GET does not initialize clients", async () => {
  const harness = createHarness();
  const response = await harness.handle(makeRequest({}, "GET"));
  assert.equal(response.status, 405);
  assert.deepEqual(await response.json(), { allowed: false });
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(harness.calls.length, 0);
});
