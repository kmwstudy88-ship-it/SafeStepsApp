import fs from "fs";
import path from "path";

describe("reunification role RLS policies", () => {
  const sql = fs.readFileSync(
    path.join(__dirname, "..", "supabase", "migrations", "20260721084500_reunification_role_rls_policies.sql"),
    "utf8",
  );

  test("defines auth helper functions for profile id, role, and case access", () => {
    expect(sql).toContain("create or replace function public.safesteps_auth_profile_id()");
    expect(sql).toContain("create or replace function public.safesteps_auth_role()");
    expect(sql).toContain("create or replace function public.safesteps_has_case_access(target_case_id uuid)");
  });

  test("enables RLS for the normalized reunification and game evidence tables", () => {
    [
      "alter table public.profiles enable row level security",
      "alter table public.contact_sessions enable row level security",
      "alter table public.facilitator_observations enable row level security",
      "alter table public.assessment_records enable row level security",
      "alter table public.quest_progress enable row level security",
      "alter table public.user_achievements enable row level security",
      "alter table public.reunification_recommendations enable row level security",
      "alter table public.reunification_overrides enable row level security",
    ].forEach((statement) => expect(sql).toContain(statement));
  });

  test("keeps parent, facilitator, caseworker, and admin permissions separated", () => {
    [
      "parent_manage_own_assessment_records",
      "facilitator_manage_contact_sessions",
      "caseworker_read_case_assessment_records",
      "caseworker_manage_overrides",
      "admin_manage_achievements",
    ].forEach((policyName) => expect(sql).toContain(policyName));
  });

  test("uses profile_cases and profile case_id for assigned-case access instead of a non-existent profile_cases parent_id", () => {
    expect(sql).toContain("from public.profile_cases pc");
    expect(sql).toContain("p.case_id = target_case_id");
    expect(sql).not.toContain("profile_cases.parent_id");
  });

  test("retires broad bootstrap policies before applying role-separated policies", () => {
    [
      "cases_assigned_case_access",
      "profile_cases_assigned_access",
      "contact_sessions_case_access",
      "facilitator_observations_session_access",
      "quests_read_authenticated",
      "quests_manage_admin",
      "achievements_read_authenticated",
      "achievements_manage_admin",
      "quest_progress_case_access",
      "user_achievements_case_access",
      "user_achievements_manage_system",
      "reunification_recommendations_case_access",
      "reunification_overrides_caseworker_access",
    ].forEach((policyName) => {
      expect(sql).toContain(`drop policy if exists ${policyName}`);
    });
  });
});
