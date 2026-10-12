export type HdosCoreObjectType =
  | "person"
  | "competency"
  | "activity"
  | "evidence"
  | "reasoning"
  | "outcome";

export type HdosActivityType =
  | "lesson"
  | "challenge"
  | "quiz"
  | "reflection"
  | "journal"
  | "conversation"
  | "simulation"
  | "scenario"
  | "upload"
  | "daily_task"
  | "home_visit"
  | "assessment"
  | "interview"
  | "observation"
  | "goal"
  | "practice"
  | "video"
  | "audio"
  | "worksheet";

export type HdosActivityStatus =
  | "assigned"
  | "started"
  | "in_progress"
  | "completed"
  | "reviewed"
  | "evidence_generated"
  | "competency_updated"
  | "report_updated"
  | "future_activities_generated";

export type HdosEvidenceStatus =
  | "draft"
  | "submitted"
  | "reviewed"
  | "accepted"
  | "needs_clarification"
  | "contradictory"
  | "insufficient"
  | "excluded_from_report";

export type HdosAiAgentId =
  | "learning_coach"
  | "evidence_assistant"
  | "reflection_coach"
  | "scenario_engine"
  | "report_assistant"
  | "quality_checker"
  | "recommendation_engine"
  | "review_assistant"
  | "accessibility_assistant";

export type HdosProgressDimension =
  | "learning_progress"
  | "competency_progress"
  | "evidence_progress"
  | "behaviour_progress"
  | "goal_progress"
  | "program_progress"
  | "engagement_progress"
  | "skill_retention"
  | "confidence_in_competency"
  | "evidence_sufficiency";

export type HdosQualityFlagSeverity = "info" | "warning" | "blocker";

export type HdosPerson = {
  id: string;
  identity: string;
  roles: string[];
  programs: string[];
  goals: string[];
  strengths: string[];
  needs: string[];
  supports: string[];
  history: string[];
  evidenceIds: string[];
  progressIds: string[];
  achievements: string[];
  reviewIds: string[];
  preferences: string[];
  accessibility: string[];
  culture: string[];
  language: string[];
  permissions: string[];
};

export type HdosCompetency = {
  id: string;
  definition: string;
  capabilities: string[];
  behaviours: string[];
  indicators: string[];
  evidenceIds: string[];
  thresholds: HdosQualityThresholds;
  growthLevels: string[];
  learningResources: string[];
  relatedCompetencyIds: string[];
  reviewRules: string[];
  aiCoachRules: string[];
  reportRules: string[];
};

export type HdosActivity = {
  id: string;
  personId: string;
  type: HdosActivityType;
  title: string;
  competencyIds: string[];
  status: HdosActivityStatus;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  reviewedAt?: string;
  generatedEvidenceIds: string[];
  generatedFutureActivityIds: string[];
};

export type HdosEvidence = {
  id: string;
  type: string;
  source: string;
  authorId: string;
  date: string;
  location?: string;
  context: string;
  competencyIds: string[];
  claimIds: string[];
  confidence: number;
  strength: number;
  reliability: number;
  status: HdosEvidenceStatus;
  reviewHistory: string[];
  attachmentIds: string[];
  permissions: string[];
  retention: string;
  independentSourceKey: string;
};

export type HdosReasoning = {
  id: string;
  evidenceIds: string[];
  pattern: string;
  finding: string;
  claim: string;
  confidence: number;
  recommendation: string;
  reviewable: boolean;
};

export type HdosOutcome = {
  id: string;
  personId: string;
  competencyId: string;
  pathway: string[];
  currentOutcome: string;
  evidenceIds: string[];
  reasoningIds: string[];
};

export type HdosReport = {
  id: string;
  reportType: "parent_report" | "worker_report" | "program_summary" | "court_relevant_summary";
  summary: string;
  strengths: string[];
  progress: string[];
  evidenceIds: string[];
  competencyIds: string[];
  outstandingAreas: string[];
  recommendations: string[];
  actionPlan: string[];
  nextReview: string;
};

