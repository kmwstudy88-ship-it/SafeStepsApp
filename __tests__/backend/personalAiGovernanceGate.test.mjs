import { evaluateLaunchGate, requiredLaunchAreas, requiredSignoffRoles } from "../../backend/Services/PersonalAiSupport/LaunchReadiness.js";

const checks = requiredLaunchAreas.map((area) => ({ area, status: "pass" }));
const approvals = requiredSignoffRoles.map((signoff_role) => ({ signoff_role, decision: "approved", signed_at: "2026-08-20T00:00:00Z" }));

test("complete approvals and evidence can pass the core evaluator", () => expect(evaluateLaunchGate(checks, approvals, 0)).toEqual({ decision: "go", blockers: [] }));
test("conditional approval blocks launch", () => { const signoffs = approvals.map((item) => item.signoff_role === "clinical_reviewer" ? { ...item, decision: "conditional" } : item); expect(evaluateLaunchGate(checks, signoffs, 0)).toMatchObject({ decision: "no_go" }); });
test("later explicit approval supersedes a conditional review log", () => { const signoffs = [...approvals, { signoff_role: "clinical_reviewer", decision: "conditional", signed_at: "2026-08-21T00:00:00Z" }, { signoff_role: "clinical_reviewer", decision: "approved", signed_at: "2026-08-22T00:00:00Z" }]; expect(evaluateLaunchGate(checks, signoffs, 0).blockers).not.toContain("Conditional approval unresolved: clinical_reviewer"); });
test("open Sev 1 incident blocks launch", () => expect(evaluateLaunchGate(checks, approvals, 1).decision).toBe("no_go"));
