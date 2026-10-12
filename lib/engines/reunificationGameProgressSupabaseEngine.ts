import { supabase } from "../supabase";
import {
  evaluateQuestProgress,
  unlockAchievements,
  type AchievementDefinition,
  type AchievementUnlock,
  type QuestDefinition,
  type QuestEvaluation,
  type ReunificationEvidenceRecord,
} from "./reunificationQuestAchievementEngine";

type AssessmentRecordRow = {
  id: string;
  lesson_id: string | null;
  quest_id: string | null;
  evidence_type: string | null;
  evidence_payload: Record<string, unknown> | null;
  score: number | string | null;
  risk_flags: ReunificationEvidenceRecord["riskFlags"] | null;
  validated_by: string | null;
};

type QuestRow = {
  id: string;
  code: string;
  title: string;
  required_evidence: QuestDefinition["requiredEvidence"];
};

type AchievementRow = {
  id: string;
  code: string;
  title: string;
  criteria: AchievementDefinition["criteria"];
};

export type ReunificationGameProgressResult = {
  questEvaluations: QuestEvaluation[];
  achievementUnlocks: AchievementUnlock[];
  completedQuestIds: string[];
  unlockedAchievementIds: string[];
};

function numberOrNull(value: number | string | null | undefined) {
  if (value == null) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function mapEvidence(row: AssessmentRecordRow): ReunificationEvidenceRecord {
  return {
    id: row.id,
    lessonId: row.lesson_id ?? "",
    questId: row.quest_id,
    evidenceType: row.evidence_type ?? "text",
    score: numberOrNull(row.score),
    riskFlags: row.risk_flags ?? [],
    validatedBy: row.validated_by,
    evidencePayload: row.evidence_payload ?? {},
  };
}

function mapQuest(row: QuestRow): QuestDefinition {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    requiredEvidence: row.required_evidence,
  };
}

function mapAchievement(row: AchievementRow): AchievementDefinition {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    criteria: row.criteria,
  };
}

export async function evaluateAndPersistReunificationGameProgress(input: {
  caseId: string;
  parentProfileId: string;
}): Promise<ReunificationGameProgressResult> {
  const [evidenceResponse, questsResponse, achievementsResponse] = await Promise.all([
    supabase
      .from("assessment_records")
      .select("id,lesson_id,quest_id,evidence_type,evidence_payload,score,risk_flags,validated_by")
      .eq("case_id", input.caseId)
      .eq("user_id", input.parentProfileId)
      .order("created_at", { ascending: false }),
    supabase.from("quests").select("id,code,title,required_evidence").order("created_at", { ascending: true }),
    supabase.from("achievements").select("id,code,title,criteria").order("created_at", { ascending: true }),
  ]);

  if (evidenceResponse.error) throw evidenceResponse.error;
  if (questsResponse.error) throw questsResponse.error;
  if (achievementsResponse.error) throw achievementsResponse.error;

  const evidenceRecords = ((evidenceResponse.data ?? []) as AssessmentRecordRow[]).map(mapEvidence);
  const questDefinitions = ((questsResponse.data ?? []) as QuestRow[]).map(mapQuest);
  const achievementDefinitions = ((achievementsResponse.data ?? []) as AchievementRow[]).map(mapAchievement);
  const questEvaluations = questDefinitions.map((quest) => evaluateQuestProgress(quest, evidenceRecords));
  const achievementUnlocks = unlockAchievements({
    achievements: achievementDefinitions,
    questDefinitions,
    questEvaluations,
    evidenceRecords,
  });

  const completedQuestIds = questEvaluations
    .filter((evaluation) => evaluation.status === "completed")
    .map((evaluation) => evaluation.questId);
  const unlockedAchievementIds = achievementUnlocks
    .filter((unlock) => unlock.unlocked)
    .map((unlock) => unlock.achievementId);

  if (questEvaluations.length > 0) {
    const { error } = await supabase.from("quest_progress").upsert(
      questEvaluations.map((evaluation) => ({
        quest_id: evaluation.questId,
        user_id: input.parentProfileId,
        case_id: input.caseId,
        status: evaluation.status,
        progress_payload: {
          matchedEvidenceIds: evaluation.matchedEvidenceIds,
          reasons: evaluation.reasons,
        },
        completed_at: evaluation.status === "completed" ? new Date().toISOString() : null,
      })),
      { onConflict: "quest_id,user_id,case_id" },
    );
    if (error) throw error;
  }

  if (unlockedAchievementIds.length > 0) {
    const { error } = await supabase.from("user_achievements").upsert(
      achievementUnlocks
        .filter((unlock) => unlock.unlocked)
        .map((unlock) => ({
          achievement_id: unlock.achievementId,
          user_id: input.parentProfileId,
          case_id: input.caseId,
          meta: {
            code: unlock.code,
            reasons: unlock.reasons,
          },
        })),
      { onConflict: "achievement_id,user_id,case_id" },
    );
    if (error) throw error;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      quest_state: {
        evaluatedAt: new Date().toISOString(),
        completedQuestIds,
        questEvaluations,
      },
      achievement_state: {
        evaluatedAt: new Date().toISOString(),
        unlockedAchievementIds,
        achievementUnlocks,
      },
    })
    .eq("id", input.parentProfileId);

  if (profileError) throw profileError;

  return {
    questEvaluations,
    achievementUnlocks,
    completedQuestIds,
    unlockedAchievementIds,
  };
}
