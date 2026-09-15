import test from "node:test";
import assert from "node:assert/strict";

import { handleCaseReportGovernance } from "./handler.mjs";

function makeRequest(body, init = {}) {
  return new Request("https://example.test/functions/v1/case-report-governance", {
    method: init.method ?? "POST",
    headers: {
      authorization: "******",
      "content-type": "application/json",
      origin: "https://app.test",
      ...(init.headers ?? {}),
    },
    body: init.method === "OPTIONS" ? undefined : JSON.stringify(body),
  });
}

function makeUserClient(rpcImpl) {
  return {
    auth: {
      async getUser(token) {
        assert.ok(token.length > 0);
        return { data: { user: { id: "user-1" } }, error: null };
      },
    },
    rpc: rpcImpl,
  };
}

const envGet = (name) => {
  if (name === "SAFESTEPS_ALLOWED_ORIGINS") return "https://app.test";
  if (name === "SUPABASE_URL") return "https://supabase.test";
  if (name === "SUPABASE_ANON_KEY") return "anon-key";
  return undefined;
};

test("routes decide_version requests to the approval RPC", async () => {
  let rpcName = null;
  let rpcArgs = null;
  const response = await handleCaseReportGovernance(
    makeRequest({
      action: "decide_version",
      caseId: "case-1",
      reportId: "report-1",
      reportVersionId: "version-1",
      decision: "approved",
      decisionReason: "ready",
    }),
    {
      envGet,
      createUserClient() {
        return makeUserClient(async (name, args) => {
          rpcName = name;
          rpcArgs = args;
          return { data: "approval-1", error: null };
        });
      },
    },
  );

  assert.equal(response.status, 200);
  assert.equal(rpcName, "decide_case_report_version");
  assert.deepEqual(rpcArgs, {
    p_case_id: "case-1",
    p_report_id: "report-1",
    p_report_version_id: "version-1",
    p_decision: "approved",
    p_decision_reason: "ready",
  });
  assert.deepEqual(await response.json(), {
    ok: true,
    action: "decide_version",
    approvalId: "approval-1",
  });
});

test("routes release_version requests to the release RPC", async () => {
  let rpcName = null;
  let rpcArgs = null;
  const response = await handleCaseReportGovernance(
    makeRequest({
      action: "release_version",
      caseId: "case-1",
      reportId: "report-1",
      reportVersionId: "version-1",
      renderedFileId: "file-1",
      releaseNotes: "ship it",
    }),
    {
      envGet,
      createUserClient() {
        return makeUserClient(async (name, args) => {
          rpcName = name;
          rpcArgs = args;
          return { data: "release-1", error: null };
        });
      },
    },
  );

  assert.equal(response.status, 200);
  assert.equal(rpcName, "release_case_report_version");
  assert.deepEqual(rpcArgs, {
    p_case_id: "case-1",
    p_report_id: "report-1",
    p_report_version_id: "version-1",
    p_rendered_file_id: "file-1",
    p_release_notes: "ship it",
  });
  assert.deepEqual(await response.json(), {
    ok: true,
    action: "release_version",
    releaseEventId: "release-1",
  });
});

test("rejects unsupported actions", async () => {
  const response = await handleCaseReportGovernance(
    makeRequest({ action: "something_else" }),
    {
      envGet,
      createUserClient() {
        return makeUserClient(async () => ({ data: null, error: null }));
      },
    },
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "Unsupported action",
  });
});

test("rejects disallowed origins with explicit response headers", async () => {
  const response = await handleCaseReportGovernance(
    makeRequest({ action: "decide_version" }, {
      headers: { origin: "https://blocked.test" },
    }),
    {
      envGet,
      createUserClient() {
        throw new Error("should not be called");
      },
    },
  );

  assert.equal(response.status, 403);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://blocked.test");
  assert.deepEqual(await response.json(), {
    error: "Origin not allowed",
  });
});

test("rejects missing bearer tokens before RPC dispatch", async () => {
  const response = await handleCaseReportGovernance(
    makeRequest({ action: "decide_version" }, {
      headers: { authorization: "" },
    }),
    {
      envGet,
      createUserClient() {
        throw new Error("should not be called");
      },
    },
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "Authentication required",
  });
});
