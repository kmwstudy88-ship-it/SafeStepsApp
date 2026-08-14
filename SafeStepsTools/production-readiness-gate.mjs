const LIVE_REF = "yzxotxbwgxnxemkzigse";

const required = [
  "SAFESTEPS_STAGING_URL",
  "SAFESTEPS_STAGING_PUBLISHABLE_KEY",
  "SAFESTEPS_STAGING_CASE_ID",
  "SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON",
  "SAFESTEPS_SECURITY_ADVISOR_REVIEWED_AT",
  "SAFESTEPS_PERFORMANCE_ADVISOR_REVIEWED_AT",
  "SAFESTEPS_STAGING_JOURNEY_VERIFIED_AT",
  "SAFESTEPS_DEPENDENCY_AUDIT_REVIEWED_AT",
  "SAFESTEPS_CREDENTIAL_ROTATION_CONFIRMED_AT",
];

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function hasIsoDate(value) {
  if (typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return false;
  return !Number.isNaN(Date.parse(value));
}

for (const name of required) {
  if (!process.env[name]) fail(`Missing release gate evidence: ${name}.`);
}

if (process.env.SAFESTEPS_STAGING_URL) {
  try {
    const host = new URL(process.env.SAFESTEPS_STAGING_URL).host;
    if (host.includes(LIVE_REF)) fail("Release gate refuses production Supabase ref for staging verification.");
  } catch {
    fail("SAFESTEPS_STAGING_URL must be a valid staging Supabase URL.");
  }
}

for (const name of [
  "SAFESTEPS_SECURITY_ADVISOR_REVIEWED_AT",
  "SAFESTEPS_PERFORMANCE_ADVISOR_REVIEWED_AT",
  "SAFESTEPS_STAGING_JOURNEY_VERIFIED_AT",
  "SAFESTEPS_DEPENDENCY_AUDIT_REVIEWED_AT",
  "SAFESTEPS_CREDENTIAL_ROTATION_CONFIRMED_AT",
]) {
  if (process.env[name] && !hasIsoDate(process.env[name])) {
    fail(`${name} must be an ISO-style date/time after the evidence has been reviewed.`);
  }
}

try {
  const credentials = JSON.parse(process.env.SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON ?? "{}");
  for (const role of ["parent", "child", "caseworker", "supervisor", "court_viewer", "unrelated"]) {
    if (!credentials[role]?.email || !credentials[role]?.password) {
      fail(`Missing controlled staging credential for ${role}.`);
    }
  }
} catch (error) {
  fail(`Invalid SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON: ${error.message}`);
}

if (process.exitCode) {
  console.error("Production readiness gate failed closed.");
  process.exit(process.exitCode);
}

console.log("Production readiness gate passed required staging, advisor, dependency, and credential-rotation evidence checks.");
