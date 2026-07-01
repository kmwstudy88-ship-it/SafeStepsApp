import {
  calculateMilestoneProgressScore,
  calculateServiceCompletionScore,
  calculateVisitationQualityTrend,
  computeReadinessIndexFromSignals,
  computeReadinessIndex,
  scoreAssessment,
  scoreTrend,
  type AssessmentDomain,
  type AssessmentItem,
  type AssessmentResponse,
  type AssessmentScoringBand,
} from "../lib/engines/assessmentScoringEngine";

const domains: AssessmentDomain[] = [
  { id: "protective", name: "Protective Capacity", weight: 2 },
  { id: "engagement", name: "Engagement", weight: 1 },
];

const items: AssessmentItem[] = [
  {
    id: "child-safety",
    domainId: "protective",
    itemType: "likert",
    weight: 1,
    options: [
      { id: "safety-low", itemId: "child-safety", label: "Low", value: "low", score: 1 },
      { id: "safety-high", itemId: "child-safety", label: "High", value: "high", score: 4 },
      { id: "safety-critical", itemId: "child-safety", label: "Critical concern", value: "critical", score: 0 },
    ],
  },
  {
    id: "homework",
    domainId: "engagement",
    itemType: "likert",
    weight: 1,
    options: [
      { id: "homework-low", itemId: "homework", label: "Low", value: "low", score: 1 },
      { id: "homework-high", itemId: "homework", label: "High", value: "high", score: 4 },
    ],
  },
];

const bands: AssessmentScoringBand[] = [
  { id: "red", label: "Red", minScore: 0, maxScore: 49, recommendation: "Do not progress without supervisor review.", requiresSupervisorReview: true },
  { id: "amber", label: "Amber", minScore: 50, maxScore: 79, recommendation: "Continue targeted support." },
  { id: "green", label: "Green", minScore: 80, maxScore: 100, recommendation: "Review readiness with case team." },
];

describe("assessment scoring engine", () => {
  test("scores domains and weighted overall assessment", () => {
    const responses: AssessmentResponse[] = [
      { itemId: "child-safety", selectedOptionId: "safety-high" },
      { itemId: "homework", selectedOptionId: "homework-high" },
    ];

    const result = scoreAssessment({ domains, items, responses, bands });

    expect(result.domainScores).toEqual([
      { domainId: "protective", rawScore: 4, maxPossible: 4, normalizedScore: 100 },
      { domainId: "engagement", rawScore: 4, maxPossible: 4, normalizedScore: 100 },
    ]);
    expect(result.overallScore).toBe(100);
    expect(result.band?.label).toBe("Green");
    expect(result.overrideTriggered).toBe(false);
  });

  test("critical override forces a safety band without hiding the computed score", () => {
    const responses: AssessmentResponse[] = [
      { itemId: "child-safety", selectedOptionId: "safety-critical" },
      { itemId: "homework", selectedOptionId: "homework-high" },
    ];

    const result = scoreAssessment({
      domains,
      items,
      responses,
      bands,
      overrides: [
        {
          id: "critical-safety",
          itemId: "child-safety",
          triggerOptionId: "safety-critical",
          forcedBandId: "red",
          reason: "Active safety concern",
          requiresSupervisorReview: true,
        },
      ],
    });

    expect(result.overallScore).toBe(33.33);
    expect(result.overrideTriggered).toBe(true);
    expect(result.band?.label).toBe("Red");
    expect(result.requiresSupervisorReview).toBe(true);
  });

  test("scores domain trend direction", () => {
    expect(
      scoreTrend(
        [{ domainId: "protective", rawScore: 2, maxPossible: 4, normalizedScore: 50 }],
        [{ domainId: "protective", rawScore: 3, maxPossible: 4, normalizedScore: 75 }],
      ),
    ).toEqual([
      {
        domainId: "protective",
        previousScore: 50,
        currentScore: 75,
        change: 25,
        direction: "improving",
      },
    ]);
  });

  test("readiness index excludes missing signals and flags them", () => {
    const result = computeReadinessIndex({
      assessmentScore: 80,
      serviceCompletionScore: 60,
      visitationQualityScore: null,
      milestoneProgressScore: 70,
    });

    expect(result.compositeScore).toBe(72.67);
    expect(result.flags).toContain("Visitation quality signal is missing.");
    expect(result.suppressedByOverride).toBe(false);
  });

  test("readiness index is suppressed by active critical override", () => {
    const result = computeReadinessIndex({
      assessmentScore: 90,
      serviceCompletionScore: 90,
      visitationQualityScore: 90,
      milestoneProgressScore: 90,
      activeCriticalOverride: true,
    });

    expect(result.compositeScore).toBeNull();
    expect(result.flags[0]).toBe("Active critical override suppresses readiness index.");
    expect(result.recommendation).toBe("Supervisor review required before any reunification-level change.");
  });

  test("calculates service completion with engaged services counted as partial progress", () => {
    expect(
      calculateServiceCompletionScore([
        { status: "completed", completionWeight: 2 },
        { status: "engaged", completionWeight: 1 },
        { status: "referred", completionWeight: 1 },
        { status: "declined", completionWeight: 10 },
      ]),
    ).toBe(62.5);
  });

  test("calculates recency-weighted visitation quality with incident penalties", () => {
    expect(
      calculateVisitationQualityTrend([
        { visitDate: "2026-01-01", qualityScore: 60, incidentCount: 0 },
        { visitDate: "2026-01-08", qualityScore: 80, incidentCount: 1 },
      ]),
    ).toBe(66.67);
  });

  test("calculates milestone progress from explicit and status-derived scores", () => {
    expect(
      calculateMilestoneProgressScore([
        { status: "completed" },
        { status: "in_progress" },
        { status: "blocked", progressScore: 25 },
      ]),
    ).toBe(58.33);
  });

  test("computes readiness index from raw case signals", () => {
    const result = computeReadinessIndexFromSignals({
      assessmentScore: 75,
      serviceReferrals: [
        { status: "completed" },
        { status: "engaged" },
      ],
      visitations: [{ visitDate: "2026-01-01", qualityScore: 80 }],
      milestones: [{ status: "completed" }, { status: "in_progress" }],
    });

    expect(result.compositeScore).toBe(76.25);
    expect(result.flags).toEqual([]);
  });
});