export type HdosAiAgent = {
  id: HdosAiAgentId;
  purpose: string;
  allowedInputs: HdosCoreObjectType[];
  outputObjectType: HdosCoreObjectType | "report" | "activity";
  requiresHumanReview: boolean;
};

export type HdosProgressSnapshot = {
  personId: string;
  dimensions: Record<HdosProgressDimension, number>;
};

export type HdosTimeSummary = {
  firstDemonstrated?: string;
  mostRecentDemonstration?: string;
  numberOfDemonstrations: number;
  averageDaysBetweenDemonstrations?: number;
  evidenceTrend: "not_enough_data" | "declining" | "stable" | "improving";
  insufficientEvidencePeriods: string[];
  nextReviewDue?: string;
};

export type HdosQualityThresholds = {
  minimumEvidenceItems: number;
  minimumIndependentSources: number;
  maximumEvidenceAgeDays: number;
  minimumContextCount: number;
  humanReviewRequired: boolean;
};

export type HdosQualityFlag = {
  id: string;
  severity: HdosQualityFlagSeverity;
  message: string;
};

export const hdosCoreObjects: { objectType: HdosCoreObjectType; purpose: string }[] = [
  { objectType: "person", purpose: "The person is the anchor for identity, roles, programs, needs, supports, preferences, permissions, progress, evidence, and review." },
  { objectType: "competency", purpose: "Permanent capability areas that lessons and activities contribute toward but do not redefine." },
  { objectType: "activity", purpose: "Everything a user does, including lessons, challenges, reflections, observations, uploads, practice, and assessment." },
  { objectType: "evidence", purpose: "Structured outputs generated by activities with confidence, strength, reliability, status, permissions, and review history." },
  { objectType: "reasoning", purpose: "Reviewable explanation linking evidence to patterns, findings, claims, confidence, and recommendations." },
  { objectType: "outcome", purpose: "Longer-term development movement from knowledge through behaviour, consistency, improvement, and protective capacity." },
];

export const hdosActivityLifecycle: HdosActivityStatus[] = [
  "assigned",
  "started",
  "in_progress",
  "completed",
  "reviewed",
  "evidence_generated",
  "competency_updated",
  "report_updated",
  "future_activities_generated",
];

export const hdosAiAgents: HdosAiAgent[] = [
  {
    id: "learning_coach",
    purpose: "Explains concepts and supports lesson completion.",
    allowedInputs: ["person", "competency", "activity"],
    outputObjectType: "activity",
    requiresHumanReview: false,
  },
  {
    id: "evidence_assistant",
    purpose: "Organises and categorises submitted evidence.",
    allowedInputs: ["person", "activity", "evidence", "competency"],
    outputObjectType: "evidence",
    requiresHumanReview: true,
  },
  {
    id: "reflection_coach",
    purpose: "Helps users deepen reflective responses without supplying answers.",
    allowedInputs: ["person", "activity", "competency"],
    outputObjectType: "activity",
    requiresHumanReview: false,
  },
  {
    id: "scenario_engine",
    purpose: "Generates realistic practice situations.",
    allowedInputs: ["person", "competency", "activity"],
    outputObjectType: "activity",
    requiresHumanReview: false,
  },
  {
    id: "report_assistant",
    purpose: "Drafts summaries from existing evidence.",
    allowedInputs: ["person", "competency", "evidence", "reasoning", "outcome"],
    outputObjectType: "report",
    requiresHumanReview: true,
  },
  {
    id: "quality_checker",
    purpose: "Flags missing, inconsistent, or duplicate information.",
    allowedInputs: ["person", "competency", "activity", "evidence", "reasoning", "outcome"],
    outputObjectType: "reasoning",
    requiresHumanReview: true,
  },
  {
    id: "recommendation_engine",
    purpose: "Suggests next activities based on demonstrated competencies.",
    allowedInputs: ["person", "competency", "evidence", "reasoning", "outcome"],
    outputObjectType: "activity",
    requiresHumanReview: true,
  },
  {
    id: "review_assistant",
    purpose: "Summarises evidence for human reviewers.",
    allowedInputs: ["person", "competency", "evidence", "reasoning", "outcome"],
    outputObjectType: "reasoning",
    requiresHumanReview: true,
  },
  {
    id: "accessibility_assistant",
    purpose: "Adapts presentation for language or accessibility needs.",
    allowedInputs: ["person", "activity", "competency"],
    outputObjectType: "activity",
    requiresHumanReview: false,
  },
];

