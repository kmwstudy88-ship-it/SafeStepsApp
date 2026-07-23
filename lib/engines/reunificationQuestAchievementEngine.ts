export type ReunificationEvidenceRecord = {
  id: string;
  lessonId: string;
  questId?: string | null;
  evidenceType: string;
  score?: number | null;
  riskFlags?: { code: string; severity: "green" | "amber" | "red" | "critical" }[] | null;
  validatedBy?: string | null;
  evidencePayload?: Record<string, unknown>;
};

export type QuestDefinition = {
  id: string;
  code: string;
  title: string;
  requiredEvidence: {
    evidenceTypes?: string[];
    lessonIds?: string[];
    minCount?: number;
    minScore?: number;
    requiresValidation?: boolean;
    disallowAmberOrRedRisk?: boolean;
  };
};

export type QuestEvaluation = {
  questId: string;
  status: "active" | "completed" | "failed";
  matchedEvidenceIds: string[];
  reasons: string[];
};

export type AchievementDefinition = {
  id: string;
  code: string;
  title: string;
  criteria: {
    completedQuestCodes?: string[];
    minCompletedQuests?: number;
    requiredSkillEvidence?: string[];
    riskFreeEvidenceWindow?: number;
  };
};

export type AchievementUnlock = {
  achievementId: string;
  code: string;
  unlocked: boolean;
  reasons: string[];
};

function hasAmberOrWorse(record: ReunificationEvidenceRecord) {
  return (record.riskFlags ?? []).some((flag) => ["amber", "red", "critical"].includes(flag.severity));
}

export function evaluateQuestProgress(
  quest: QuestDefinition,
  evidenceRecords: ReunificationEvidenceRecord[],
): QuestEvaluation {
  const rules = quest.requiredEvidence;
  const matching = evidenceRecords.filter((record) => {
    if (rules.evidenceTypes?.length && !rules.evidenceTypes.includes(record.evidenceType)) return false;
    if (rules.lessonIds?.length && !rules.lessonIds.includes(record.lessonId)) return false;
    if (rules.minScore !== undefined && (record.score ?? 0) < rules.minScore) return false;
    if (rules.requiresValidation && !record.validatedBy) return false;
    return true;
  });
  const reasons: string[] = [];

  if ((rules.minCount ?? 1) > matching.length) {
    reasons.push(`Needs ${rules.minCount ?? 1} matching evidence record${(rules.minCount ?? 1) === 1 ? "" : "s"}.`);
  }

  if (rules.disallowAmberOrRedRisk && matching.some(hasAmberOrWorse)) {
    reasons.push("Matching evidence includes amber, red, or critical risk flags.");
  }

  const completed = reasons.length === 0;

  return {
    questId: quest.id,
    status: completed ? "completed" : "active",
    matchedEvidenceIds: matching.map((record) => record.id),
    reasons: completed ? ["Quest evidence criteria met with validated therapeutic progress."] : reasons,
  };
}

export function unlockAchievements(input: {
  achievements: AchievementDefinition[];
  questDefinitions: QuestDefinition[];
  questEvaluations: QuestEvaluation[];
  evidenceRecords: ReunificationEvidenceRecord[];
}): AchievementUnlock[] {
  const completedQuestIds = new Set(
    input.questEvaluations.filter((evaluation) => evaluation.status === "completed").map((evaluation) => evaluation.questId),
  );
  const completedQuestCodes = new Set(
    input.questDefinitions.filter((quest) => completedQuestIds.has(quest.id)).map((quest) => quest.code),
  );

  return input.achievements.map((achievement) => {
    const reasons: string[] = [];
    const criteria = achievement.criteria;

    if ((criteria.minCompletedQuests ?? 0) > completedQuestIds.size) {
      reasons.push(`Needs ${criteria.minCompletedQuests} completed quests.`);
    }

    const missingQuestCodes = (criteria.completedQuestCodes ?? []).filter((code) => !completedQuestCodes.has(code));
    if (missingQuestCodes.length > 0) {
      reasons.push(`Missing completed quests: ${missingQuestCodes.join(", ")}.`);
    }

    const missingSkills = (criteria.requiredSkillEvidence ?? []).filter(
      (skill) => !input.evidenceRecords.some((record) => record.validatedBy && record.evidencePayload?.[skill] === true),
    );
    if (missingSkills.length > 0) {
      reasons.push(`Missing validated skill evidence: ${missingSkills.join(", ")}.`);
    }

    if (criteria.riskFreeEvidenceWindow !== undefined) {
      const windowRecords = input.evidenceRecords.slice(0, criteria.riskFreeEvidenceWindow);
      if (windowRecords.length < criteria.riskFreeEvidenceWindow) {
        reasons.push(`Needs ${criteria.riskFreeEvidenceWindow} evidence records for the risk-free window.`);
      } else if (windowRecords.some(hasAmberOrWorse)) {
        reasons.push("Risk-free window contains amber, red, or critical flags.");
      }
    }

    return {
      achievementId: achievement.id,
      code: achievement.code,
      unlocked: reasons.length === 0,
      reasons: reasons.length === 0 ? ["Achievement criteria met from validated evidence and quest progress."] : reasons,
    };
  });
}
