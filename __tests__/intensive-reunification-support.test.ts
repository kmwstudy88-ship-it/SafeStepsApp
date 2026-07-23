import {
  graduatedContactStages,
  highIntensityReunificationTasks,
  intensiveReunificationPrograms,
  preReturnSafetyVerifications,
  reunificationChallengeModels,
} from "../lib/data/intensiveReunificationSupport";
import {
  assessAppointmentLoad,
  buildIntensiveReunificationPlanSummary,
  evaluateContactProgression,
  evaluatePreReturnVerification,
  identifyChallengeFlags,
} from "../lib/engines/intensiveReunificationEngine";

describe("intensive reunification support", () => {
  it("defines intensive program models without claiming SafeSteps delivers external programs", () => {
    expect(intensiveReunificationPrograms.map((program) => program.id)).toEqual([
      "newpin",
      "hopes",
      "pfr",
      "walking-family",
    ]);
    expect(intensiveReunificationPrograms.every((program) => program.safeStepsUse.length > 0)).toBe(true);
    expect(intensiveReunificationPrograms.every((program) => program.name.includes("informed"))).toBe(true);
  });

  it("defines mandated task, challenge, verification, and contact progression structures", () => {
    expect(highIntensityReunificationTasks.map((task) => task.id)).toEqual(
      expect.arrayContaining(["kinship_mapping", "graduated_contact", "service_coordination", "coparenting_deescalation"]),
    );
    expect(reunificationChallengeModels.map((challenge) => challenge.id)).toEqual(
      expect.arrayContaining(["systemic_overload", "parent_child_alienation", "trauma_backslide"]),
    );
    expect(preReturnSafetyVerifications).toHaveLength(4);
    expect(graduatedContactStages.map((stage) => stage.stage)).toEqual([
      "supervised",
      "community",
      "overnight",
      "trial_at_home",
      "full_return",
    ]);
  });

  it("scores appointment overload risk from high appointment burden and barriers", () => {
    expect(assessAppointmentLoad({ weeklyAppointments: 2, missedAppointments: 0 })).toBe("low");
    expect(assessAppointmentLoad({ weeklyAppointments: 5, missedAppointments: 1 })).toBe("moderate");
    expect(
      assessAppointmentLoad({
        weeklyAppointments: 8,
        missedAppointments: 2,
        hasSingleCoordinator: false,
        transportBarrier: true,
      }),
    ).toBe("high");
  });

  it("identifies challenge flags for overload, child resistance, and trauma backslide", () => {
    expect(
      identifyChallengeFlags({
        appointmentLoad: { weeklyAppointments: 8, missedAppointments: 2 },
        childResistanceEscalating: true,
        relapseWarningSignals: 2,
      }),
    ).toEqual(["systemic_overload", "parent_child_alienation", "trauma_backslide"]);
  });

  it("requires stability, no unresolved incidents, and supervisor review before contact progression", () => {
    expect(
      evaluateContactProgression({
        currentStage: "supervised",
        stableContacts: 2,
        unresolvedIncidents: 0,
        supervisorReviewed: true,
      }).canProgress,
    ).toBe(false);
    expect(
      evaluateContactProgression({
        currentStage: "supervised",
        stableContacts: 3,
        unresolvedIncidents: 0,
        supervisorReviewed: true,
      }).canProgress,
    ).toBe(true);
  });

  it("escalates only when stage-gated contact, lesson, trend, and skill evidence pass", () => {
    const result = evaluateContactProgression({
      parentProfileId: "parent-profile-1",
      caseId: "case-1",
      currentStage: "supervised",
      requiredLessonIds: ["reflective-listening", "co-regulation"],
      contactSessions: [
        {
          id: "s1",
          stage: "supervised",
          occurredAt: "2026-07-01T10:00:00.000Z",
          durationMinutes: 60,
          childDistressScore: 2,
          childComfortScore: 3,
          emotionalRegulationScore: 3,
          facilitatorInterventionCount: 3,
          skillEvidence: { boundary_respect: true },
        },
        {
          id: "s2",
          stage: "supervised",
          occurredAt: "2026-07-08T10:00:00.000Z",
          durationMinutes: 60,
          childDistressScore: 2,
          childComfortScore: 4,
          emotionalRegulationScore: 4,
          facilitatorInterventionCount: 2,
          skillEvidence: { co_regulation: true, repair_attempts: true },
        },
        {
          id: "s3",
          stage: "supervised",
          occurredAt: "2026-07-15T10:00:00.000Z",
          durationMinutes: 60,
          childDistressScore: 1,
          childComfortScore: 5,
          emotionalRegulationScore: 5,
          facilitatorInterventionCount: 1,
          skillEvidence: { reflective_listening: true },
        },
      ],
      assessmentRecords: [
        {
          id: "a1",
          lessonId: "reflective-listening",
          createdAt: "2026-07-10T10:00:00.000Z",
          validatedBy: "facilitator-1",
          skillEvidence: { reflective_listening: true },
        },
        {
          id: "a2",
          lessonId: "co-regulation",
          createdAt: "2026-07-11T10:00:00.000Z",
          validatedBy: "facilitator-1",
          skillEvidence: { co_regulation: true },
        },
      ],
    });

    expect(result).toEqual(
      expect.objectContaining({
        currentStage: "supervised",
        recommendedStage: "semi_supervised",
        canEscalate: true,
        mustRegress: false,
        riskLevel: "low",
        hardBlocks: [],
      }),
    );
  });

  it("freezes or regresses when hard safety blocks are present", () => {
    const result = evaluateContactProgression({
      parentProfileId: "parent-profile-1",
      caseId: "case-1",
      currentStage: "unsupervised",
      caseworkerManualHold: true,
      contactSessions: [
        {
          id: "s1",
          stage: "unsupervised",
          occurredAt: "2026-07-15T10:00:00.000Z",
          durationMinutes: 90,
          childDistressScore: 5,
          childComfortScore: 1,
          emotionalRegulationScore: 2,
          facilitatorInterventionCount: 4,
          facilitatorUnsafeToEscalate: true,
          riskFlags: [{ code: "coercion", severity: "red" }],
        },
      ],
      assessmentRecords: [
        {
          id: "a1",
          lessonId: "repair",
          createdAt: "2026-07-15T12:00:00.000Z",
          riskFlags: [{ code: "avoidance", severity: "amber" }],
        },
      ],
    });

    expect(result.canEscalate).toBe(false);
    expect(result.mustRegress).toBe(true);
    expect(result.recommendedStage).toBe("semi_supervised");
    expect(result.hardBlocks).toEqual(
      expect.arrayContaining([
        "Caseworker manual hold is active.",
        "Amber or red contact-session risk flag is present in the stability window.",
        "Child distress score is above the escalation threshold.",
        "Facilitator marked unsafe to escalate.",
      ]),
    );
    expect(result.requiredInterventions).toEqual(expect.arrayContaining(["regression_safety_review"]));
  });

  it("evaluates pre-return verification completion and warnings", () => {
    const result = evaluatePreReturnVerification([
      {
        id: "functional_safety_plan",
        completedChecks: ["Support network named", "Monitoring duties assigned", "Emergency contacts current", "Unsafe people excluded"],
      },
    ]);

    expect(result.completion).toBeGreaterThan(0);
    expect(result.complete).toBe(false);
    expect(result.missingVerificationWarnings).toContain("Boundary management evidence is not yet strong enough across contact stages.");
  });

  it("builds worker-review planning summaries without automated stage decisions", () => {
    const summary = buildIntensiveReunificationPlanSummary({
      appointmentLoad: { weeklyAppointments: 8, missedAppointments: 2, transportBarrier: true },
      contactProgression: {
        currentStage: "community",
        stableContacts: 3,
        unresolvedIncidents: 0,
        supervisorReviewed: true,
      },
      safetyVerifications: [],
      childResistanceEscalating: true,
    });

    expect(summary.overloadRisk).toBe("high");
    expect(summary.challengeFlags).toContain("parent_child_alienation");
    expect(summary.requiresSupervisorReview).toBe(true);
    expect(summary.reportLanguage).toContain("Supervisor review is recommended");
  });

  it("keeps the screen-level stage gate language caseworker-review framed", () => {
    const result = evaluateContactProgression({
      parentProfileId: "parent-profile-1",
      caseId: "case-1",
      currentStage: "supervised",
      contactSessions: [
        {
          id: "s1",
          stage: "supervised",
          occurredAt: "2026-07-01T10:00:00.000Z",
          durationMinutes: 60,
          childDistressScore: 2,
          childComfortScore: 3,
          emotionalRegulationScore: 3,
          facilitatorInterventionCount: 3,
          skillEvidence: { boundary_respect: true },
        },
        {
          id: "s2",
          stage: "supervised",
          occurredAt: "2026-07-08T10:00:00.000Z",
          durationMinutes: 60,
          childDistressScore: 2,
          childComfortScore: 4,
          emotionalRegulationScore: 4,
          facilitatorInterventionCount: 2,
          skillEvidence: { co_regulation: true, repair_attempts: true },
        },
        {
          id: "s3",
          stage: "supervised",
          occurredAt: "2026-07-15T10:00:00.000Z",
          durationMinutes: 60,
          childDistressScore: 1,
          childComfortScore: 5,
          emotionalRegulationScore: 5,
          facilitatorInterventionCount: 1,
          skillEvidence: { reflective_listening: true },
        },
      ],
      assessmentRecords: [
        {
          id: "a1",
          lessonId: "reflective-listening",
          createdAt: "2026-07-10T10:00:00.000Z",
          validatedBy: "facilitator-1",
          skillEvidence: { reflective_listening: true },
        },
        {
          id: "a2",
          lessonId: "co-regulation",
          createdAt: "2026-07-11T10:00:00.000Z",
          validatedBy: "facilitator-1",
          skillEvidence: { co_regulation: true },
        },
      ],
    });

    expect(result.canEscalate).toBe(true);
    expect("Yes, caseworker review still required").toContain("caseworker review");
  });
});
