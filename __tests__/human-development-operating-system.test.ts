import { assessmentRoutes } from "../lib/data/assessmentSystem";
import {
  advanceActivityStatus,
  calculateProgressSnapshot,
  createEvidenceFromActivity,
  hdosActivityLifecycle,
  hdosAiAgents,
  hdosCoreObjects,
  runQualityChecks,
  summarizeTime,
  type HdosActivity,
  type HdosEvidence,
  type HdosOutcome,
} from "../lib/engines/humanDevelopmentOperatingSystem";

const activity: HdosActivity = {
  id: "activity-1",
  personId: "person-1",
  type: "home_visit",
  title: "Observe bedtime routine",
  competencyIds: ["safety", "consistency"],
  status: "completed",
  assignedAt: "2026-07-01",
  startedAt: "2026-07-02",
  completedAt: "2026-07-03",
  generatedEvidenceIds: [],
  generatedFutureActivityIds: [],
};

function evidence(overrides: Partial<HdosEvidence>): HdosEvidence {
  return {
    id: overrides.id ?? "evidence-1",
    type: overrides.type ?? "worker_observation",
    source: overrides.source ?? "worker",
    authorId: overrides.authorId ?? "worker-1",
    date: overrides.date ?? "2026-07-01",
    context: overrides.context ?? "home routine",
    competencyIds: overrides.competencyIds ?? ["safety"],
    claimIds: overrides.claimIds ?? ["claim-1"],
    confidence: overrides.confidence ?? 80,
    strength: overrides.strength ?? 80,
    reliability: overrides.reliability ?? 82,
    status: overrides.status ?? "accepted",
    reviewHistory: overrides.reviewHistory ?? [],
    attachmentIds: overrides.attachmentIds ?? [],
    permissions: overrides.permissions ?? ["worker"],
    retention: overrides.retention ?? "30 days",
    independentSourceKey: overrides.independentSourceKey ?? "worker",
    ...overrides,
  };
}

describe("humanDevelopmentOperatingSystem", () => {
  it("defines the six core objects and universal lifecycle", () => {
    expect(hdosCoreObjects.map((object) => object.objectType)).toEqual([
      "person",
      "competency",
      "activity",
      "evidence",
      "reasoning",
      "outcome",
    ]);
    expect(hdosActivityLifecycle).toEqual([
      "assigned",
      "started",
      "in_progress",
      "completed",
      "reviewed",
      "evidence_generated",
      "competency_updated",
      "report_updated",
      "future_activities_generated",
    ]);
  });

  it("prevents lifecycle movement backwards", () => {
    expect(advanceActivityStatus(activity, "reviewed").status).toBe("reviewed");
    expect(() => advanceActivityStatus(activity, "started")).toThrow("Cannot move activity");
  });

  it("generates evidence from an activity using the activity competencies", () => {
    const result = createEvidenceFromActivity({
      activity,
      evidence: {
        type: "home_visit_observation",
        source: "worker",
        authorId: "worker-1",
        date: "2026-07-04",
        context: "bedtime routine",
        confidence: 82,
        strength: 84,
        reliability: 86,
        attachmentIds: [],
        permissions: ["worker"],
        retention: "case retention schedule",
        independentSourceKey: "worker",
      },
    });

    expect(result.activity.status).toBe("evidence_generated");
    expect(result.evidence.competencyIds).toEqual(["safety", "consistency"]);
    expect(result.evidence.status).toBe("submitted");
  });

  it("tracks progress dimensions independently", () => {
    const activities: HdosActivity[] = [
      { ...activity, generatedEvidenceIds: ["evidence-1"] },
      { ...activity, id: "activity-2", status: "started", generatedEvidenceIds: [] },
    ];
    const evidenceItems = [evidence({ id: "evidence-1", status: "accepted", retention: "retention checked after 3 months" })];
    const outcomes: HdosOutcome[] = [
      {
        id: "outcome-1",
        personId: "person-1",
        competencyId: "safety",
        pathway: ["knowledge", "behaviour", "consistency"],
        currentOutcome: "consistency",
        evidenceIds: ["evidence-1"],
        reasoningIds: ["reasoning-1"],
      },
    ];

    const snapshot = calculateProgressSnapshot({
      personId: "person-1",
      activities,
      evidence: evidenceItems,
      outcomes,
    });

    expect(snapshot.dimensions.learning_progress).toBe(50);
    expect(snapshot.dimensions.evidence_progress).toBe(100);
    expect(snapshot.dimensions.skill_retention).toBe(100);
    expect(snapshot.dimensions.confidence_in_competency).toBe(80);
  });

  it("summarises evidence over time", () => {
    const summary = summarizeTime({
      evidence: [
        evidence({ id: "old", date: "2026-01-01", confidence: 55 }),
        evidence({ id: "middle", date: "2026-03-01", confidence: 70 }),
        evidence({ id: "recent", date: "2026-07-01", confidence: 88 }),
      ],
      reviewIntervalDays: 14,
    });

    expect(summary.firstDemonstrated).toBe("2026-01-01");
    expect(summary.mostRecentDemonstration).toBe("2026-07-01");
    expect(summary.numberOfDemonstrations).toBe(3);
    expect(summary.evidenceTrend).toBe("improving");
    expect(summary.nextReviewDue).toBe("2026-07-15");
  });

  it("runs universal quality checks before conclusions are relied on", () => {
    const flags = runQualityChecks({
      evidence: [
        evidence({ id: "one", status: "accepted", independentSourceKey: "parent", context: "home" }),
        evidence({ id: "two", status: "contradictory", independentSourceKey: "parent", context: "home" }),
      ],
      thresholds: {
        minimumEvidenceItems: 3,
        minimumIndependentSources: 2,
        maximumEvidenceAgeDays: 90,
        minimumContextCount: 2,
        humanReviewRequired: true,
      },
      humanReviewCompleted: false,
    });

    expect(flags.map((flag) => flag.id)).toEqual([
      "not_enough_evidence",
      "independence_gap",
      "unresolved_contradiction",
      "context_gap",
      "human_review_required",
    ]);
  });

  it("keeps specialised AI agents on the same evidence model and exposes the route", () => {
    expect(hdosAiAgents).toHaveLength(9);
    expect(hdosAiAgents.find((agent) => agent.id === "report_assistant")?.requiresHumanReview).toBe(true);
    expect(
      assessmentRoutes.some((route) => route.href === "/assessment-system/human-development-operating-system"),
    ).toBe(true);
  });
});
