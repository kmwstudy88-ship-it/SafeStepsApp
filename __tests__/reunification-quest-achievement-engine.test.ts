import {
  evaluateQuestProgress,
  unlockAchievements,
  type AchievementDefinition,
  type QuestDefinition,
  type ReunificationEvidenceRecord,
} from "../lib/engines/reunificationQuestAchievementEngine";

describe("reunification quest and achievement engine", () => {
  const quest: QuestDefinition = {
    id: "quest-1",
    code: "REFLECTIVE_LISTENING_SUPERVISED_01",
    title: "Reflective listening in supervised contact",
    requiredEvidence: {
      evidenceTypes: ["contact_log", "text"],
      lessonIds: ["reflective-listening"],
      minCount: 2,
      minScore: 4,
      requiresValidation: true,
      disallowAmberOrRedRisk: true,
    },
  };

  test("keeps mini-quests active until required validated evidence exists", () => {
    const result = evaluateQuestProgress(quest, [
      {
        id: "e1",
        lessonId: "reflective-listening",
        evidenceType: "contact_log",
        score: 4,
        validatedBy: "facilitator-1",
      },
    ]);

    expect(result.status).toBe("active");
    expect(result.reasons).toContain("Needs 2 matching evidence records.");
  });

  test("completes mini-quests from validated risk-free evidence", () => {
    const evidence: ReunificationEvidenceRecord[] = [
      {
        id: "e1",
        lessonId: "reflective-listening",
        evidenceType: "contact_log",
        score: 4,
        validatedBy: "facilitator-1",
      },
      {
        id: "e2",
        lessonId: "reflective-listening",
        evidenceType: "text",
        score: 5,
        validatedBy: "facilitator-1",
      },
    ];

    expect(evaluateQuestProgress(quest, evidence)).toEqual({
      questId: "quest-1",
      status: "completed",
      matchedEvidenceIds: ["e1", "e2"],
      reasons: ["Quest evidence criteria met with validated therapeutic progress."],
    });
  });

  test("does not unlock achievements when validated progress has risk flags", () => {
    const achievement: AchievementDefinition = {
      id: "achievement-1",
      code: "CONSISTENT_CO_REGULATOR",
      title: "Consistent co-regulator",
      criteria: {
        completedQuestCodes: ["REFLECTIVE_LISTENING_SUPERVISED_01"],
        requiredSkillEvidence: ["co_regulation"],
        riskFreeEvidenceWindow: 2,
      },
    };
    const evidence: ReunificationEvidenceRecord[] = [
      {
        id: "e1",
        lessonId: "reflective-listening",
        evidenceType: "contact_log",
        validatedBy: "facilitator-1",
        evidencePayload: { co_regulation: true },
      },
      {
        id: "e2",
        lessonId: "reflective-listening",
        evidenceType: "contact_log",
        validatedBy: "facilitator-1",
        riskFlags: [{ code: "coercive_language", severity: "amber" }],
      },
    ];

    const questEvaluation = { questId: "quest-1", status: "completed" as const, matchedEvidenceIds: ["e1"], reasons: [] };
    const [unlock] = unlockAchievements({
      achievements: [achievement],
      questDefinitions: [quest],
      questEvaluations: [questEvaluation],
      evidenceRecords: evidence,
    });

    expect(unlock.unlocked).toBe(false);
    expect(unlock.reasons).toContain("Risk-free window contains amber, red, or critical flags.");
  });
});
