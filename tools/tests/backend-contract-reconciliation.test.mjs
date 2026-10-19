import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { authorizationChecks, reconcileBackendContracts } from "../reconcile-backend-contracts.mjs";

const projectRef = "yzxotxbwgxnxemkzigse";
const baseline = JSON.parse(fs.readFileSync(new URL("../../docs/architecture/safesteps-schema-snapshot.json", import.meta.url)));
function input() {
  return {
    projectRef,
    baseline,
    capture: {
      ...structuredClone(baseline),
      helpers: baseline.helpers.map((row) => ({
        ...row,
        arguments: row.arguments ?? /^CREATE OR REPLACE FUNCTION public\.[a-z_]+\((.*?)\)\s*\n RETURNS /s.exec(row.definition)[1],
      })),
      capture_schema_version: 1,
      captured_at: "2026-10-08T00:00:00Z",
      column_grants: [],
      function_grants: [],
    },
    migrationFiles: ["20260911232000_compatibility_views.sql", "20260911232000_consolidate_models.sql"],
    now: new Date("2026-10-08T01:00:00Z"),
  };
}

test("unchanged metadata cannot release case-linked workflows or claim actor tests", () => {
  const report = reconcileBackendContracts(input());
  assert.equal(report.status, "blocked");
  assert.equal(report.productionReady, false);
  assert.deepEqual(report.differences.policies.changed, []);
  assert.equal(report.assessmentPolicies.length, 7);
  assert.ok(report.assessmentCaseConstraints.some((row) => row.definition.includes("reunification_cases")));
  assert.ok(report.assessmentGrants.some((row) => row.grantee === "anon" && row.privilege_type === "TRUNCATE"));
  assert.deepEqual(report.authorizationChecks.map((row) => row.id), authorizationChecks);
  assert.ok(report.authorizationChecks.every((row) => row.status === "not_run"));
});

test("reports policy, grant, FK, helper, alias and security-invoker drift", () => {
  const data = input();
  const policy = data.capture.policies.find((row) => row.tablename === "assessment_records");
  policy.qual = "true";
  data.capture.grants = data.capture.grants.filter((row) => row.table_name !== "assessment_records");
  const fk = data.capture.constraints.find((row) =>
    row.table_name === "assessment_records" && row.definition.includes("reunification_cases"));
  fk.definition = fk.definition.replace("reunification_cases", "cases");
  data.capture.helpers[0].definition += "\n-- changed";
  const view = data.capture.views.find((row) => row.relname === "case_assignments");
  view.reloptions = ["security_invoker=false"];
  view.definition = "SELECT user_id, assignment_role FROM users";
  const report = reconcileBackendContracts(data);
  assert.ok(report.differences.policies.changed.length);
  assert.ok(report.differences.grants.missing.length);
  assert.ok(report.differences.constraints.changed.length);
  assert.ok(report.differences.helpers.changed.length);
  assert.ok(report.differences.views.changed.length);
  assert.equal(report.allocationView.reloptions[0], "security_invoker=false");
});

test("migration collisions and unapplied versions are explicit, never auto-applied", () => {
  const report = reconcileBackendContracts(input());
  assert.equal(report.migrations.duplicateRepositoryVersions.length, 1);
  assert.deepEqual(report.migrations.repositoryOnly, ["20260911232000"]);
  assert.ok(report.migrations.deployedOnly.length);
});

test("rejects wrong-project, malformed, future, partial and duplicate evidence", () => {
  for (const mutate of [
    (data) => { data.projectRef = undefined; },
    (data) => { data.capture.project_id = "anotherprojectrefxxxx"; },
    (data) => { delete data.capture.capture_schema_version; },
    (data) => { data.capture.captured_at = "not-a-date"; },
    (data) => { data.capture.captured_at = "2100-01-01T00:00:00Z"; },
    (data) => { delete data.capture.function_grants; },
    (data) => { data.capture.constraints = []; },
    (data) => { data.capture.policies.push(data.capture.policies[0]); },
  ]) {
    const data = input();
    mutate(data);
    assert.throws(() => reconcileBackendContracts(data));
  }
});

test("dictionary order is irrelevant; missing relations and added views are reported", () => {
  const data = input();
  data.capture.policies.reverse();
  data.capture.relations = data.capture.relations.filter((row) => row.name !== "assessment_records");
  data.capture.views.push({ relname: "new_view", definition: "SELECT 1", reloptions: [] });
  const report = reconcileBackendContracts(data);
  assert.deepEqual(report.differences.policies.changed, []);
  assert.ok(report.differences.relations.missing.some((key) => key.includes("assessment_records")));
  assert.ok(report.differences.views.added.some((key) => key.includes("new_view")));
});

