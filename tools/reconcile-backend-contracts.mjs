import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sections = {
  relations: ["schema", "name"],
  columns: ["table_name", "column_name"],
  constraints: ["table_name", "conname"],
  policies: ["schemaname", "tablename", "policyname"],
  views: ["relname"],
  helpers: ["proname", "arguments"],
  triggers: ["table_name", "tgname"],
  grants: ["table_schema", "table_name", "grantee", "privilege_type"],
  column_grants: ["table_name", "column_name", "grantee", "privilege_type"],
  function_grants: ["proname", "arguments", "grantee", "privilege_type"],
  migrations: ["version"],
};

export const authorizationChecks = [
  "assigned_staff_read",
  "assigned_staff_draft_write",
  "scoped_supervisor_review",
  "parent_staff_assessment_write_denied",
  "child_staff_assessment_write_denied",
  "unassigned_staff_denied",
  "cross_case_denied",
  "cross_tenant_denied",
  "revoked_membership_denied",
  "expired_role_denied",
  "self_role_escalation_denied",
  "ownership_tenant_case_reassignment_denied",
  "finalized_assessment_mutation_denied",
  "anonymous_access_denied",
  "compatibility_view_rpc_storage_boundary",
  "service_role_endpoint_resource_boundary",
];

function keyFor(row, fields) {
  return JSON.stringify(fields.map((field) => row[field]));
}

