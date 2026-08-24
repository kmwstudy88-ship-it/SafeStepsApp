export type LaunchCheckStatus = "pass" | "fail" | "pending";
export interface LaunchReadinessCheck { area: string; status: LaunchCheckStatus; owner?: string; notes?: string; evidenceReference?: string; required: boolean }

export const REQUIRED_LAUNCH_AREAS = [
  "Product limitations copy", "Core safety flows", "Critical safety behaviour", "Classifier regression suite", "Output validator", "Human handoff", "Database RLS and retention", "Referral verification", "Controlled family memory", "Crisis-safe UI", "Minimal staff dashboard", "Incident response", "Governance approvals", "Australian jurisdiction review", "Privacy impact assessment", "Launch communication", "Accessibility and cultural adaptation", "Monitoring and metrics", "Safety regression suite", "Rollback readiness", "Staff training", "User safety exits", "Deletion and export",
] as const;

export const REQUIRED_SIGNOFF_ROLES = ["safeguarding_lead", "clinical_reviewer", "privacy_security_reviewer", "engineering_lead", "product_owner", "jurisdiction_reviewer", "dv_specialist", "substance_use_specialist", "child_safety_reviewer"] as const;

export function evaluateLaunchReadiness(input: { checks: LaunchReadinessCheck[]; approvedSignoffRoles: string[]; unresolvedSev1Count: number }) {
  const byArea = new Map(input.checks.map((check) => [check.area, check]));
  const blockers: string[] = [];
  for (const area of REQUIRED_LAUNCH_AREAS) {
    const check = byArea.get(area);
    if (!check) blockers.push("Missing required check: " + area);
    else if (check.status !== "pass") blockers.push(area + ": " + check.status);
  }
  for (const role of REQUIRED_SIGNOFF_ROLES) if (!input.approvedSignoffRoles.includes(role)) blockers.push("Missing sign-off: " + role);
  if (input.unresolvedSev1Count > 0) blockers.push(input.unresolvedSev1Count + " unresolved Sev 1 incident(s)");
  return { decision: blockers.length === 0 ? "go" as const : "no_go" as const, blockers };
}
