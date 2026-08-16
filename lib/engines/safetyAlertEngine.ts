export type AlertAudience = "parent" | "worker" | "supervisor" | "child_protection" | "on_call_worker";

export type SafetyAlertSeverity = "info" | "moderate" | "high" | "critical";

export type SafetyAlertType =
  | "missed_daily_check_in"
  | "consecutive_missed_check_ins"
  | "score_regression"
  | "financial_evidence_gap"
  | "high_severity_contradiction"
  | "child_safety_concern"
  | "crisis_button"
  | "course_overdue"
  | "missed_session"
  | "medication_missed"
  | "positive_milestone";

export type SafetyAlertRule = {
  type: SafetyAlertType;
  title: string;
  trigger: string;
  audience: AlertAudience[];
  severity: SafetyAlertSeverity;
  notificationType:
    | "safety_alert"
    | "risk_regression"
    | "compliance_gap"
    | "crisis_alert"
    | "lesson_due"
    | "session_alert"
    | "milestone";
};

export type SafetyAlertSignal = {
  missedDailyCheckIns?: number;
  consecutiveMissedCheckIns?: number;
  regressedDomains?: { domainId: string; currentScore: number; previousScore?: number }[];
  weeksSinceFinancialEvidence?: number;
  highSeverityContradiction?: boolean;
  childSafetyConcern?: boolean;
  crisisButtonActivated?: boolean;
  overdueLessons?: number;
  medicationMissed?: boolean;
  establishedDomains?: string[];
};

export type GeneratedSafetyAlert = SafetyAlertRule & {
  body: string;
  metadata: Record<string, unknown>;
};

export const safetyAlertRules: SafetyAlertRule[] = [
  {
    type: "missed_daily_check_in",
    title: "Missed daily check-in",
    trigger: "1 missed submission",
    audience: ["worker"],
    severity: "moderate",
    notificationType: "compliance_gap",
  },
  {
    type: "consecutive_missed_check_ins",
    title: "Consecutive missed check-ins",
    trigger: "3 missed submissions in a row",
    audience: ["worker", "supervisor"],
    severity: "high",
    notificationType: "compliance_gap",
  },
  {
    type: "score_regression",
    title: "Score regression",
    trigger: "Any scored domain drops below 2",
    audience: ["worker", "child_protection"],
    severity: "high",
    notificationType: "risk_regression",
  },
  {
    type: "financial_evidence_gap",
    title: "Financial evidence gap",
    trigger: "2 or more weeks missing",
    audience: ["worker"],
    severity: "moderate",
    notificationType: "compliance_gap",
  },
  {
    type: "high_severity_contradiction",
    title: "High-severity contradiction",
    trigger: "Flagged by worker",
    audience: ["supervisor"],
    severity: "high",
    notificationType: "safety_alert",
  },
  {
    type: "child_safety_concern",
    title: "Child safety concern",
    trigger: "Child check-in raises a safety flag",
    audience: ["worker", "child_protection"],
    severity: "critical",
    notificationType: "safety_alert",
  },
  {
    type: "crisis_button",
    title: "Crisis button activated",
    trigger: "Parent or child presses crisis support",
    audience: ["on_call_worker"],
    severity: "critical",
    notificationType: "crisis_alert",
  },
  {
    type: "course_overdue",
    title: "Course overdue",
    trigger: "Lesson not completed on schedule",
    audience: ["worker"],
    severity: "moderate",
    notificationType: "lesson_due",
  },
  {
    type: "missed_session",
    title: "Missed session",
    trigger: "Scheduled session was not completed",
    audience: ["worker", "supervisor"],
    severity: "high",
    notificationType: "session_alert",
  },
  {
    type: "medication_missed",
    title: "Medication missed",
    trigger: "Self-report indicates missed medication",
    audience: ["worker"],
    severity: "high",
    notificationType: "safety_alert",
  },
  {
    type: "positive_milestone",
    title: "Positive milestone reached",
    trigger: "Score reaches 4 in a domain",
    audience: ["worker"],
    severity: "info",
    notificationType: "milestone",
  },
];

function makeAlert(type: SafetyAlertType, body: string, metadata: Record<string, unknown>): GeneratedSafetyAlert {
  const rule = safetyAlertRules.find((candidate) => candidate.type === type);
  if (!rule) {
    throw new Error(`Unknown safety alert rule: ${type}`);
  }

  return { ...rule, body, metadata };
}

export function evaluateSafetyAlerts(signal: SafetyAlertSignal): GeneratedSafetyAlert[] {
  const alerts: GeneratedSafetyAlert[] = [];

  if ((signal.missedDailyCheckIns ?? 0) >= 1) {
    alerts.push(makeAlert("missed_daily_check_in", "A daily check-in was missed. Review engagement and safety context.", signal));
  }

  if ((signal.consecutiveMissedCheckIns ?? 0) >= 3) {
    alerts.push(makeAlert("consecutive_missed_check_ins", "Three or more daily check-ins were missed in a row. Supervisor review is recommended.", signal));
  }

  const regressedDomains = (signal.regressedDomains ?? []).filter((domain) => domain.currentScore < 2);
  if (regressedDomains.length > 0) {
    alerts.push(makeAlert("score_regression", "One or more assessment domains dropped below 2 and should not be averaged away.", { ...signal, regressedDomains }));
  }

  if ((signal.weeksSinceFinancialEvidence ?? 0) >= 2) {
    alerts.push(makeAlert("financial_evidence_gap", "Financial evidence has not been received for two or more weeks.", signal));
  }

  if (signal.highSeverityContradiction) {
    alerts.push(makeAlert("high_severity_contradiction", "A high-severity contradiction was recorded and needs supervisor review.", signal));
  }

  if (signal.childSafetyConcern) {
    alerts.push(makeAlert("child_safety_concern", "A child safety flag was raised. Follow service policy and human review immediately.", signal));
  }

  if (signal.crisisButtonActivated) {
    alerts.push(makeAlert("crisis_button", "A crisis support button was activated. Contact the on-call worker pathway immediately.", signal));
  }

  if ((signal.overdueLessons ?? 0) > 0) {
    alerts.push(makeAlert("course_overdue", "One or more scheduled lessons are overdue.", signal));
  }

  if (signal.medicationMissed) {
    alerts.push(makeAlert("medication_missed", "A missed medication dose was self-reported. Review care plan and support needs.", signal));
  }

  if ((signal.establishedDomains ?? []).length > 0) {
    alerts.push(makeAlert("positive_milestone", "A domain reached established practice. Prompt worker acknowledgement with the parent.", signal));
  }

  return alerts;
}
