jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from "../lib/supabase";
import { evaluateAndPersistReunificationGameProgress } from "../lib/engines/reunificationGameProgressSupabaseEngine";

function queryResult(data: unknown, error: unknown = null) {
  const resolved = { data, error };
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockResolvedValue(resolved),
    update: jest.fn().mockReturnThis(),
    then: jest.fn((resolve: (value: typeof resolved) => unknown) => Promise.resolve(resolve(resolved))),
  };
}

describe("reunification game progress Supabase engine", () => {
  beforeEach(() => {
    (supabase.from as jest.Mock).mockReset();
  });

  test("evaluates quests and achievements from validated therapeutic evidence", async () => {
    const evidenceQuery = queryResult([
      {
        id: "evidence-1",
        lesson_id: "reflective-listening",
        quest_id: null,
        evidence_type: "text",
        evidence_payload: {
          reflective_listening: true,
          co_regulation: true,
        },
        score: 5,
        risk_flags: [],
        validated_by: "facilitator-1",
      },
    ]);
    const questsQuery = queryResult([
      {
        id: "quest-1",
        code: "REFLECTIVE_LISTENING_01",
        title: "Reflective listening",
        required_evidence: {
          evidenceTypes: ["text"],
          lessonIds: ["reflective-listening"],
          minCount: 1,
          minScore: 4,
          requiresValidation: true,
          disallowAmberOrRedRisk: true,
        },
      },
    ]);
    const achievementsQuery = queryResult([
      {
        id: "achievement-1",
        code: "SAFE_REPAIR_START",
        title: "Safe repair start",
        criteria: {
          completedQuestCodes: ["REFLECTIVE_LISTENING_01"],
          requiredSkillEvidence: ["reflective_listening"],
        },
      },
    ]);
    const questProgressQuery = queryResult([]);
    const userAchievementsQuery = queryResult([]);
    const profileQuery = queryResult(null);

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(evidenceQuery)
      .mockReturnValueOnce(questsQuery)
      .mockReturnValueOnce(achievementsQuery)
      .mockReturnValueOnce(questProgressQuery)
      .mockReturnValueOnce(userAchievementsQuery)
      .mockReturnValueOnce(profileQuery);

    const result = await evaluateAndPersistReunificationGameProgress({
      caseId: "case-1",
      parentProfileId: "parent-1",
    });

    expect(result.completedQuestIds).toEqual(["quest-1"]);
    expect(result.unlockedAchievementIds).toEqual(["achievement-1"]);
    expect(supabase.from).toHaveBeenCalledWith("quest_progress");
    expect(questProgressQuery.upsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          quest_id: "quest-1",
          user_id: "parent-1",
          case_id: "case-1",
          status: "completed",
          progress_payload: expect.objectContaining({
            matchedEvidenceIds: ["evidence-1"],
          }),
        }),
      ],
      { onConflict: "quest_id,user_id,case_id" },
    );
    expect(userAchievementsQuery.upsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          achievement_id: "achievement-1",
          user_id: "parent-1",
          case_id: "case-1",
        }),
      ],
      { onConflict: "achievement_id,user_id,case_id" },
    );
    expect(profileQuery.update).toHaveBeenCalledWith({
      quest_state: expect.objectContaining({
        completedQuestIds: ["quest-1"],
      }),
      achievement_state: expect.objectContaining({
        unlockedAchievementIds: ["achievement-1"],
      }),
    });
  });

  test("does not unlock achievements when evidence is unvalidated", async () => {
    const evidenceQuery = queryResult([
      {
        id: "evidence-1",
        lesson_id: "reflective-listening",
        quest_id: null,
        evidence_type: "text",
        evidence_payload: { reflective_listening: true },
        score: 5,
        risk_flags: [],
        validated_by: null,
      },
    ]);
    const questsQuery = queryResult([
      {
        id: "quest-1",
        code: "REFLECTIVE_LISTENING_01",
        title: "Reflective listening",
        required_evidence: {
          evidenceTypes: ["text"],
          lessonIds: ["reflective-listening"],
          minCount: 1,
          minScore: 4,
          requiresValidation: true,
          disallowAmberOrRedRisk: true,
        },
      },
    ]);
    const achievementsQuery = queryResult([
      {
        id: "achievement-1",
        code: "SAFE_REPAIR_START",
        title: "Safe repair start",
        criteria: {
          completedQuestCodes: ["REFLECTIVE_LISTENING_01"],
          requiredSkillEvidence: ["reflective_listening"],
        },
      },
    ]);
    const questProgressQuery = queryResult([]);
    const profileQuery = queryResult(null);

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(evidenceQuery)
      .mockReturnValueOnce(questsQuery)
      .mockReturnValueOnce(achievementsQuery)
      .mockReturnValueOnce(questProgressQuery)
      .mockReturnValueOnce(profileQuery);

    const result = await evaluateAndPersistReunificationGameProgress({
      caseId: "case-1",
      parentProfileId: "parent-1",
    });

    expect(result.completedQuestIds).toEqual([]);
    expect(result.unlockedAchievementIds).toEqual([]);
    expect(supabase.from).not.toHaveBeenCalledWith("user_achievements");
    expect(profileQuery.update).toHaveBeenCalledWith({
      quest_state: expect.objectContaining({
        completedQuestIds: [],
      }),
      achievement_state: expect.objectContaining({
        unlockedAchievementIds: [],
      }),
    });
  });
});
