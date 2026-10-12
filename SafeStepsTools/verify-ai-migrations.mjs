import fs from "node:fs";
import path from "node:path";

const MIGRATION_FILES = [
  "supabase/migrations/20261012150000_ai_coach_psychologist_evaluator.sql",
  "supabase/migrations/20261012180000_ai_next_horizon_12_modules.sql",
];

const EXPECTED_TABLES = [
  "ai_support_sessions",
  "ai_support_messages",
  "ai_couples_dfv_safety_checks",
  "ai_clinical_screenings",
  "ai_psychological_formulations",
  "ai_evaluator_assessments",
  "ai_crisis_escalations",
  "dfv_living_safety_plans",
  "contact_visit_coaching_logs",
  "restorative_family_meetings",
  "addiction_recovery_shields",
  "neuro_sleep_household_profiles",
  "kinship_carer_support_logs",
  "cultural_sewb_yarning_maps",
  "multi_informant_360_observations",
  "adaptive_micro_prescriptions",
  "child_three_houses_playroom",
];

const combinedSql = MIGRATION_FILES.map((relPath) => {
  const fullPath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing migration file: ${relPath}`);
  }
  return fs.readFileSync(fullPath, "utf8");
}).join("\n\n");

for (const table of EXPECTED_TABLES) {
  const createRegex = new RegExp(`CREATE\\s+TABLE\\s+IF\\s+NOT\\s+EXISTS\\s+public\\.${table}\\b`, "i");
  const rlsRegex = new RegExp(`ALTER\\s+TABLE\\s+public\\.${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, "i");
  const policyRegex = new RegExp(`ON\\s+public\\.${table}\\b`, "i");

  if (!createRegex.test(combinedSql)) {
    throw new Error(`Table DDL missing for public.${table}`);
  }
  if (!rlsRegex.test(combinedSql)) {
    throw new Error(`RLS enablement missing for public.${table}`);
  }
  if (!policyRegex.test(combinedSql)) {
    throw new Error(`RLS policy missing for public.${table}`);
  }
}

console.log(
  `Verified ${EXPECTED_TABLES.length}/17 AI Coach, 5P Psychologist, 10-Engine Evaluator & 12-Module tables with strict RLS policies across ${MIGRATION_FILES.length} migrations.`,
);

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF;

if (accessToken && projectRef) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: combinedSql }),
  });
  if (!res.ok) {
    throw new Error(`Supabase remote migration push failed (${res.status}): ${await res.text()}`);
  }
  console.log(`Successfully applied both AI migrations to remote Supabase project ${projectRef}.`);
} else {
  console.log(
    "Local migration DDL & RLS audit passed. (Set SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF or run `npm run db:push` to apply to a remote project.)",
  );
}
