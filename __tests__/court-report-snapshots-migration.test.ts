import { readFileSync } from "node:fs";
import { join } from "node:path";

const migrationSql = readFileSync(
  join(process.cwd(), "supabase/migrations/20260715085349_court_report_snapshots.sql"),
  "utf8",
).toLowerCase();
const repairMigrationSql = readFileSync(
  join(process.cwd(), "supabase/migrations/20260716071701_repair_court_report_snapshots.sql"),
  "utf8",
).toLowerCase();
const approvalMigrationSql = readFileSync(
  join(process.cwd(), "supabase/migrations/20260716091243_add_court_report_supervisor_approvals.sql"),
  "utf8",
).toLowerCase();

describe("court report snapshots migration", () => {
  test("creates immutable snapshot records with hash-chain fields", () => {
    expect(migrationSql).toContain("create table if not exists public.court_report_snapshots");
    expect(migrationSql).toContain("snapshot_payload jsonb not null");
    expect(migrationSql).toContain("snapshot_hash text not null");
    expect(migrationSql).toContain("previous_snapshot_hash text");
    expect(migrationSql).toContain("hash_algorithm text not null default 'sha256'");
    expect(migrationSql).toContain("ready_for_final_export boolean not null default false");
    expect(migrationSql).toContain("export_readiness_blockers text[] not null default array[]::text[]");
    expect(migrationSql).toContain("unique (snapshot_hash)");
  });

  test("enforces authenticated RLS and append-only mutation blocking", () => {
    expect(migrationSql).toContain("alter table public.court_report_snapshots enable row level security");
    expect(migrationSql).toContain("for select to authenticated");
    expect(migrationSql).toContain("for insert to authenticated");
    expect(migrationSql).toContain("public.can_manage_assessments()");
    expect(migrationSql).toContain("public.reject_court_report_snapshot_mutation");
    expect(migrationSql).toContain("before update on public.court_report_snapshots");
    expect(migrationSql).toContain("before delete on public.court_report_snapshots");
  });

  test("includes a corrective replay migration for already-applied empty snapshot migration", () => {
    expect(repairMigrationSql).toContain("create table if not exists public.court_report_snapshots");
    expect(repairMigrationSql).toContain("alter table public.court_report_snapshots enable row level security");
    expect(repairMigrationSql).toContain("before update on public.court_report_snapshots");
    expect(repairMigrationSql).toContain("before delete on public.court_report_snapshots");
  });

  test("adds immutable supervisor approval records for report export", () => {
    expect(approvalMigrationSql).toContain("create table if not exists public.court_report_supervisor_approvals");
    expect(approvalMigrationSql).toContain("alter table public.court_report_supervisor_approvals enable row level security");
    expect(approvalMigrationSql).toContain("for insert to authenticated");
    expect(approvalMigrationSql).toContain("public.can_manage_assessments()");
    expect(approvalMigrationSql).toContain("before update on public.court_report_supervisor_approvals");
    expect(approvalMigrationSql).toContain("before delete on public.court_report_supervisor_approvals");
  });
});
