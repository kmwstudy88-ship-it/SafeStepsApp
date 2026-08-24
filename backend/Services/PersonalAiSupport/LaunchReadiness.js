export const requiredLaunchAreas = ["Product limitations copy","Core safety flows","Critical safety behaviour","Classifier regression suite","Output validator","Human handoff","Database RLS and retention","Referral verification","Controlled family memory","Crisis-safe UI","Minimal staff dashboard","Incident response","Governance approvals","Australian jurisdiction review","Privacy impact assessment","Launch communication","Accessibility and cultural adaptation","Monitoring and metrics","Safety regression suite","Rollback readiness","Staff training","User safety exits","Deletion and export"];
export const requiredSignoffRoles = ["safeguarding_lead","clinical_reviewer","privacy_security_reviewer","engineering_lead","product_owner","jurisdiction_reviewer","dv_specialist","substance_use_specialist","child_safety_reviewer"];
export function evaluateLaunchGate(checks, signoffs, unresolvedSev1Count) {
  const byArea = new Map(checks.map((item) => [item.area, item])); const blockers = [];
  for (const area of requiredLaunchAreas) { const check = byArea.get(area); if (!check) blockers.push(`Missing required check: ${area}`); else if (check.status !== "pass") blockers.push(`${area}: ${check.status}`); }
  const latest = new Map();
  for (const signoff of [...signoffs].sort((a,b)=>String(a.signed_at??"").localeCompare(String(b.signed_at??"")))) latest.set(signoff.signoff_role,signoff);
  const current = [...latest.values()];
  const approvals = new Set(current.filter((item) => item.decision === "approved").map((item) => item.signoff_role));
  for (const signoff of current.filter((item) => item.decision === "conditional")) blockers.push(`Conditional approval unresolved: ${signoff.signoff_role}`);
  for (const signoff of current.filter((item) => item.decision === "rejected")) blockers.push(`Approval rejected: ${signoff.signoff_role}`);
  for (const role of requiredSignoffRoles) if (!approvals.has(role)) blockers.push(`Missing sign-off: ${role}`);
  if (unresolvedSev1Count > 0) blockers.push(`${unresolvedSev1Count} unresolved Sev 1 incident(s)`);
  return { decision: blockers.length ? "no_go" : "go", blockers };
}
