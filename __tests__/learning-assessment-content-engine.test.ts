import {
  evaluateLearningAssessmentUse,
  evaluateSequenceKnowledgeClientIntegration,
  getDefinitionMatchupDatasetSummary,
  getLearningAssessmentContentReadinessSummary,
  getProofOfChangeReadinessSummary,
  getSequenceKnowledgeDatasetSummary,
  learningAssessmentContentSources,
  sequenceKnowledgeThemeBundleManifest,
} from "../lib/engines/learningAssessmentContentEngine";

describe("learningAssessmentContentEngine", () => {
  it("registers the three supplied learning assessment datasets as first-class sources", () => {
    expect(learningAssessmentContentSources).toEqual([
      {
        id: "proof_of_change_tasks_001_100",
        title: "SafeSteps Proof of Change Program",
        sourcePath: "proof-of-change/proof_of_change_tasks_001_100.json",
      },
      {
        id: "safesteps_definition_meaning_match_001_100",
        title: "SafeSteps Definition and Meaning Match-Up",
        sourcePath: "definition matchup/safesteps_definition_matchup_100.json",
      },
      {
        id: "safesteps_definition_meaning_match_201_1200",
        title: "SafeSteps Definition and Meaning Match-Up - Questions 201-1200",
        sourcePath: "definition matchup/safesteps_definition_matchup_201_1200.json",
      },
      {
        id: "safesteps-sequence-knowledge-universe-1000",
        title: "SafeSteps Complete Sequence Knowledge Assessment Universe",
        sourcePath: "sequence-knowledge/safesteps_sequence_knowledge_universe_1000.json",
      },
      {
        id: "safesteps_sequence_ui_theme_bundle",
        title: "SafeSteps Sequence Knowledge UI Theme Bundle",
        sourcePath: "sequence-knowledge/safesteps_sequence_ui_theme_bundle.zip",
      },
    ]);
  });

  it("validates proof-of-change task coverage and safeguards", () => {
    expect(getProofOfChangeReadinessSummary()).toMatchObject({
      itemCount: 100,
      categoryCount: 9,
      declaredTaskRange: { from: 1, to: 100 },
      totalProgramTasks: 1000,
      orphanTaskCount: 0,
      readyForRuntimeIntegration: true,
    });
  });

  it("validates definition matchup questions and correct-option wiring", () => {
    expect(getDefinitionMatchupDatasetSummary()).toMatchObject({
      itemCount: 1100,
      declaredQuestionCount: 1100,
      bankCount: 2,
      questionNumberGaps: [{ from: 101, to: 200 }],
      invalidQuestionCount: 0,
      passingScore: 75,
      readyForRuntimeIntegration: true,
    });
  });

  it("validates the 1000-item sequence knowledge universe", () => {
    expect(getSequenceKnowledgeDatasetSummary()).toMatchObject({
      itemCount: 1000,
      declaredAssessmentCount: 1000,
      domainCount: 25,
      contextCount: 40,
      invalidAssessmentCount: 0,
      criticalStepCoverageCount: 1000,
      themeBundle: {
        sourcePath: "sequence-knowledge/safesteps_sequence_ui_theme_bundle.zip",
        sha256: "9FF4EFD88B90C8B49104E16E763F910BC402AB9BAB96C7DF0DE9DE7D7FDCB066",
        entryCount: 3,
        expectedByteCount: 14174,
      },
      readyForRuntimeIntegration: true,
    });
  });

  it("registers the sequence UI theme bundle as a reference asset, not a production scoring route", () => {
    expect(sequenceKnowledgeThemeBundleManifest).toMatchObject({
      id: "safesteps_sequence_ui_theme_bundle",
      sourcePath: "sequence-knowledge/safesteps_sequence_ui_theme_bundle.zip",
      sha256: "9FF4EFD88B90C8B49104E16E763F910BC402AB9BAB96C7DF0DE9DE7D7FDCB066",
      entries: [
        {
          path: "safesteps-sequence-ui/README.md",
          expectedBytes: 590,
          purpose: "readme",
        },
        {
          path: "safesteps-sequence-ui/SequenceKnowledgeScreen.tsx",
          expectedBytes: 12707,
          purpose: "mock_screen",
        },
        {
          path: "safesteps-sequence-ui/theme.ts",
          expectedBytes: 877,
          purpose: "theme",
        },
      ],
    });
    expect(sequenceKnowledgeThemeBundleManifest.integrationRule).toContain("trusted server-side scoring");
  });

  it("summarises all supplied datasets together", () => {
    expect(getLearningAssessmentContentReadinessSummary()).toMatchObject({
      datasetCount: 3,
      totalAssessmentItems: 2200,
      readyDatasetCount: 3,
      readyForRuntimeIntegration: true,
    });
  });

  it("blocks high-impact use without human review and multiple evidence sources", () => {
    const result = evaluateLearningAssessmentUse({
      purpose: "capacity_decision",
      hasHumanReview: false,
      combinesMultipleEvidenceSources: false,
      childContentInvolved: true,
      childConsentRecorded: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "High-impact use requires human review.",
        "High-impact use requires multiple evidence sources beyond a quiz or task result.",
        "Child-involved assessment content requires recorded child consent when applicable.",
      ]),
    );
  });

  it("blocks production sequence UI integration when answer keys or mock data would leak to the client", () => {
    const result = evaluateSequenceKnowledgeClientIntegration({
      usesMockInitialSteps: true,
      exposesCorrectPositions: true,
      exposesDistractorReasons: true,
      submitsOrderedAndExcludedIds: false,
      trustedScoringConfigured: false,
    });

    expect(result.readyForProductionRoute).toBe(false);
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        "Replace bundled mock INITIAL_STEPS with selected sequence assessment items before production use.",
        "Correct step positions must not be exposed to the mobile client before submission.",
        "Distractor reasons must not be exposed to the mobile client before submission.",
        "The client must submit ordered IDs and excluded IDs for scoring.",
        "Sequence knowledge scoring must run in trusted code.",
      ]),
    );
  });

  it("allows sequence UI production integration when the client sends IDs to trusted scoring without answer-key leakage", () => {
    expect(
      evaluateSequenceKnowledgeClientIntegration({
        usesMockInitialSteps: false,
        exposesCorrectPositions: false,
        exposesDistractorReasons: false,
        submitsOrderedAndExcludedIds: true,
        trustedScoringConfigured: true,
      }),
    ).toEqual({ readyForProductionRoute: true, blockers: [] });
  });

  it("allows ordinary formative learning use without high-impact decision gates", () => {
    expect(
      evaluateLearningAssessmentUse({
        purpose: "formative_assessment",
        childContentInvolved: false,
      }),
    ).toEqual({ allowed: true, blockers: [] });
  });
});
