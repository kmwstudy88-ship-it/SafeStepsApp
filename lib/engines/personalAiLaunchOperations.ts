export type LaunchDayTaskStatus = "pending" | "done" | "blocked";
export type LaunchSeverity = "critical" | "warning" | "normal";

export interface LaunchDayTask {
  id: string;
  checkpoint: "T-24" | "T-2" | "T0" | "T+1" | "T+4" | "EOD" | "72H";
  task: string;
  owner: string;
  status: LaunchDayTaskStatus;
  notes?: string;
}

export interface LaunchTelemetry {
  failedCriticalEscalations: number;
  unsafeOutputsShown: number;
  unauthorizedAccessEvents: number;
  handoffQueueProcessing: boolean;
  staleCrisisReferrals: number;
  quickExitFailures: number;
  validatorFailureRate: number;
  referralLookupFailures: number;
  p95LatencyMs: number;
  handoffBacklog: number;
}

export const LAUNCH_ROLES = [
  "Launch Commander", "Engineering Lead", "Safeguarding Lead", "Clinical Reviewer",
  "Privacy/Security Lead", "Referral Owner", "Support Lead",
] as const;

export const DEFAULT_LAUNCH_DAY_TASKS: LaunchDayTask[] = [
  { id: "freeze", checkpoint: "T-24", task: "Freeze non-essential changes and confirm rollback instructions", owner: "Launch Commander", status: "pending" },
  { id: "suite", checkpoint: "T-24", task: "Confirm safety suite and approvals are green", owner: "Engineering Lead", status: "pending" },
  { id: "production-config", checkpoint: "T-2", task: "Verify production secrets, migrations, monitoring and alerting", owner: "Engineering Lead", status: "pending" },
  { id: "referrals", checkpoint: "T-2", task: "Verify crisis contacts and referral seed data", owner: "Referral Owner", status: "pending" },
  { id: "smoke", checkpoint: "T0", task: "Run functional, safety and access-control smoke tests", owner: "Engineering Lead", status: "pending" },
  { id: "safety-review", checkpoint: "T+1", task: "Review safety events, validator failures and critical escalations", owner: "Safeguarding Lead", status: "pending" },
  { id: "queue-review", checkpoint: "T+1", task: "Review handoff queue and staff response coverage", owner: "Support Lead", status: "pending" },
  { id: "alert-review", checkpoint: "T+4", task: "Re-check alert channels and confirm no unresolved Sev 1 or Sev 2", owner: "Launch Commander", status: "pending" },
  { id: "eod", checkpoint: "EOD", task: "Record metrics and decide continue, patch, pause or rollback", owner: "Launch Commander", status: "pending" },
  { id: "review-72h", checkpoint: "72H", task: "Complete safety, referral, handoff and incident review", owner: "Clinical Reviewer", status: "pending" },
];

export function evaluateLaunchTelemetry(metrics: LaunchTelemetry) {
  const critical: string[] = [];
  const warnings: string[] = [];
  if (metrics.failedCriticalEscalations > 0) critical.push("A critical escalation failed");
  if (metrics.unsafeOutputsShown > 0) critical.push("Unsafe output was shown to a user");
  if (metrics.unauthorizedAccessEvents > 0) critical.push("Unauthorized access or RLS failure detected");
  if (!metrics.handoffQueueProcessing) critical.push("Handoff queue is not processing");
  if (metrics.staleCrisisReferrals > 0) critical.push("Stale crisis referral returned");
  if (metrics.quickExitFailures > 0) critical.push("Quick exit failed");
  if (metrics.validatorFailureRate > 0.05) warnings.push("Validator failure rate exceeds 5%");
  if (metrics.referralLookupFailures > 0) warnings.push("Referral lookup failures detected");
  if (metrics.p95LatencyMs > 4000) warnings.push("P95 latency exceeds 4 seconds");
  if (metrics.handoffBacklog > 10) warnings.push("Handoff backlog exceeds 10");
  return {
    severity: (critical.length ? "critical" : warnings.length ? "warning" : "normal") as LaunchSeverity,
    action: critical.length ? "rollback_or_safe_fallback" as const : warnings.length ? "investigate" as const : "continue_monitoring" as const,
    critical,
    warnings,
  };
}

export function operationalLaunchDecision(input: { coreGate: "go" | "no_go"; tasks: LaunchDayTask[]; telemetry: LaunchTelemetry; unresolvedSev2Count: number }) {
  const telemetry = evaluateLaunchTelemetry(input.telemetry);
  const blockers = input.tasks.filter((task) => task.status !== "done").map((task) => `${task.checkpoint} ${task.task}: ${task.status}`);
  if (input.coreGate !== "go") blockers.unshift("Core evidence and governance gate is NO-GO");
  if (input.unresolvedSev2Count > 0) blockers.push(`${input.unresolvedSev2Count} unresolved Sev 2 incident(s)`);
  blockers.push(...telemetry.critical);
  return { decision: blockers.length === 0 ? "go" as const : "no_go" as const, blockers, telemetry };
}
