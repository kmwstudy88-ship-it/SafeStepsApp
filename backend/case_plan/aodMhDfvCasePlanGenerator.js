import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(__dirname, "aod_mh_dfv_case_plan_template.json");

const OVERRIDE_TO_DOMAIN = {
  DFV1_HIGH: "DFV_SAFETY",
  DFV3_HIGH: "DFV_SAFETY",
  AOD4_HIGH: "AOD_IMPACT",
  MH2_HIGH: "MH_FUNCTIONAL",
  PA3_HIGH: "PERPETRATOR_ACCOUNTABILITY",
};

let templateCache = null;

export function loadAodMhDfvCasePlanTemplate() {
  if (!templateCache) {
    templateCache = JSON.parse(fs.readFileSync(TEMPLATE_PATH, "utf8"));
  }
  return templateCache;
}

function conditionMet(condition, domainScore, criticalOverrideActive) {
  if (condition === "any_score") return true;
  if (condition === "domain_score_above_25") return domainScore > 25;
  if (condition === "critical_override_active") return criticalOverrideActive;
  return false;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

export function generateCasePlanGoals(scoringResult, subjectRole, asOf = null) {
  const template = loadAodMhDfvCasePlanTemplate();
  const today = asOf ?? new Date().toISOString().slice(0, 10);
  const goals = [];
  const triggeredDomainCodes = new Set(
    scoringResult.triggeredOverrides.map((code) => OVERRIDE_TO_DOMAIN[code]).filter(Boolean),
  );

  for (const [domainCode, domainConfig] of Object.entries(template.domain_goal_types)) {
    const track = domainConfig.track;

    if (subjectRole === "protective_parent" && track === "perpetrator_track") continue;
    if (subjectRole === "perpetrator_tracked_separately" && track === "protective_parent_track") continue;

    const domainResult = scoringResult.domainResults[domainCode];
    if (!domainResult) continue;

    const criticalOverrideActive = triggeredDomainCodes.has(domainCode);
    for (const goalType of domainConfig.goal_types) {
      if (!conditionMet(goalType.trigger_condition, domainResult.normalizedScore, criticalOverrideActive)) continue;

      const isSafetyUrgent = criticalOverrideActive;
      goals.push({
        domainCode,
        track,
        phase: domainConfig.phase,
        goalTypeCode: goalType.goal_type_code,
        goalLabel: goalType.goal_label,
        reviewByDate: addDays(today, isSafetyUrgent ? 2 : goalType.review_frequency_days),
        isSafetyUrgent,
      });
    }
  }

  if (scoringResult.triggeredOverrides.length > 0) {
    goals.push({
      domainCode: "CROSS_DOMAIN",
      track: subjectRole === "perpetrator_tracked_separately" ? "perpetrator_track" : "protective_parent_track",
      phase: 1,
      goalTypeCode: "URGENT_SAFETY_REVIEW",
      goalLabel: `Urgent safety review required - triggered by: ${scoringResult.triggeredOverrides.join(", ")}`,
      reviewByDate: addDays(today, 2),
      isSafetyUrgent: true,
    });
  }

  return goals.sort((left, right) => {
    if (left.phase !== right.phase) return left.phase - right.phase;
    if (left.isSafetyUrgent !== right.isSafetyUrgent) return left.isSafetyUrgent ? -1 : 1;
    return left.domainCode.localeCompare(right.domainCode);
  });
}
