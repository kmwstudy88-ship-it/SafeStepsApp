import { createClient } from "@supabase/supabase-js";

const LIVE_REF = "yzxotxbwgxnxemkzigse";
const REQUIRED_ROLES = ["parent", "child", "caseworker", "supervisor", "court_viewer", "unrelated"];
const SYNTHETIC_EMAIL_PATTERN = /(^|[+._-])(synthetic|staging|fixture|test)([+._-]|@)/i;

const url = process.env.SAFESTEPS_STAGING_URL;
const serviceRoleKey = process.env.SAFESTEPS_STAGING_SERVICE_ROLE_KEY;
const credentials = JSON.parse(process.env.SAFESTEPS_STAGING_ROLE_CREDENTIALS_JSON ?? "{}");
const apply = process.env.SAFESTEPS_STAGING_AUTH_BOOTSTRAP_APPLY === "true";

function fail(message) {
  console.error(message);
  process.exit(1);
}

function decodeJwtPayload(jwt) {
  const [, payload] = String(jwt).split(".");
  if (!payload) return {};
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
}

function assertStagingTarget() {
  if (!url || !serviceRoleKey) {
    fail("Set SAFESTEPS_STAGING_URL and SAFESTEPS_STAGING_SERVICE_ROLE_KEY. Do not use production credentials.");
  }

  const host = new URL(url).host;
  if (host.includes(LIVE_REF)) {
    fail("Refusing to run Auth bootstrap against the production SafeSteps project.");
  }

  const payload = decodeJwtPayload(serviceRoleKey);
  if (payload.ref === LIVE_REF) {
    fail("Refusing to run Auth bootstrap with a production service-role key.");
  }

  if (payload.role !== "service_role") {
    fail("SAFESTEPS_STAGING_SERVICE_ROLE_KEY must be a Supabase service-role key for the staging project.");
  }
}

function assertControlledCredential(role, credential) {
  if (!credential?.email || !credential?.password) {
    fail(`Missing email/password for staging role '${role}'.`);
  }

  if (!SYNTHETIC_EMAIL_PATTERN.test(credential.email)) {
    fail(`Refusing to touch '${credential.email}'. Controlled staging emails must include synthetic, staging, fixture, or test.`);
  }

  if (credential.password.length < 12) {
    fail(`Password for '${role}' is too short for controlled staging verification.`);
  }
}

async function findUserByEmail(admin, email) {
  let page = 1;
  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if (data.users.length < 200) return null;
    page += 1;
  }
  throw new Error("Stopped after scanning 4000 Auth users; narrow the staging fixture set before bootstrapping.");
}

assertStagingTarget();

for (const role of REQUIRED_ROLES) assertControlledCredential(role, credentials[role]);

const admin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const results = [];

for (const role of REQUIRED_ROLES) {
  const credential = credentials[role];
  const existing = await findUserByEmail(admin, credential.email);

  if (!apply) {
    results.push({ role, email: credential.email, action: existing ? "would_reset_password" : "would_create_user" });
    continue;
  }

  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password: credential.password,
      email_confirm: true,
      user_metadata: { ...(existing.user_metadata ?? {}), safesteps_fixture_role: role },
      app_metadata: { ...(existing.app_metadata ?? {}), safesteps_fixture: true, safesteps_fixture_role: role },
    });
    if (error) throw error;
    results.push({ role, email: credential.email, action: "reset_password", userId: existing.id });
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: credential.email,
      password: credential.password,
      email_confirm: true,
      user_metadata: { safesteps_fixture_role: role },
      app_metadata: { safesteps_fixture: true, safesteps_fixture_role: role },
    });
    if (error) throw error;
    results.push({ role, email: credential.email, action: "created_user", userId: data.user?.id ?? null });
  }
}

for (const result of results) console.log(JSON.stringify(result));
console.log(apply ? "Controlled staging Auth bootstrap complete." : "Dry run complete. Set SAFESTEPS_STAGING_AUTH_BOOTSTRAP_APPLY=true to apply.");
