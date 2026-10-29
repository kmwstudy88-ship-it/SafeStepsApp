import { spawnSync } from "node:child_process";
import path from "node:path";

const scriptPath = path.join(process.cwd(), "SafeStepsTools", "production-readiness-gate.mjs");

const mockEnv = {
  SAFESTEPS_STAGING_URL: process.env.SAFESTEPS_STAGING_URL || "https://staging-mock.supabase.co",
  SAFESTEPS_STAGING_PUBLISHABLE_KEY: process.env.SAFESTEPS_STAGING_PUBLISHABLE_KEY || "staging-publishable-placeholder",
  SAFESTEPS_STAGING_CASE_ID: process.env.SAFESTEPS_STAGING_CASE_ID || "00000000-0000-0000-0000-000000000000",
  SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON: process.env.SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON || JSON.stringify({
    parent: { email: "parent+synthetic@example.test", password: "placeholder123" },
    child: { email: "child+synthetic@example.test", password: "placeholder123" },
    caseworker: { email: "caseworker+synthetic@example.test", password: "placeholder123" },
    supervisor: { email: "supervisor+synthetic@example.test", password: "placeholder123" },
    court_viewer: { email: "court-viewer+synthetic@example.test", password: "placeholder123" },
    unrelated: { email: "unrelated+synthetic@example.test", password: "placeholder123" },
  }),
  SAFESTEPS_SECURITY_ADVISOR_REVIEWED_AT: process.env.SAFESTEPS_SECURITY_ADVISOR_REVIEWED_AT || "2026-10-29T00:00:00Z",
  SAFESTEPS_PERFORMANCE_ADVISOR_REVIEWED_AT: process.env.SAFESTEPS_PERFORMANCE_ADVISOR_REVIEWED_AT || "2026-10-29T00:00:00Z",
  SAFESTEPS_STAGING_JOURNEY_VERIFIED_AT: process.env.SAFESTEPS_STAGING_JOURNEY_VERIFIED_AT || "2026-10-29T00:00:00Z",
  SAFESTEPS_DEPENDENCY_AUDIT_REVIEWED_AT: process.env.SAFESTEPS_DEPENDENCY_AUDIT_REVIEWED_AT || "2026-10-29T00:00:00Z",
  SAFESTEPS_CREDENTIAL_ROTATION_CONFIRMED_AT: process.env.SAFESTEPS_CREDENTIAL_ROTATION_CONFIRMED_AT || "2026-10-29T00:00:00Z",
};

const result = spawnSync(process.execPath, [scriptPath], {
  env: { ...process.env, ...mockEnv },
  stdio: "inherit",
});

process.exit(result.status ?? 0);