export function advanceActivityStatus(activity: HdosActivity, nextStatus: HdosActivityStatus): HdosActivity {
  const currentIndex = hdosActivityLifecycle.indexOf(activity.status);
  const nextIndex = hdosActivityLifecycle.indexOf(nextStatus);

  if (nextIndex < currentIndex) {
    throw new Error(`Cannot move activity ${activity.id} backwards from ${activity.status} to ${nextStatus}.`);
  }

  return { ...activity, status: nextStatus };
}

export function createEvidenceFromActivity({
  activity,
  evidence,
}: {
  activity: HdosActivity;
  evidence: Omit<HdosEvidence, "id" | "competencyIds" | "claimIds" | "status" | "reviewHistory"> & {
    id?: string;
    claimIds?: string[];
  };
}): { activity: HdosActivity; evidence: HdosEvidence } {
  const generatedEvidence: HdosEvidence = {
    ...evidence,
    id: evidence.id ?? `${activity.id}-evidence-${activity.generatedEvidenceIds.length + 1}`,
    competencyIds: activity.competencyIds,
    claimIds: evidence.claimIds ?? [],
    status: "submitted",
    reviewHistory: [],
  };

  return {
    activity: advanceActivityStatus(
      { ...activity, generatedEvidenceIds: [...activity.generatedEvidenceIds, generatedEvidence.id] },
      "evidence_generated",
    ),
    evidence: generatedEvidence,
  };
}

export function calculateProgressSnapshot({
  personId,
  activities,
  evidence,
  outcomes,
}: {
  personId: string;
  activities: HdosActivity[];
  evidence: HdosEvidence[];
  outcomes: HdosOutcome[];
}): HdosProgressSnapshot {
  const personActivities = activities.filter((activity) => activity.personId === personId);
  const personEvidence = evidence.filter((item) => personActivities.some((activity) => activity.generatedEvidenceIds.includes(item.id)));
  const completedActivities = personActivities.filter((activity) =>
    hdosActivityLifecycle.indexOf(activity.status) >= hdosActivityLifecycle.indexOf("completed"),
  );
  const reviewedEvidence = personEvidence.filter((item) => item.status === "reviewed" || item.status === "accepted");
  const acceptedEvidence = personEvidence.filter((item) => item.status === "accepted");
  const outcomeEvidenceIds = new Set(outcomes.filter((outcome) => outcome.personId === personId).flatMap((outcome) => outcome.evidenceIds));

  return {
    personId,
    dimensions: {
      learning_progress: ratio(completedActivities.length, personActivities.length),
      competency_progress: ratio(outcomeEvidenceIds.size, Math.max(personEvidence.length, 1)),
      evidence_progress: ratio(reviewedEvidence.length, Math.max(personEvidence.length, 1)),
      behaviour_progress: ratio(personEvidence.filter((item) => item.type.includes("observation") || item.context.includes("routine")).length, Math.max(personEvidence.length, 1)),
      goal_progress: ratio(outcomes.length, Math.max(personActivities.length, 1)),
      program_progress: ratio(completedActivities.length, Math.max(personActivities.length, 1)),
      engagement_progress: ratio(personActivities.filter((activity) => activity.startedAt).length, Math.max(personActivities.length, 1)),
      skill_retention: ratio(personEvidence.filter((item) => item.retention.includes("retention") || item.retention.includes("months")).length, Math.max(personEvidence.length, 1)),
      confidence_in_competency: Math.round(average(personEvidence.map((item) => item.confidence))),
      evidence_sufficiency: ratio(acceptedEvidence.length, Math.max(personEvidence.length, 1)),
    },
  };
}

