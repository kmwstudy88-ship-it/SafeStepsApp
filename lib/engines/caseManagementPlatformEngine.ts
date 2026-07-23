import { supabase } from "../supabase";

export type CaseManagementPlatformStatus = "implemented" | "requires_configuration" | "requires_review";

export type CaseManagementPlatform = {
  id: "case_management_platform";
  title: string;
  purpose: string;
  status: CaseManagementPlatformStatus;
  modules: string[];
  tables: string[];
  runtimeGates: string[];
};

export type CaseDecisionReadinessCheck = {
  hasFactualBasis?: boolean;
  hasParticipantViews?: boolean;
  isHighImpact?: boolean;
  hasSupervisorApproval?: boolean;
  aiAssisted?: boolean;
  hasAiReference?: boolean;
};

export type CaseTransferReadinessCheck = {
  hasCompletedHandover?: boolean;
  hasRecordsManifest?: boolean;
  familyNotified?: boolean;
  approved?: boolean;
};

export type CaseClosureReadinessCheck = {
  hasClosureSummary?: boolean;
  hasRecordsAccessSummary?: boolean;
  hasSupervisorApproval?: boolean;
  hasOpenCriticalTasks?: boolean;
  hasUnfinalisedHighImpactDecision?: boolean;
};

export const caseManagementPlatform: CaseManagementPlatform = {
  id: "case_management_platform",
  title: "Case Management Platform",
  purpose:
    "Provides SafeSteps operational case management for organisations, service programs, staff, teams, referrals, intake screening, family and case setup, allocations, structured handovers, case plans, tasks, appointments, visits, supervision, decisions, transfers, closure, and operational audit continuity.",
  status: "implemented",
  modules: [
    "organisations",
    "organisation_units",
    "service_programs",
    "staff_profiles",
    "teams",
    "referrals",
    "intake_screening",
    "families",
    "cases",
    "allocations",
    "handover",
    "case_plans",
    "family_disagreements",
    "tasks",
    "appointments",
    "visits",
    "supervision",
    "case_decisions",
    "case_transfers",
    "case_closure",
    "operational_audit",
  ],
  tables: [
    "organisation_units",
    "service_programs",
    "staff_profiles",
    "case_teams",
    "case_team_memberships",
    "referring_parties",
    "case_referrals",
    "case_referral_documents",
    "case_referral_screenings",
    "case_referral_decisions",
    "case_allocations_v19",
    "case_allocation_history_v19",
    "case_handover_records",
    "case_plans",
    "case_plan_goals_v19",
    "case_plan_actions_v19",
    "case_family_disagreements",
    "case_tasks",
    "case_appointments",
    "case_visit_records_v19",
    "case_supervision_reviews",
    "case_decision_records",
    "case_transfer_records",
    "case_closure_records",
    "case_operational_audit_events",
  ],
  runtimeGates: [
    "Case decisions require a factual basis and preserved participant views before finalisation.",
    "High-impact case decisions require supervisor approval and cannot be finalised by AI alone.",
    "AI-assisted case decisions must retain the AI output reference without making AI the final decision maker.",
    "Case transfers require completed handover, family notification, approval, and a records manifest.",
    "Case closure requires supervisor approval, records-access summary, and no unresolved urgent or critical tasks.",
    "Family disagreement is preserved as a separate record and is not automatically coded as refusal or lack of insight.",
  ],
};

export function evaluateCaseDecisionReadiness(check: CaseDecisionReadinessCheck) {
  const blockers: string[] = [];

  if (!check.hasFactualBasis) {
    blockers.push("Decision needs a factual basis.");
  }

  if (!check.hasParticipantViews) {
    blockers.push("Participant views or disagreement context must be preserved.");
  }

  if (check.isHighImpact && !check.hasSupervisorApproval) {
    blockers.push("High-impact decisions require supervisor approval.");
  }

  if (check.aiAssisted && !check.hasAiReference) {
    blockers.push("AI-assisted decisions must keep the AI output reference for audit.");
  }

  return {
    ready: blockers.length === 0,
    blockers,
  };
}

export function evaluateCaseTransferReadiness(check: CaseTransferReadinessCheck) {
  const blockers: string[] = [];

  if (!check.hasCompletedHandover) {
    blockers.push("Transfer needs a completed structured handover.");
  }

  if (!check.hasRecordsManifest) {
    blockers.push("Transfer needs a records manifest.");
  }

  if (!check.familyNotified) {
    blockers.push("Family notification must be recorded.");
  }

  if (!check.approved) {
    blockers.push("Transfer requires approval.");
  }

  return {
    ready: blockers.length === 0,
    blockers,
  };
}

export function evaluateCaseClosureReadiness(check: CaseClosureReadinessCheck) {
  const blockers: string[] = [];

  if (!check.hasClosureSummary) {
    blockers.push("Closure needs a case closure summary.");
  }

  if (!check.hasRecordsAccessSummary) {
    blockers.push("Closure needs a lawful records-access summary.");
  }

  if (!check.hasSupervisorApproval) {
    blockers.push("Closure requires supervisor approval.");
  }

  if (check.hasOpenCriticalTasks) {
    blockers.push("Open urgent or critical tasks must be resolved or explicitly transferred.");
  }

  if (check.hasUnfinalisedHighImpactDecision) {
    blockers.push("Unfinalised high-impact decisions must be reviewed before closure.");
  }

  return {
    ready: blockers.length === 0,
    blockers,
  };
}

export function getCaseManagementReadinessSummary() {
  return {
    implemented: caseManagementPlatform.status === "implemented" ? 1 : 0,
    total: 1,
    tableCount: caseManagementPlatform.tables.length,
    moduleCount: caseManagementPlatform.modules.length,
    runtimeGateCount: caseManagementPlatform.runtimeGates.length,
    readyForRuntimeIntegration: caseManagementPlatform.status === "implemented",
  };
}

export async function getCaseManagementLiveSummary() {
  const [casesResult, referralsResult, tasksResult] = await Promise.all([
    supabase.from("cases").select("id", { count: "exact", head: true }),
    supabase.from("case_referrals").select("id", { count: "exact", head: true }),
    supabase.from("case_tasks").select("id", { count: "exact", head: true }),
  ]);

  if (casesResult.error || referralsResult.error || tasksResult.error) {
    throw casesResult.error ?? referralsResult.error ?? tasksResult.error;
  }

  return {
    cases: casesResult.count ?? 0,
    referrals: referralsResult.count ?? 0,
    tasks: tasksResult.count ?? 0,
  };
}
