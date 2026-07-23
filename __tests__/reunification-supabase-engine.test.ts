jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from "../lib/supabase";
import {
  evaluateAndSaveReunificationRecommendation,
  fetchLatestReunificationRecommendation,
  fetchReunificationEvaluationInput,
  saveContactSessionLog,
  saveReunificationOverride,
  saveReunificationRecommendation,
} from "../lib/engines/reunificationSupabaseEngine";

function queryResult(data: unknown, error: unknown = null) {
  const resolved = { data, error };
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue(resolved),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(resolved),
    then: jest.fn((resolve: (value: typeof resolved) => unknown) => Promise.resolve(resolve(resolved))),
  };
}

describe("reunification Supabase engine", () => {
  beforeEach(() => {
    (supabase.from as jest.Mock).mockReset();
  });

  test("maps Supabase contact sessions, assessment evidence, and manual holds into evaluation input", async () => {
    (supabase.from as jest.Mock)
      .mockReturnValueOnce(queryResult({ contact_stage: "supervised" }))
      .mockReturnValueOnce(
        queryResult([
          {
            id: "session-1",
            stage: "supervised",
            session_date: "2026-07-20T00:00:00.000Z",
            duration_minutes: 60,
            child_distress_score: 2,
            child_comfort_score: 4,
            parent_regulation_score: 4,
            facilitator_intervention_count: 1,
            facilitator_unsafe_to_escalate: false,
            risk_flags: [{ code: "stable", severity: "green" }],
            skill_evidence: {
              co_regulation: true,
              reflective_listening: true,
            },
          },
        ]),
      )
      .mockReturnValueOnce(
        queryResult([
          {
            id: "evidence-1",
            lesson_id: "lesson-regulation",
            created_at: "2026-07-19T00:00:00.000Z",
            score: "88",
            risk_flags: [],
            validated_by: "facilitator-1",
            evidence_payload: {
              boundary_respect: true,
              repair_attempts: true,
            },
          },
        ]),
      )
      .mockReturnValueOnce(queryResult({ override_type: "hold", target_stage: null }));

    const input = await fetchReunificationEvaluationInput({
      caseId: "case-1",
      parentProfileId: "parent-1",
      requiredLessonIds: ["lesson-regulation"],
      sessionWindow: 3,
    });

    expect(input.currentStage).toBe("supervised");
    expect(input.caseworkerManualHold).toBe(true);
    expect(input.contactSessions[0]).toMatchObject({
      id: "session-1",
      occurredAt: "2026-07-20T00:00:00.000Z",
      emotionalRegulationScore: 4,
      skillEvidence: {
        co_regulation: true,
        reflective_listening: true,
      },
    });
    expect(input.assessmentRecords[0]).toMatchObject({
      id: "evidence-1",
      lessonId: "lesson-regulation",
      score: 88,
      validatedBy: "facilitator-1",
      skillEvidence: {
        boundary_respect: true,
        repair_attempts: true,
      },
    });
  });

  test("saves structured recommendation output for caseworker review", async () => {
    const query = queryResult({ id: "recommendation-1" });
    (supabase.from as jest.Mock).mockReturnValueOnce(query);

    await expect(
      saveReunificationRecommendation({
        caseId: "case-1",
        parentProfileId: "parent-1",
        facilitatorProfileId: "facilitator-1",
        result: {
          currentStage: "supervised",
          recommendedStage: "semi_supervised",
          canEscalate: true,
          mustRegress: false,
          riskLevel: "low",
          reasons: ["All escalation gates passed."],
          hardBlocks: [],
          requiredInterventions: [],
        },
      }),
    ).resolves.toEqual({ id: "recommendation-1" });

    expect(supabase.from).toHaveBeenCalledWith("reunification_recommendations");
    expect(query.insert).toHaveBeenCalledWith({
      case_id: "case-1",
      parent_id: "parent-1",
      facilitator_id: "facilitator-1",
      current_stage: "supervised",
      recommended_stage: "semi_supervised",
      risk_level: "low",
      reasons: ["All escalation gates passed."],
      hard_blocks: [],
      required_interventions: [],
    });
  });

  test("saves contact-session evidence in the shape used by the progression engine", async () => {
    const query = queryResult({ id: "session-1" });
    (supabase.from as jest.Mock).mockReturnValueOnce(query);

    await saveContactSessionLog({
      caseId: "case-1",
      parentProfileId: "parent-1",
      facilitatorProfileId: "facilitator-1",
      stage: "supervised",
      sessionDate: "2026-07-21T09:00:00.000Z",
      durationMinutes: 60,
      childComfortScore: 4,
      childDistressScore: 2,
      parentRegulationScore: 5,
      facilitatorInterventionCount: 1,
      facilitatorUnsafeToEscalate: false,
      notes: "Parent used reflective listening and repaired a missed cue.",
      riskFlags: [{ code: "stable_session", severity: "green" }],
      skillEvidence: {
        co_regulation: true,
        reflective_listening: true,
        boundary_respect: true,
        repair_attempts: true,
      },
    });

    expect(supabase.from).toHaveBeenCalledWith("contact_sessions");
    expect(query.insert).toHaveBeenCalledWith({
      case_id: "case-1",
      parent_id: "parent-1",
      facilitator_id: "facilitator-1",
      stage: "supervised",
      session_date: "2026-07-21T09:00:00.000Z",
      duration_minutes: 60,
      child_comfort_score: 4,
      child_distress_score: 2,
      parent_regulation_score: 5,
      facilitator_intervention_count: 1,
      facilitator_unsafe_to_escalate: false,
      notes: "Parent used reflective listening and repaired a missed cue.",
      risk_flags: [{ code: "stable_session", severity: "green" }],
      skill_evidence: {
        co_regulation: true,
        reflective_listening: true,
        boundary_respect: true,
        repair_attempts: true,
      },
    });
  });

  test("loads, evaluates, and saves without escalating when a hard block is active", async () => {
    (supabase.from as jest.Mock)
      .mockReturnValueOnce(queryResult({ contact_stage: "supervised" }))
      .mockReturnValueOnce(
        queryResult([
          {
            id: "session-3",
            stage: "supervised",
            session_date: "2026-07-20T00:00:00.000Z",
            duration_minutes: 60,
            child_distress_score: 2,
            child_comfort_score: 5,
            parent_regulation_score: 5,
            facilitator_intervention_count: 0,
            facilitator_unsafe_to_escalate: false,
            risk_flags: [],
            skill_evidence: { co_regulation: true, reflective_listening: true },
          },
        ]),
      )
      .mockReturnValueOnce(queryResult([]))
      .mockReturnValueOnce(queryResult({ override_type: "hold", target_stage: null }))
      .mockReturnValueOnce(queryResult({ id: "recommendation-1" }));

    const snapshot = await evaluateAndSaveReunificationRecommendation({
      caseId: "case-1",
      parentProfileId: "parent-1",
    });

    expect(snapshot.result.canEscalate).toBe(false);
    expect(snapshot.result.hardBlocks).toContain("Caseworker manual hold is active.");
  });

  test("fetches the latest recommendation for a case and parent", async () => {
    const recommendation = {
      id: "recommendation-1",
      case_id: "case-1",
      parent_id: "parent-1",
      facilitator_id: "facilitator-1",
      current_stage: "supervised",
      recommended_stage: "semi_supervised",
      risk_level: "low",
      reasons: ["All escalation gates passed."],
      hard_blocks: [],
      required_interventions: [],
      created_at: "2026-07-21T00:00:00.000Z",
    };
    const query = queryResult(recommendation);
    (supabase.from as jest.Mock).mockReturnValueOnce(query);

    await expect(
      fetchLatestReunificationRecommendation({
        caseId: "case-1",
        parentProfileId: "parent-1",
      }),
    ).resolves.toEqual(recommendation);

    expect(supabase.from).toHaveBeenCalledWith("reunification_recommendations");
    expect(query.eq).toHaveBeenCalledWith("case_id", "case-1");
    expect(query.eq).toHaveBeenCalledWith("parent_id", "parent-1");
  });

  test("saves caseworker overrides separately from generated recommendations", async () => {
    const query = queryResult({ id: "override-1" });
    (supabase.from as jest.Mock).mockReturnValueOnce(query);

    await saveReunificationOverride({
      caseId: "case-1",
      parentProfileId: "parent-1",
      caseworkerProfileId: "caseworker-1",
      overrideType: "hold",
      reason: "Court direction pending.",
    });

    expect(supabase.from).toHaveBeenCalledWith("reunification_overrides");
    expect(query.insert).toHaveBeenCalledWith({
      case_id: "case-1",
      parent_id: "parent-1",
      caseworker_id: "caseworker-1",
      override_type: "hold",
      target_stage: null,
      reason: "Court direction pending.",
    });
  });
});