export function summarizeTime({
  evidence,
  reviewIntervalDays = 30,
}: {
  evidence: HdosEvidence[];
  reviewIntervalDays?: number;
}): HdosTimeSummary {
  const chronological = [...evidence].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
  const dates = chronological.map((item) => new Date(item.date));
  const first = dates[0];
  const mostRecent = dates.at(-1);
  const dayGaps = dates.slice(1).map((date, index) => {
    return Math.round((date.getTime() - dates[index].getTime()) / 86_400_000);
  });
  const insufficientEvidencePeriods = chronological
    .filter((item) => item.status === "insufficient" || item.status === "needs_clarification")
    .map((item) => item.date);

  return {
    firstDemonstrated: first?.toISOString().slice(0, 10),
    mostRecentDemonstration: mostRecent?.toISOString().slice(0, 10),
    numberOfDemonstrations: chronological.length,
    averageDaysBetweenDemonstrations: dayGaps.length ? Math.round(average(dayGaps)) : undefined,
    evidenceTrend: calculateEvidenceTrend(chronological),
    insufficientEvidencePeriods,
    nextReviewDue: mostRecent
      ? new Date(mostRecent.getTime() + reviewIntervalDays * 86_400_000).toISOString().slice(0, 10)
      : undefined,
  };
}

export function runQualityChecks({
  evidence,
  thresholds,
  humanReviewCompleted,
}: {
  evidence: HdosEvidence[];
  thresholds: HdosQualityThresholds;
  humanReviewCompleted: boolean;
}): HdosQualityFlag[] {
  const flags: HdosQualityFlag[] = [];
  const independentSources = new Set(evidence.map((item) => item.independentSourceKey)).size;
  const contextCount = new Set(evidence.map((item) => item.context)).size;
  const newestEvidenceAgeDays = evidence.length
    ? Math.min(...evidence.map((item) => Math.round((Date.now() - new Date(item.date).getTime()) / 86_400_000)))
    : Number.POSITIVE_INFINITY;

  if (evidence.length < thresholds.minimumEvidenceItems) {
    flags.push({ id: "not_enough_evidence", severity: "blocker", message: "There is not enough evidence for this conclusion." });
  }
  if (independentSources < thresholds.minimumIndependentSources) {
    flags.push({ id: "independence_gap", severity: "warning", message: "At least two independent evidence sources are required for higher-confidence findings." });
  }
  if (newestEvidenceAgeDays > thresholds.maximumEvidenceAgeDays) {
    flags.push({ id: "recency_gap", severity: "warning", message: "The available evidence is not recent enough for the configured review rule." });
  }
  if (evidence.some((item) => item.status === "contradictory")) {
    flags.push({ id: "unresolved_contradiction", severity: "blocker", message: "Contradictory evidence needs human review before the conclusion is relied on." });
  }
  if (contextCount < thresholds.minimumContextCount) {
    flags.push({ id: "context_gap", severity: "warning", message: "The competency has not been demonstrated in enough contexts." });
  }
  if (thresholds.humanReviewRequired && !humanReviewCompleted) {
    flags.push({ id: "human_review_required", severity: "blocker", message: "Human review is required before this conclusion can be finalised." });
  }

  return flags;
}

function ratio(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round(Math.max(0, Math.min(1, value / total)) * 100);
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function calculateEvidenceTrend(evidence: HdosEvidence[]): HdosTimeSummary["evidenceTrend"] {
  if (evidence.length < 3) return "not_enough_data";

  const midpoint = Math.floor(evidence.length / 2);
  const early = average(evidence.slice(0, midpoint).map((item) => item.confidence));
  const recent = average(evidence.slice(midpoint).map((item) => item.confidence));
  const delta = recent - early;

  if (delta >= 8) return "improving";
  if (delta <= -8) return "declining";
  return "stable";
}
