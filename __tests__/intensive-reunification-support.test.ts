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
});
