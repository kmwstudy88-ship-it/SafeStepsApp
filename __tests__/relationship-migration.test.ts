import fs from "fs";
import path from "path";

const migrationPath = path.join(
  process.cwd(),
  "supabase",
  "migrations",
  "20260703061540_add_relationship_assessment_layer.sql",
);

describe("relationship assessment migration", () => {
  const sql = fs.readFileSync(migrationPath, "utf8");

  test("creates relationship assessment and observation tables", () => {
    expect(sql).toContain("create table if not exists public.relationship_assessments");
    expect(sql).toContain("create table if not exists public.relationship_observations");
    expect(sql).toContain("references public.reunification_cases(id)");
  });

  test("enables RLS and uses authenticated policies", () => {
    expect(sql).toContain("alter table public.relationship_assessments enable row level security");
    expect(sql).toContain("alter table public.relationship_observations enable row level security");
    expect(sql).toContain("to authenticated");
    expect(sql).toContain("public.can_manage_assessments()");
    expect(sql).toContain("(select auth.uid()) = owner_id");
  });
});