test("capture-only privilege dictionaries are not represented as baseline-verified", () => {
  const report = reconcileBackendContracts(input());
  assert.equal(report.differences.function_grants.baselineAvailable, false);
  assert.equal(report.differences.column_grants.baselineAvailable, false);
});

test("column type and nullability changes are reported despite type spelling differences", () => {
  const data = input();
  const column = data.capture.columns.find((row) => row.table_name === "assessment_records" && row.column_name === "case_id");
  column.data_type = "different presentation";
  assert.deepEqual(reconcileBackendContracts(data).differences.columns.changed, []);
  column.udt_name = "text";
  column.is_nullable = column.is_nullable === "YES" ? "NO" : "YES";
  assert.ok(reconcileBackendContracts(data).differences.columns.changed.some((key) => key.includes("case_id")));
});

test("additional policies, grants, columns and helper overloads in covered scopes require review", () => {
  const data = input();
  data.capture.policies.push({
    schemaname: "public", tablename: "assessment_records", policyname: "new_allow_all",
    permissive: "PERMISSIVE", roles: "{authenticated}", cmd: "ALL", qual: "true", with_check: "true",
  });
  data.capture.grants.push({
    table_schema: "public", table_name: "assessment_records", grantee: "PUBLIC", privilege_type: "TRUNCATE",
  });
  data.capture.columns.push({ table_name: "profiles", column_name: "new_authority_flag" });
  data.capture.helpers.push({ ...data.capture.helpers[0], arguments: "new_arg text" });
  const report = reconcileBackendContracts(data);
  for (const section of ["policies", "grants", "columns", "helpers"]) {
    assert.ok(report.differences[section].additionalInBaselineScope.length);
  }
  assert.equal(report.assessmentPolicies.length, 8);
});

test("capture SQL is read-only and uses catalogs rather than application records", () => {
  const sql = fs.readFileSync(new URL("../../supabase/tests/capture_backend_contract_metadata.sql", import.meta.url), "utf8");
  const executable = sql.replace(/--.*$/gm, "");
  assert.match(executable, /begin isolation level repeatable read read only/i);
  assert.match(executable, /rollback;/i);
  assert.doesNotMatch(executable, /\b(create|alter|drop|insert|update|delete|truncate|grant|revoke)\b/i);
  assert.doesNotMatch(executable, /\bfrom\s+(?:public|auth)\./i);
  assert.match(executable, /supabase_migrations\.schema_migrations/);
  for (const section of ["column_grants", "function_grants", "policies", "triggers"]) {
    assert.ok(sql.includes(`'${section}'`));
  }
});

test("CLI rejects baseline-as-live evidence and missing capture files without network access", () => {
  for (const args of [
    [],
    ["docs\\architecture\\safesteps-schema-snapshot.json", "--project-ref", projectRef],
    ["missing-capture.json", "--project-ref", projectRef],
  ]) {
    const result = spawnSync(process.execPath, ["tools\\reconcile-backend-contracts.mjs", ...args], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /failed closed/);
    assert.equal(result.stdout, "");
  }
});

test("CLI emits a blocked report for a valid capture and compares actual repository migration filenames", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "safesteps-contract-test-"));
  const capturePath = path.join(directory, "capture.json");
  try {
    const data = input();
    data.capture.captured_at = new Date(Date.now() - 1000).toISOString();
    fs.writeFileSync(capturePath, JSON.stringify(data.capture));
    const result = spawnSync(process.execPath, [
      "tools\\reconcile-backend-contracts.mjs", capturePath, "--project-ref", projectRef,
    ], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.equal(result.stderr, "");
    const report = JSON.parse(result.stdout);
    assert.equal(report.status, "blocked");
    assert.equal(report.productionReady, false);
    const collision = report.migrations.duplicateRepositoryVersions.find((row) => row.version === "20260911232000");
    assert.ok(collision.files.includes("20260911232000_compatibility_views.sql"));
    assert.ok(collision.files.includes("20260911232000_consolidate_visit_messaging_evidence_assessment_models.sql"));
  } finally {
    fs.rmSync(capturePath, { force: true });
    fs.rmdirSync(directory);
  }
});
