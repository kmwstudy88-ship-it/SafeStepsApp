export type IntakeReviewerState = "not_required" | "pending" | "approved" | "changes_required";
export type ProgramRiskLevel = "low" | "medium" | "high" | "very_high" | "custom";

export const GUARDED_PROGRAM_CONTENT_PATHS = [
  "/programs/month",
  "/programs/week",
  "/programs/lesson",
  "/programs/reflection",
  "/program-lessons",
] as const;

export type ProgramStartGate