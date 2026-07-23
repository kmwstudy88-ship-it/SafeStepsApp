import { supabase } from "../supabase";

export type ChildExperiencePlatformStatus = "implemented" | "requires_configuration" | "requires_review";

export type ChildExperiencePlatform = {
  id: "child_experience_platform";
  title: string;
  purpose: string;
  status: ChildExperiencePlatformStatus;
  modules: string[];
  tables: string[];
  runtimeGates: string[];
};

export type ChildSharingReadinessCheck = {
  childApproved?: boolean;
  parentAccessBlocked?: boolean;
  safetyOverrideRequested?: boolean;
  safetyOverrideConfirmed?: boolean;
  childInformed?: boolean;
};

export type ChildSupportRequestClosureCheck = {
  hasChildFriendlyResponse?: boolean;
  responseExplainsNextStep?: boolean;
  childUnderstandingChecked?: boolean;
  urgentRequest?: boolean;
  humanReviewCompleted?: boolean;
};

export type ChildLessonCompletionCheck = {
  activeTimeSeconds?: number;
  safetyConcernDetected?: boolean;
  safetyConcernReviewed?: boolean;
};

export const childExperiencePlatform: ChildExperiencePlatform = {
  id: "child_experience_platform",
  title: "Child Experience Platform",
  purpose:
    "Provides SafeSteps child-facing accounts, developmental adaptation, privacy settings, feelings check-ins, My Story, wishes and views, visit preparation and reflection, child learning, activities, games, achievements, journals, controlled sharing, requests, complaints, advocacy, child-friendly explanations, safety review, and audit views.",
  status: "implemented",
  modules: [
    "child_accounts",
    "development_profiles",
    "interface_profiles",
    "consent_and_assent",
    "privacy_profiles",
    "sharing_preferences",
    "dashboard",
    "feelings",
    "body_maps",
    "support_requests",
    "safe_people",
    "safe_places",
    "child_safety_plans",
    "my_story",
    "wishes_and_views",
    "choices",
    "visit_preparation",
    "visit_reflection",
    "visit_preferences",
    "child_learning",
    "activities",
    "games",
    "daily_tasks",
    "achievements",
    "strengths",
    "personal_goals",
    "journals",
    "controlled_sharing",
    "child_friendly_decisions",
    "notifications",
    "safety_signals",
    "corrections",
    "complaints",
    "advocacy",
  ],
  tables: [
    "child_accounts",
    "child_development_profiles_v20",
    "child_interface_profiles",
    "child_consent_assent_records",
    "child_privacy_profiles",
    "child_sharing_preferences",
    "child_dashboard_configurations",
    "child_feeling_definitions",
    "child_body_map_responses",
    "child_support_requests",
    "child_support_request_responses",
    "child_safe_places",
    "child_friendly_safety_plans",
    "child_storybooks",
    "child_storybook_pages",
    "child_wishes_views",
    "child_choice_records",
    "child_visit_experience_reflections",
    "child_visit_preferences",
    "child_learning_enrolments",
    "child_lesson_sessions",
    "child_activity_responses",
    "child_learning_games",
    "child_game_sessions",
    "child_game_session_participants",
    "child_daily_tasks",
    "child_task_responses",
    "child_achievement_definitions",
    "child_achievement_awards_v20",
    "child_strength_records",
    "child_personal_goals",
    "child_goal_progress_records",
    "child_journals",
    "child_journal_entries",
    "child_content_sharing_requests",
    "child_decision_explanations",
    "child_notifications",
    "child_platform_sessions",
    "child_session_support_events",
    "child_content_safety_reviews",
    "child_experience_safety_signals",
    "child_experience_safety_signal_reviews",
    "child_record_corrections",
    "child_complaints",
    "child_complaint_responses",
    "child_advocacy_requests",
  ],
  runtimeGates: [
    "Child content sharing requires child approval unless a confirmed safety override applies.",
    "Parent access is blocked when a child privacy profile blocks parent access.",
    "Emergency sharing overrides require confirmed human safety review and child-informed audit records.",
    "Child support requests cannot close without a child-friendly response.",
    "Urgent child requests require human review before closure.",
    "Child lesson completion does not require a correct emotional answer.",
    "Private journals are child-only unless sharing is specifically approved or safety review is governed.",
    "AI must not independently decide whether a child is truthful.",
  ],
};

export function evaluateChildSharingReadiness(check: ChildSharingReadinessCheck) {
  const blockers: string[] = [];

  if (check.parentAccessBlocked && !check.safetyOverrideRequested) {
    blockers.push("Parent access is blocked by the child privacy profile.");
  }

  if (check.safetyOverrideRequested) {
    if (!check.safetyOverrideConfirmed) {
      blockers.push("Safety override needs confirmed human review.");
    }
    if (!check.childInformed) {
      blockers.push("Child must be informed of an emergency sharing override where safe and lawful.");
    }
  } else if (!check.childApproved) {
    blockers.push("Child-controlled sharing requires child approval.");
  }

  return {
    ready: blockers.length === 0,
    blockers,
  };
}

export function evaluateChildSupportRequestClosure(check: ChildSupportRequestClosureCheck) {
  const blockers: string[] = [];

  if (!check.hasChildFriendlyResponse) {
    blockers.push("Request needs a child-friendly response.");
  }

  if (!check.responseExplainsNextStep) {
    blockers.push("Response must explain the next step or outcome.");
  }

  if (!check.childUnderstandingChecked) {
    blockers.push("Child understanding should be checked before closure.");
  }

  if (check.urgentRequest && !check.humanReviewCompleted) {
    blockers.push("Urgent child requests require completed human review.");
  }

  return {
    ready: blockers.length === 0,
    blockers,
  };
}

export function evaluateChildLessonCompletion(check: ChildLessonCompletionCheck) {
  const blockers: string[] = [];

  if (!check.activeTimeSeconds || check.activeTimeSeconds <= 0) {
    blockers.push("Lesson needs active child participation time.");
  }

  if (check.safetyConcernDetected && !check.safetyConcernReviewed) {
    blockers.push("Safety concern must be reviewed before lesson completion.");
  }

  return {
    ready: blockers.length === 0,
    blockers,
  };
}

export function getChildExperienceReadinessSummary() {
  return {
    implemented: childExperiencePlatform.status === "implemented" ? 1 : 0,
    total: 1,
    tableCount: childExperiencePlatform.tables.length,
    moduleCount: childExperiencePlatform.modules.length,
    runtimeGateCount: childExperiencePlatform.runtimeGates.length,
    readyForRuntimeIntegration: childExperiencePlatform.status === "implemented",
  };
}

export async function getChildExperienceLiveSummary() {
  const [accountsResult, requestsResult, safetySignalsResult] = await Promise.all([
    supabase.from("child_accounts").select("id", { count: "exact", head: true }),
    supabase.from("child_support_requests").select("id", { count: "exact", head: true }),
    supabase.from("child_experience_safety_signals").select("id", { count: "exact", head: true }),
  ]);

  if (accountsResult.error || requestsResult.error || safetySignalsResult.error) {
    throw accountsResult.error ?? requestsResult.error ?? safetySignalsResult.error;
  }

  return {
    accounts: accountsResult.count ?? 0,
    supportRequests: requestsResult.count ?? 0,
    safetySignals: safetySignalsResult.count ?? 0,
  };
}
