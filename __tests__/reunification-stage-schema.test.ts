import fs from "fs";
import path from "path";

describe("reunification stage quest achievement schema", () => {
  const sql = fs.readFileSync(
    path.join(__dirname, "..", "supabase", "migrations", "20260721083000_reunification_stage_quests_achievements.sql"),
    "utf8",
  );

  test("creates the normalized SafeSteps reunification schema foundation", () => {
    [
      "create table if not exists public.cases",
      "create table if not exists public.profile_cases",
      "create table if not exists public.contact_sessions",
      "create table if not exists public.facilitator_observations",
      "create table if not exists public.quests",
      "create table if not exists public.quest_progress",
      "create table if not exists public.achievements",
      "create table if not exists public.user_achievements",
      "create table if not exists public.reunification_recommendations",
      "create table if not exists public.reunification_overrides",
    ].forEach((statement) => expect(sql).toContain(statement));
  });

  test("keeps case-stage tables anchored to the formal cases table", () => {
    expect(sql).toContain("case_id uuid not null references public.cases(id) on delete cascade");
    expect(sql).toContain("foreign key (case_id) references public.cases(id) not valid");
  });

  test("enables row level security for quest, achievement, contact, recommendation, and override tables", () => {
    [
      "alter table public.contact_sessions enable row level security",
      "alter table public.quest_progress enable row level security",
      "alter table public.user_achievements enable row level security",
      "alter table public.reunification_recommendations enable row level security",
      "alter table public.reunification_overrides enable row level security",
    ].forEach((statement) => expect(sql).toContain(statement));
  });
});