function indexSection(rows, fields, label) {
  if (!Array.isArray(rows)) throw new Error(`${label} must be an array.`);
  const index = new Map();
  for (const row of rows) {
    if (!row || fields.some((field) => typeof row[field] !== "string")) {
      throw new Error(`${label} has a record with missing or invalid key fields.`);
    }
    const key = keyFor(row, fields);
    if (index.has(key)) throw new Error(`${label} has a duplicate key: ${key}.`);
    index.set(key, row);
  }
  return index;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function baselineProjection(section, row) {
  // The baseline used information_schema type names; capture uses pg_catalog types.
  // Compare the common fields only. Full capture-only fields still require review.
  const omitted = section === "columns" ? ["data_type"] : [];
  return Object.fromEntries(Object.entries(row).filter(([key]) => !omitted.includes(key)));
}

function baselineRows(section, rows) {
  if (section !== "helpers") return rows;
  return rows.map((row) => {
    if (typeof row.arguments === "string") return row;
    const match = /^CREATE OR REPLACE FUNCTION public\.[a-z_]+\((.*?)\)\s*\n RETURNS /s.exec(row.definition ?? "");
    if (!match) throw new Error(`Baseline helper signature is unavailable: ${row.proname}.`);
    return { ...row, arguments: match[1] };
  });
}

function dictionaryScope(row) {
  return row.table_name ?? row.tablename ?? row.proname;
}

export function reconcileBackendContracts({ capture, baseline, migrationFiles, projectRef, now = new Date() }) {
  if (!/^[a-z0-9]{20}$/.test(projectRef ?? "")) throw new Error("An explicit approved Supabase project ref is required.");
  if (capture?.capture_schema_version !== 1) throw new Error("Unsupported or missing capture_schema_version.");
  if (capture.project_id !== projectRef) throw new Error("Capture project does not match the approved project ref.");
  if (typeof capture.captured_at !== "string" || !Number.isFinite(Date.parse(capture.captured_at))) {
    throw new Error("Capture must include a valid captured_at timestamp.");
  }
  if (Date.parse(capture.captured_at) > now.getTime()) throw new Error("Capture timestamp is in the future.");
  const indexes = Object.fromEntries(Object.entries(sections).map(([section, fields]) => [
    section, indexSection(capture[section], fields, `capture.${section}`),
  ]));
  for (const section of ["relations", "columns", "constraints", "helpers", "migrations"]) {
    if (!capture[section].length) throw new Error(`capture.${section} is empty; capture is incomplete.`);
  }
  const differences = {};
  for (const [section, fields] of Object.entries(sections)) {
    if (!Array.isArray(baseline[section])) {
      differences[section] = { baselineAvailable: false, capturedCount: capture[section].length };
      continue;
    }
    const previous = indexSection(baselineRows(section, baseline[section]), fields, `baseline.${section}`);
    const missing = [];
    const changed = [];
    for (const [key, row] of previous) {
      const current = indexes[section].get(key);
      if (!current) {
        missing.push(key);
      } else {
        const expected = baselineProjection(section, row);
        const actual = Object.fromEntries(Object.keys(expected).map((field) => [field, current[field]]));
        if (JSON.stringify(stable(expected)) !== JSON.stringify(stable(actual))) changed.push(key);
      }
    }
    // Baseline dictionaries are selected-core only, except relations/views/migrations.
    const inventoryComplete = ["relations", "views", "migrations"].includes(section);
    const coveredScopes = new Set([...previous.values()].map(dictionaryScope));
    const extraKeys = [...indexes[section].keys()].filter((key) => !previous.has(key));
    differences[section] = {
      baselineAvailable: true, missing, changed,
      ...(inventoryComplete ? { added: extraKeys } : {
        additionalInBaselineScope: extraKeys.filter((key) => coveredScopes.has(dictionaryScope(indexes[section].get(key)))),
        limitation: "Additional records are not proof of new deployment; baseline dictionaries are partial.",
      }),
      capturedCount: capture[section].length,
    };
  }

  const filesByVersion = new Map();
  for (const file of migrationFiles) {
    const match = /^(\d+)_.+\.sql$/.exec(file);
    if (!match) throw new Error(`Invalid migration filename: ${file}.`);
    const list = filesByVersion.get(match[1]) ?? [];
    list.push(file);
    filesByVersion.set(match[1], list);
  }
  const deployedVersions = new Set(capture.migrations.map((row) => row.version));
  const assessmentCaseConstraints = capture.constraints.filter((row) =>
    row.table_name === "assessment_records" && row.contype === "f" &&
    /FOREIGN KEY\s*\(\s*case_id\s*\)/i.test(row.definition ?? "")
  );
  return {
    status: "blocked",
    productionReady: false,
    projectRef,
    capturedAt: capture.captured_at,
    baselineProjectRef: baseline.project_id,
    comparisonScope: "Baseline-present fields only; type spelling excluded. Additional catalog fields require review.",
    differences,
    migrations: {
      repositoryOnly: [...filesByVersion.keys()].filter((version) => !deployedVersions.has(version)).sort(),
      deployedOnly: [...deployedVersions].filter((version) => !filesByVersion.has(version)).sort(),
      duplicateRepositoryVersions: [...filesByVersion.entries()]
        .filter(([, files]) => files.length > 1).map(([version, files]) => ({ version, files })),
      limitation: "Matching versions do not prove matching SQL, checksums or deployment order.",
    },
    assessmentCaseConstraints,
    assessmentPolicies: capture.policies.filter((row) => row.tablename === "assessment_records"),
    assessmentGrants: capture.grants.filter((row) => row.table_name === "assessment_records"),
    allocationView: capture.views.find((row) => row.relname === "case_assignments") ?? null,
    blockers: [
      "Metadata does not establish a reviewed, complete, tenant-consistent case-pair crosswalk.",
      "All assessment policies, SQL/column grants, privileged helpers and finalized writes require reconciliation.",
      "Track C still uses deprecated identity/membership paths and conflicting allocation aliases.",
      "Allowed and denied actors have not been executed against the reconciled target schema.",
      "Catalog differences and migration-version collisions require administrator review before migration authoring.",
    ],
    authorizationChecks: authorizationChecks.map((id) => ({ id, status: "not_run" })),
  };
}

function main(args) {
  if (args.length !== 3 || args[1] !== "--project-ref") {
    throw new Error("Usage: node tools/reconcile-backend-contracts.mjs <capture.json> --project-ref <approved-ref>");
  }
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const report = reconcileBackendContracts({
    capture: JSON.parse(fs.readFileSync(args[0], "utf8")),
    baseline: JSON.parse(fs.readFileSync(path.join(root, "docs", "architecture", "safesteps-schema-snapshot.json"), "utf8")),
    migrationFiles: fs.readdirSync(path.join(root, "supabase", "migrations")).filter((file) => file.endsWith(".sql")),
    projectRef: args[2],
  });
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(`Backend contract reconciliation failed closed: ${error.message}`);
    process.exitCode = 1;
  }
}
