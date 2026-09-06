import fs from "node:fs";
import path from "node:path";

const LIVE_REF = "yzxotxbwgxnxemkzigse";
const REPO_ROOT = process.env.SAFESTEPS_REPO_ROOT ?? process.cwd();
const FIREBASE_DEPENDENCY_PREFIX = "@firebase/";
const FIREBASE_IMPORT_PATTERN =
  /\bfrom\s+["'](?:firebase(?:\/[^"']*)?|@firebase\/[^"']+)["']|\brequire\(\s*["'](?:firebase(?:\/[^"']*)?|@firebase\/[^"']+)["']\s*\)/;

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

function exists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function resolveRepoPath(...segments) {
  return path.resolve(REPO_ROOT, ...segments);
}

function validateNoFirebaseDependencies() {
  const packageJsonPath = resolveRepoPath("package.json");
  if (!exists(packageJsonPath)) {
    fail(`Release gate could not find package.json at ${packageJsonPath}.`);
    return;
  }

  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  } catch (error) {
    fail(`Release gate could not parse package.json: ${error.message}`);
    return;
  }

  for (const group of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
    for (const dependencyName of Object.keys(packageJson[group] ?? {})) {
      if (dependencyName === "firebase" || dependencyName.startsWith(FIREBASE_DEPENDENCY_PREFIX)) {
        fail(`Firebase dependency detected in ${group}: ${dependencyName}.`);
      }
    }
  }
}

function validateNoFirebaseRuntimeImports() {
  const roots = ["app", "lib", "backend", "components", "utils"]
    .map((segment) => resolveRepoPath(segment))
    .filter(exists);
  const offenders = [];

  function walk(rootPath) {
    for (const entry of fs.readdirSync(rootPath, { withFileTypes: true })) {
      if (entry.isDirectory() && [".git", ".expo", "node_modules"].includes(entry.name)) {
        continue;
      }
      const filePath = path.join(rootPath, entry.name);
      if (entry.isDirectory()) {
        walk(filePath);
      } else if (entry.isFile() && /\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
        if (FIREBASE_IMPORT_PATTERN.test(fs.readFileSync(filePath, "utf8"))) {
          offenders.push(filePath);
        }
      }
      if (offenders.length >= 5) return;
    }
  }

  for (const root of roots) {
    walk(root);
    if (offenders.length >= 5) break;
  }

  if (offenders.length > 0) {
    fail(`Firebase runtime imports detected in release build paths: ${offenders.join(", ")}.`);
  }
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

validateNoFirebaseDependencies();
validateNoFirebaseRuntimeImports();

if (process.exitCode) {
  console.error("Production readiness gate failed closed.");
  process.exit(process.exitCode);
}

console.log("Production readiness gate passed required staging, advisor, dependency, credential-rotation, and Firebase-removal checks.");
