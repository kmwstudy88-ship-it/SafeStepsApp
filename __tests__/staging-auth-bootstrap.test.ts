import { spawnSync } from "node:child_process";
import path from "node:path";

const scriptPath = path.join(process.cwd(), "SafeStepsTools", "staging-auth-bootstrap.mjs");

function jwtPayload(payload: Record<string, string>) {
  const encoded = Buffer.from(JSON.stringify(payload))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `header.${encoded}.signature`;
}

const validServiceRoleKey = jwtPayload({ role: "service_role", ref: "stagingref123" });
const productionServiceRoleKey = jwtPayload({ role: "service_role", ref: "yzxotxbwgxnxemkzigse" });

const completeCredentials = JSON.stringify({
  parent: { email: "parent+synthetic@example.test", password: "placeholder123" },
  child: { email: "child+synthetic@example.test", password: "placeholder123" },
  caseworker: { email: "caseworker+synthetic@example.test", password: "placeholder123" },
  supervisor: { email: "supervisor+synthetic@example.test", password: "placeholder123" },
  court_viewer: { email: "court-viewer+synthetic@example.test", password: "placeholder123" },
  unrelated: { email: "unrelated+synthetic@example.test", password: "placeholder123" },
});

function runBootstrap(env: Record<string, string> = {}) {
  return spawnSync(process.execPath, [scriptPath], {
    env: { PATH: process.env.PATH, ...env },
    encoding: "utf8",
  });
}

describe("staging Auth bootstrap guard", () => {
  it("fails closed without staging target configuration", () => {
    const result = runBootstrap();

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Set SAFESTEPS_STAGING_URL and SAFESTEPS_STAGING_SERVICE_ROLE_KEY");
  });

  it("fails closed for malformed credential JSON", () => {
    const result = runBootstrap({
      SAFESTEPS_STAGING_URL: "https://staging-example.supabase.co",
      SAFESTEPS_STAGING_SERVICE_ROLE_KEY: validServiceRoleKey,
      SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON: "{",
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON must be valid JSON");
  });

  it("fails closed for malformed staging URLs", () => {
    const result = runBootstrap({
      SAFESTEPS_STAGING_URL: "stagingref123",
      SAFESTEPS_STAGING_SERVICE_ROLE_KEY: validServiceRoleKey,
      SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON: completeCredentials,
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("SAFESTEPS_STAGING_URL must be a valid staging Supabase URL");
  });

  it("fails closed for production service-role JWTs", () => {
    const result = runBootstrap({
      SAFESTEPS_STAGING_URL: "https://staging-example.supabase.co",
      SAFESTEPS_STAGING_SERVICE_ROLE_KEY: productionServiceRoleKey,
      SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON: completeCredentials,
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Refusing to run Auth bootstrap with a production service-role key");
  });
});
