export type IntakeReviewerState = "not_required" | "pending" | "approved" | "changes_required";
export type ProgramRiskLevel = "low" | "medium" | "high" | "very_high" | "custom";

export const GUARDED_PROGRAM_CONTENT_PATHS = [
  "/programs/month",
  "/programs/week",
  "/programs/lesson",
  "/programs/reflection",
  "/program-lessons",
] as const;

export type ProgramStartGateSnapshot = {
  profileComplete: boolean;
  caseSetupComplete: boolean;
  intakeComplete: boolean;
  intakeCompletedAt: string | null;
  reviewerState: IntakeReviewerState;
  reviewerUserId: string | null;
  reviewedAt: string | null;
};

export type ProgramStartGateDecision = {
  allowed: boolean;
  requiresWorkerReview: boolean;
  blockers: Array<
    | "profile_required"
    | "case_setup_required"
    | "intake_required"
    | "worker_review_pending"
    | "worker_changes_required"
  >;
};

export function programRequiresWorkerReview(riskLevel: ProgramRiskLevel): boolean {
  return riskLevel === "high" || riskLevel === "very_high";
}

export function isGuardedProgramContentPath(pathname: string): boolean {
  const normalized = pathname.split(/[?#]/, 1)[0] || "/";
  return GUARDED_PROGRAM_CONTENT_PATHS.some(
    (path) => normalized === path || normalized.startsWith(`${path}/`),
  );
}

export function evaluateProgramStartGate(
  snapshot: ProgramStartGateSnapshot,
  riskLevel: ProgramRiskLevel,
): ProgramStartGateDecision {
  const blockers: ProgramStartGateDecision["blockers"] = [];
  const requiresWorkerReview = programRequiresWorkerReview(riskLevel);

  if (!snapshot.profileComplete) blockers.push("profile_required");
  if (!snapshot.caseSetupComplete) blockers.push("case_setup_required");
  if (!snapshot.intakeComplete || !snapshot.intakeCompletedAt) blockers.push("intake_required");

  if (requiresWorkerReview) {
    if (snapshot.reviewerState === "changes_required") {
      blockers.push("worker_changes_required");
    } else if (snapshot.reviewerState !== "approved") {
      blockers.push("worker_review_pending");
    }
  }

  return { allowed: blockers.length === 0, requiresWorkerReview, blockers };
}

export function blockerMessage(blocker: ProgramStartGateDecision["blockers"][number]): string {
  switch (blocker) {
    case "profile_required":
      return "Complete your SafeSteps profile before starting a program.";
    case "case_setup_required":
      return "Complete the required family and case setup before starting a program.";
    case "intake_required":
      return "Complete every required intake section before starting a program.";
    case "worker_review_pending":
      return "This higher-risk pathway requires worker review and approval before it can start.";
    case "worker_changes_required":
      return "Your intake review requires changes before this pathway can start.";
  }
}
