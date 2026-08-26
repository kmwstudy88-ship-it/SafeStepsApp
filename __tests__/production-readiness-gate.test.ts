import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const scriptPath = path.join(process.cwd(), "SafeStepsTools", "production-readiness-gate.mjs");

const completeEnv = {
  SAFESTEPS_STAGING_URL: "https://staging-example.supabase.co",
  SAFESTEPS_STAGING_PUBLISHABLE_KEY: "publishable-placeholder",
  SAFESTEPS_STAGING_CASE_ID: "00000000-0000-0000-0000-000000000000",
  SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON: JSON.stringify({
    parent: { email: "parent+synthetic@example.test", password: "placeholder123" },
    child: { email: "child+synthetic@example.test", password: "placeholder123" },
    caseworker: { email: "caseworker+synthetic@example.test", password: "placeholder123" },
    supervisor: { email: "supervisor+synthetic@example.test", password: "placeholder123" },
    court_viewer: { email: "court-viewer+synthetic@example.test", password: "placeholder123" },
    unrelated: { email: "unrelated+synthetic@example.test", password: "placeholder123" },
  }),
  SAFESTEPS_SECURITY_ADVISOR_REVIEWED_AT: "2026-08-14T00:00:00Z",
  SAFESTEPS_PERFORMANCE_ADVISOR_REVIEWED_AT: "2026-08-14T00:00:00Z",
  SAFESTEPS_STAGING_JOURNEY_VERIFIED_AT: "2026-08-14T00:00:00Z",
  SAFESTEPS_DEPENDENCY_AUDIT_REVIEWED_AT: "2026-08-14T00:00:00Z",
  SAFESTEPS_CREDENTIAL_ROTATION_CONFIRMED_AT: "2026-08-14T00:00:00Z",
};

function runGate(env: Record<string, string> = {}) {
  return spawnSync(process.execPath, [scriptPath], {
    env: { PATH: process.env.PATH, ...env },
    encoding: "utf8",
  });
}

function makeRepoFixture({
  dependencies,
  sourceFile,
}: {
  dependencies?: Record<string, string>;
  sourceFile?: { path: string; content: string };
}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "safesteps-gate-"));
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify(
      {
        name: "fixture",
        version: "1.0.0",
        dependencies: dependencies ?? {},
      },
      null,
      2,
    ),
  );

  if (sourceFile) {
    const absolutePath = path.join(root, sourceFile.path);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, sourceFile.content);
  }

  return root;
}

describe("production readiness gate", () => {
  it("fails closed when required evidence is missing", () => {
    const result = runGate();

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Missing release gate evidence: SAFESTEPS_STAGING_URL.");
  });

  it("fails closed for malformed credential JSON", () => {
    const result = runGate({ ...completeEnv, SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON: "{" });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Invalid SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON");
  });

  it("fails closed for the production Supabase ref", () => {
    const result = runGate({ ...completeEnv, SAFESTEPS_STAGING_URL: "https://yzxotxbwgxnxemkzigse.supabase.co" });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Release gate refuses production Supabase ref");
  });

  it("fails closed for malformed staging URLs", () => {
    const result = runGate({ ...completeEnv, SAFESTEPS_STAGING_URL: "not-a-url" });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("SAFESTEPS_STAGING_URL must be a valid staging Supabase URL");
  });

  it("requires ISO timestamp evidence", () => {
    const result = runGate({ ...completeEnv, SAFESTEPS_SECURITY_ADVISOR_REVIEWED_AT: "14/08/2026" });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("SAFESTEPS_SECURITY_ADVISOR_REVIEWED_AT must be an ISO-style date/time");
  });

  it("passes when all required non-production evidence is present", () => {
    const result = runGate(completeEnv);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Production readiness gate passed");
  });

  it("fails closed when firebase dependency is present", () => {
    const repoRoot = makeRepoFixture({
      dependencies: {
        firebase: "^11.0.0",
      },
    });
    const result = runGate({ ...completeEnv, SAFESTEPS_REPO_ROOT: repoRoot });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Firebase dependency detected");
  });

  it("fails closed when firebase runtime import is present", () => {
    const repoRoot = makeRepoFixture({
      sourceFile: {
        path: "app/firebase-leak.ts",
        content: 'import { initializeApp } from "firebase/app";\nvoid initializeApp;\n',
      },
    });
    const result = runGate({ ...completeEnv, SAFESTEPS_REPO_ROOT: repoRoot });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Firebase runtime imports detected");
  });
});
