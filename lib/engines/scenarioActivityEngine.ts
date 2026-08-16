import {
  getChildSafetyScenarioById,
  getChildMicroTriggerModuleById,
  getChildSocialSafetyModuleById,
  getChildPatternStabilizerById,
  getChildSensoryRegulationModuleById,
  getDecisionTreeById,
  getFamilyArchitectureModuleById,
  getFamilyClimateModuleById,
  getFamilyEmotionalStabilityBlueprintById,
  getFamilyPredictabilityArchitectureModuleById,
  getFamilyStressRedistributionModuleById,
  getCaseManagementMapById,
  getGrowthTrackerById,
  getHighRiskContactSessionModuleById,
  getHighRiskEscalationMapById,
  getHighRiskHouseholdEmotionalSafetyModuleById,
  getRiskMatrixById,
  getScenarioModuleById,
  getParentBehaviourCalibrationModuleById,
  getParentCognitiveLoadModuleById,
  getParentEmotionalExpansionModuleById,
  getParentGroundingArchitectureModuleById,
  getStressLoadModuleById,
  getStabilityIndexById,
  getSystemDiagnosticById,
  scenarioModules,
  scoringProfiles,
  type ShareAudience,
  type ScenarioDimension,
  type ScenarioModule,
} from "../data/scenarioModules";

export type ScenarioStepResponse = {
  stepId: string;
  responseText?: string;
  selectedOptionId?: string;
};

export type ScenarioCompletionInput = {
  moduleId: string;
  userId: string;
  caseId: string;
  lessonId?: string | null;
  questId?: string | null;
  responses: ScenarioStepResponse[];
  validatedBy?: "facilitator" | "system" | "caseworker";
};

export type ScenarioCompletionEvaluation = {
  moduleId: string;
  title: string;
  category: ScenarioModule["category"];
  scoringProfile: string;
  score: number;
  dimensionScores: Partial<Record<ScenarioDimension, number>>;
  riskFlags: {
    amber: string[];
    red: string[];
  };
  hardBlocks: string[];
  requiredInterventions: string[];
  assessmentRecord: {
    user_id: string;
    case_id: string;
    lesson_id: string | null;
    quest_id: string | null;
    evidence_type: "scenario_activity";
    evidence_payload: Record<string, unknown>;
    score: number;
    risk_flags: Record<string, unknown>;
    validated_by: "facilitator" | "system" | "caseworker";
  };
};

export type ChildSafetyScenarioResponse = {
  stepId: string;
  responseText?: string;
  selectedOptionId?: string;
};

export type ChildSafetyScenarioEvaluation = {
  childScenarioId: string;
  title: string;
  score: number;
  safetyFlags: {
    review: string[];
    urgent: string[];
  };
  parentVisible: boolean;
  shareAudience: ShareAudience;
  childRecord: {
    child_id: string;
    case_id: string;
    item_type: "child_safety_scenario";
    item_title: string;
    summary_text: string;
    share_audience: ShareAudience;
    structured_data: Record<string, unknown>;
  };
};

export type DecisionTreeEvaluation = {
  decisionTreeId: string;
  title: string;
  path: {
    nodeId: string;
    optionId: string;
    next: string;
  }[];
  endingId: string;
  summary: string;
  scores: Partial<Record<ScenarioDimension, number>>;
  riskFlags: {
    amber: string[];
    red: string[];
  };
  assessmentRecord: {
    user_id: string;
    case_id: string;
    lesson_id: string | null;
    quest_id: string | null;
    evidence_type: "decision_tree";
    evidence_payload: Record<string, unknown>;
    score: number;
    risk_flags: Record<string, unknown>;
    validated_by: "facilitator" | "system" | "caseworker";
  };
};

export type HighRiskEscalationEvaluation = {
  escalationMapId: string;
  title: string;
  matchedIndicators: string[];
  recommendedLevel: {
    level: number;
    label: string;
    actions: string[];
  } | null;
  requiresImmediateHumanReview: boolean;
  integrationLinks: string[];
};

export type RiskMatrixEvaluation = {
  riskMatrixId: string;
  title: string;
  domainScores: Record<string, number>;
  riskProfile: "low" | "moderate" | "high";
  flaggedDomains: string[];
  priorityInterventionList: string[];
  safetyEscalationLevel: number;
};

export type CaseManagementTierEvaluation = {
  caseMapId: string;
  title: string;
  recommendedTier: {
    tier: number;
    label: string;
    requirements: string[];
  };
  reasons: string[];
};

export type ParentCapacityGrowthEvaluation = {
  growthTrackerId: string;
  title: string;
  dimensionAverages: Record<string, number>;
  trends: Record<string, "improving" | "declining" | "stable" | "insufficient_data">;
};

export type SystemHealthDiagnosticEvaluation = {
  systemDiagnosticId: string;
  title: string;
  status: "healthy" | "needs_attention";
  failedChecks: string[];
  recommendedFixes: string[];
  performanceMetrics: {
    passedChecks: number;
    totalChecks: number;
  };
};

export type HighRiskContactSessionEvaluation = {
  contactSessionId: string;
  title: string;
  matchedRiskFactors: string[];
  riskLevel: "green" | "amber" | "red";
  facilitatorInterventionRequired: boolean;
  progressionSignal: "clear" | "hold" | "escalate_review";
  recommendedActions: string[];
};

export type StabilityIndexEvaluation = {
  stabilityIndexId: string;
  title: string;
  stabilityScore: number;
  status: "stable" | "moderate" | "unstable";
  riskFlags: string[];
  recommendedInterventions: string[];
};

export type DomainPressureEvaluation = {
  moduleId: string;
  title: string;
  averageScore: number;
  pressureLevel: "low" | "moderate" | "high";
  flaggedDomains: string[];
  recommendedTasks: string[];
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function addScore(
  scores: Partial<Record<ScenarioDimension, number>>,
  dimension: ScenarioDimension,
  impact: number,
) {
  scores[dimension] = (scores[dimension] ?? 0) + impact;
}

function findDecisionStep(module: ScenarioModule, stepId: string) {
  const step = module.steps.find((item) => item.step_id === stepId);
  return step?.type === "decision" ? step : null;
}

export function listScenarioCategories() {
  return [...new Set(scenarioModules.map((module) => module.category))];
}

export function evaluateScenarioCompletion(input: ScenarioCompletionInput): ScenarioCompletionEvaluation {
  const module = getScenarioModuleById(input.moduleId);
  if (!module) {
    throw new Error("Scenario module not found.");
  }

  const profile = scoringProfiles.find((item) => item.profile_id === module.assessment.scoring_profile);
  if (!profile) {
    throw new Error("Scenario scoring profile not found.");
  }

  const dimensionScores: Partial<Record<ScenarioDimension, number>> = {};
  const amber: string[] = [];
  const red: string[] = [];
  const hardBlocks: string[] = [];

  for (const response of input.responses) {
    if (!response.selectedOptionId) continue;
    const decisionStep = findDecisionStep(module, response.stepId);
    if (!decisionStep) continue;

    const selected = decisionStep.options.find((option) => option.option_id === response.selectedOptionId);
    if (!selected) {
      throw new Error(`Scenario option not found for step ${response.stepId}.`);
    }

    for (const [dimension, impact] of Object.entries(selected.score_impact)) {
      addScore(dimensionScores, dimension as ScenarioDimension, impact ?? 0);
    }

    if (selected.safety_flag === "amber") {
      amber.push(`${module.module_id}:${response.stepId}:${selected.option_id}`);
    }

    if (selected.safety_flag === "red") {
      red.push(`${module.module_id}:${response.stepId}:${selected.option_id}`);
      hardBlocks.push("Unsafe branch selected. Facilitator review is required before this activity supports progression.");
    }
  }

  for (const dimension of profile.dimensions) {
    if (dimensionScores[dimension.name] === undefined) {
      dimensionScores[dimension.name] = 0;
    }
    dimensionScores[dimension.name] = clamp(dimensionScores[dimension.name] ?? 0, dimension.range.min, dimension.range.max);
  }

  if (amber.length > 0 && hardBlocks.length === 0) {
    hardBlocks.push("Amber risk branch selected. Hold progression until worker review confirms safety and repair.");
  }

  const scoreValues = Object.values(dimensionScores);
  const score = scoreValues.length > 0
    ? Math.round((scoreValues.reduce((sum, value) => sum + (value ?? 0), 0) / scoreValues.length) * 10) / 10
    : 0;

  const requiredInterventions = [
    ...(score < 1 ? ["Repeat scenario with facilitator coaching and evidence a safer response."] : []),
    ...(amber.length > 0 || red.length > 0 ? ["Review risk branch, safety plan, and repair action before progression."] : []),
  ];

  const evidencePayload = {
    module_id: module.module_id,
    category: module.category,
    type: module.type,
    title: module.title,
    context: module.scenario.context,
    goals: module.scenario.goals,
    responses: input.responses,
    dimension_scores: dimensionScores,
    hard_blocks: hardBlocks,
    required_interventions: requiredInterventions,
    source: "scenario_activity_engine",
  };

  return {
    moduleId: module.module_id,
    title: module.title,
    category: module.category,
    scoringProfile: module.assessment.scoring_profile,
    score,
    dimensionScores,
    riskFlags: { amber, red },
    hardBlocks,
    requiredInterventions,
    assessmentRecord: {
      user_id: input.userId,
      case_id: input.caseId,
      lesson_id: input.lessonId ?? module.module_id,
      quest_id: input.questId ?? null,
      evidence_type: "scenario_activity",
      evidence_payload: evidencePayload,
      score,
      risk_flags: { amber, red, hard_blocks: hardBlocks },
      validated_by: input.validatedBy ?? "system",
    },
  };
}

export function buildScenarioTaskDescription(module: ScenarioModule) {
  return [
    module.description,
    "",
    `Scenario: ${module.scenario.context}`,
    "",
    "Goals:",
    ...module.scenario.goals.map((goal) => `- ${goal}`),
    "",
    "Required steps:",
    ...module.steps.map((step) => `- ${step.prompt}`),
    "",
    "Evidence requirement: complete the branch decision and provide reflection or upload evidence before this can support progress.",
  ].join("\n");
}

export function evaluateChildSafetyScenario(input: {
  childScenarioId: string;
  childId: string;
  caseId: string;
  responses: ChildSafetyScenarioResponse[];
  shareAudience?: ShareAudience;
}): ChildSafetyScenarioEvaluation {
  const module = getChildSafetyScenarioById(input.childScenarioId);
  if (!module) {
    throw new Error("Child safety scenario module not found.");
  }

  let score = 0;
  const review: string[] = [];
  const urgent: string[] = [];

  for (const response of input.responses) {
    if (!response.selectedOptionId) continue;
    const step = module.steps.find((item) => item.step_id === response.stepId);
    if (step?.type !== "decision") continue;
    const option = step.options.find((item) => item.option_id === response.selectedOptionId);
    if (!option) {
      throw new Error(`Child safety option not found for step ${response.stepId}.`);
    }
    score += option.child_safety_score;
    if (option.safety_flag === "review") {
      review.push(`${module.child_scenario_id}:${response.stepId}:${option.option_id}`);
    }
    if (option.safety_flag === "urgent") {
      urgent.push(`${module.child_scenario_id}:${response.stepId}:${option.option_id}`);
    }
  }

  const shareAudience = input.shareAudience ?? module.sharing_default;
  const parentVisible = shareAudience === "parent" || shareAudience === "both";

  return {
    childScenarioId: module.child_scenario_id,
    title: module.title,
    score,
    safetyFlags: { review, urgent },
    parentVisible,
    shareAudience,
    childRecord: {
      child_id: input.childId,
      case_id: input.caseId,
      item_type: "child_safety_scenario",
      item_title: module.title,
      summary_text: parentVisible
        ? "Child chose to share this child-safety activity."
        : "Private child-safety activity. Parent visibility is blocked unless the child shares it.",
      share_audience: shareAudience,
      structured_data: {
        child_scenario_id: module.child_scenario_id,
        title: module.title,
        age_range: module.age_range,
        goals: module.scenario.goals,
        responses: input.responses,
        child_safety_score: score,
        safety_flags: { review, urgent },
        parent_visible: parentVisible,
        source: "scenario_activity_engine",
      },
    },
  };
}

export function evaluateDecisionTree(input: {
  decisionTreeId: string;
  selectedOptionIds: string[];
  userId: string;
  caseId: string;
  lessonId?: string | null;
  questId?: string | null;
  validatedBy?: "facilitator" | "system" | "caseworker";
}): DecisionTreeEvaluation {
  const tree = getDecisionTreeById(input.decisionTreeId);
  if (!tree) {
    throw new Error("Decision tree not found.");
  }

  const scores: Partial<Record<ScenarioDimension, number>> = {};
  const path: DecisionTreeEvaluation["path"] = [];
  let current = tree.root;
  let optionIndex = 0;

  while (!tree.endings[current]) {
    const node = tree.nodes.find((item) => item.node_id === current);
    if (!node) {
      throw new Error(`Decision tree node not found: ${current}`);
    }

    const selectedOptionId = input.selectedOptionIds[optionIndex];
    const selected = node.options.find((option) => option.option_id === selectedOptionId);
    if (!selected) {
      throw new Error(`Decision tree option not found for node ${current}.`);
    }

    for (const [dimension, impact] of Object.entries(selected.impact ?? {})) {
      addScore(scores, dimension as ScenarioDimension, impact ?? 0);
    }

    path.push({ nodeId: node.node_id, optionId: selected.option_id, next: selected.next });
    current = selected.next;
    optionIndex += 1;
  }

  const ending = tree.endings[current];
  for (const [dimension, impact] of Object.entries(ending.scores)) {
    addScore(scores, dimension as ScenarioDimension, impact ?? 0);
  }

  const scoreValues = Object.values(scores);
  const score = scoreValues.length > 0
    ? Math.round((scoreValues.reduce((sum, value) => sum + (value ?? 0), 0) / scoreValues.length) * 10) / 10
    : 0;
  const amber = (scores.conflict_risk ?? 0) > 0 ? [`${tree.decision_tree_id}:conflict_risk`] : [];
  const red = score < -1 ? [`${tree.decision_tree_id}:negative_ending`] : [];

  return {
    decisionTreeId: tree.decision_tree_id,
    title: tree.title,
    path,
    endingId: current,
    summary: ending.summary,
    scores,
    riskFlags: { amber, red },
    assessmentRecord: {
      user_id: input.userId,
      case_id: input.caseId,
      lesson_id: input.lessonId ?? tree.decision_tree_id,
      quest_id: input.questId ?? null,
      evidence_type: "decision_tree",
      evidence_payload: {
        decision_tree_id: tree.decision_tree_id,
        title: tree.title,
        path,
        ending_id: current,
        summary: ending.summary,
        scores,
        source: "scenario_activity_engine",
      },
      score,
      risk_flags: { amber, red },
      validated_by: input.validatedBy ?? "system",
    },
  };
}

export function evaluateHighRiskEscalation(input: {
  escalationMapId: string;
  observedIndicators: string[];
}): HighRiskEscalationEvaluation {
  const map = getHighRiskEscalationMapById(input.escalationMapId);
  if (!map) {
    throw new Error("High-risk safety escalation map not found.");
  }

  const normalizedObserved = new Set(input.observedIndicators.map((indicator) => indicator.trim().toLowerCase()));
  const matchedLevels = map.levels
    .map((level) => ({
      level,
      matchedIndicators: level.indicators.filter((indicator) => normalizedObserved.has(indicator.toLowerCase())),
    }))
    .filter((item) => item.matchedIndicators.length > 0);
  const highestMatch = matchedLevels.sort((a, b) => b.level.level - a.level.level)[0] ?? null;
  const matchedIndicators = matchedLevels.flatMap((item) => item.matchedIndicators);

  return {
    escalationMapId: map.escalation_map_id,
    title: map.title,
    matchedIndicators,
    recommendedLevel: highestMatch
      ? {
          level: highestMatch.level.level,
          label: highestMatch.level.label,
          actions: highestMatch.level.actions,
        }
      : null,
    requiresImmediateHumanReview: (highestMatch?.level.level ?? 0) >= 2,
    integrationLinks: map.integration.links_to,
  };
}

export function evaluateRiskMatrix(input: {
  riskMatrixId: string;
  domainScores: Record<string, number>;
}): RiskMatrixEvaluation {
  const matrix = getRiskMatrixById(input.riskMatrixId);
  if (!matrix) {
    throw new Error("Risk matrix module not found.");
  }

  const normalizedScores: Record<string, number> = {};
  const flaggedDomains: string[] = [];

  for (const domain of matrix.domains) {
    const rawScore = input.domainScores[domain.domain_id] ?? domain.scale.min;
    const score = clamp(rawScore, domain.scale.min, domain.scale.max);
    normalizedScores[domain.domain_id] = score;

    if (matrix.scoring_rules.auto_flag_domains && score >= matrix.scoring_rules.high_risk_threshold) {
      flaggedDomains.push(domain.domain_id);
    }
  }

  const highestScore = Math.max(...Object.values(normalizedScores));
  const riskProfile = highestScore >= matrix.scoring_rules.high_risk_threshold + 1
    ? "high"
    : flaggedDomains.length > 0
      ? "moderate"
      : "low";
  const priorityInterventionList = matrix.scoring_rules.auto_assign_interventions
    ? flaggedDomains.map((domainId) => {
        const domain = matrix.domains.find((item) => item.domain_id === domainId);
        return `Review ${domain?.label ?? domainId} indicators and assign targeted intervention.`;
      })
    : [];
  const safetyEscalationLevel = riskProfile === "high" ? 3 : riskProfile === "moderate" ? 2 : 1;

  return {
    riskMatrixId: matrix.risk_matrix_id,
    title: matrix.title,
    domainScores: normalizedScores,
    riskProfile,
    flaggedDomains,
    priorityInterventionList,
    safetyEscalationLevel,
  };
}

export function evaluateCaseManagementTier(input: {
  caseMapId: string;
  riskProfile: "low" | "moderate" | "high";
  completedRequirements: string[];
}): CaseManagementTierEvaluation {
  const map = getCaseManagementMapById(input.caseMapId);
  if (!map) {
    throw new Error("Case management map not found.");
  }

  const completed = new Set(input.completedRequirements);
  const riskTier = input.riskProfile === "high" ? 3 : input.riskProfile === "moderate" ? 2 : 1;
  const requirementTier = map.tiers.find((tier) => tier.requirements.every((requirement) => completed.has(requirement)))?.tier ?? 1;
  const recommendedTierNumber = Math.max(riskTier, requirementTier);
  const recommendedTier = map.tiers.find((tier) => tier.tier === recommendedTierNumber) ?? map.tiers[0];

  return {
    caseMapId: map.case_map_id,
    title: map.title,
    recommendedTier,
    reasons: [
      `Risk profile maps to tier ${riskTier}.`,
      `Completed requirements currently support tier ${requirementTier}.`,
      map.movement_rules.auto_escalate_on_risk ? "Risk escalation rule is enabled." : "Risk escalation rule is not enabled.",
    ],
  };
}

export function evaluateParentCapacityGrowth(input: {
  growthTrackerId: string;
  records: { dimension: string; score: number; sequence: number }[];
}): ParentCapacityGrowthEvaluation {
  const tracker = getGrowthTrackerById(input.growthTrackerId);
  if (!tracker) {
    throw new Error("Parent capacity growth tracker not found.");
  }

  const dimensionAverages: Record<string, number> = {};
  const trends: ParentCapacityGrowthEvaluation["trends"] = {};

  for (const dimension of tracker.dimensions) {
    const records = input.records
      .filter((record) => record.dimension === dimension)
      .sort((a, b) => a.sequence - b.sequence);
    if (records.length === 0) {
      dimensionAverages[dimension] = 0;
      trends[dimension] = "insufficient_data";
      continue;
    }

    dimensionAverages[dimension] = Math.round((records.reduce((sum, record) => sum + record.score, 0) / records.length) * 10) / 10;
    if (records.length < 2) {
      trends[dimension] = "insufficient_data";
      continue;
    }

    const delta = records[records.length - 1].score - records[0].score;
    trends[dimension] = delta > 0 ? "improving" : delta < 0 ? "declining" : "stable";
  }

  return {
    growthTrackerId: tracker.growth_tracker_id,
    title: tracker.title,
    dimensionAverages,
    trends,
  };
}

export function evaluateSystemHealthDiagnostic(input: {
  systemDiagnosticId: string;
  checkStatuses: Record<string, boolean>;
}): SystemHealthDiagnosticEvaluation {
  const diagnostic = getSystemDiagnosticById(input.systemDiagnosticId);
  if (!diagnostic) {
    throw new Error("System diagnostic module not found.");
  }

  const failedChecks = diagnostic.checks.filter((check) => input.checkStatuses[check] !== true);

  return {
    systemDiagnosticId: diagnostic.system_diagnostic_id,
    title: diagnostic.title,
    status: failedChecks.length === 0 ? "healthy" : "needs_attention",
    failedChecks,
    recommendedFixes: failedChecks.map((check) => `Review and repair ${check}.`),
    performanceMetrics: {
      passedChecks: diagnostic.checks.length - failedChecks.length,
      totalChecks: diagnostic.checks.length,
    },
  };
}

export function evaluateHighRiskContactSession(input: {
  contactSessionId: string;
  observedRiskFactors: string[];
}): HighRiskContactSessionEvaluation {
  const module = getHighRiskContactSessionModuleById(input.contactSessionId);
  if (!module) {
    throw new Error("High-risk contact session module not found.");
  }

  const observed = new Set(input.observedRiskFactors.map((factor) => factor.trim().toLowerCase()));
  const matchedRiskFactors = module.risk_factors.filter((factor) => observed.has(factor.toLowerCase()));
  const riskLevel = matchedRiskFactors.includes("child fear indicators") || matchedRiskFactors.length >= 3
    ? "red"
    : matchedRiskFactors.length > 0
      ? "amber"
      : "green";

  return {
    contactSessionId: module.contact_session_id,
    title: module.title,
    matchedRiskFactors,
    riskLevel,
    facilitatorInterventionRequired: riskLevel !== "green",
    progressionSignal: riskLevel === "red" ? "escalate_review" : riskLevel === "amber" ? "hold" : "clear",
    recommendedActions: riskLevel === "green"
      ? ["Continue observation and document clear progression signals."]
      : module.components
          .filter((component) => component.type === "intervention" && component.instructions)
          .map((component) => component.instructions as string),
  };
}

export function evaluateStabilityIndex(input: {
  stabilityIndexId: string;
  factorScores: Record<string, number>;
}): StabilityIndexEvaluation {
  const module = getStabilityIndexById(input.stabilityIndexId);
  if (!module) {
    throw new Error("Stability index module not found.");
  }

  const scores = module.factors.map((factor) => clamp(input.factorScores[factor] ?? 1, 1, 5));
  const stabilityScore = Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10;
  const thresholds = module.scoring_rules.thresholds;
  const status = stabilityScore >= thresholds.stable
    ? "stable"
    : stabilityScore >= thresholds.moderate
      ? "moderate"
      : "unstable";
  const riskFlags = module.factors.filter((factor) => (input.factorScores[factor] ?? 1) <= thresholds.unstable);

  return {
    stabilityIndexId: module.stability_index_id,
    title: module.title,
    stabilityScore,
    status,
    riskFlags,
    recommendedInterventions: riskFlags.map((factor) => `Assign targeted support for ${factor.replace(/_/g, " ")}.`),
  };
}

export function evaluateParentStressLoad(input: {
  stressModuleId: string;
  domainScores: Record<string, number>;
}): DomainPressureEvaluation {
  const module = getStressLoadModuleById(input.stressModuleId);
  if (!module) {
    throw new Error("Parent stress-load compression module not found.");
  }

  return evaluateDomainPressure({
    moduleId: module.stress_module_id,
    title: module.title,
    domains: module.domains,
    tasks: module.tasks,
    domainScores: input.domainScores,
  });
}

export function evaluateFamilyEmotionalClimate(input: {
  climateModuleId: string;
  domainScores: Record<string, number>;
}): DomainPressureEvaluation {
  const module = getFamilyClimateModuleById(input.climateModuleId);
  if (!module) {
    throw new Error("Family emotional climate module not found.");
  }

  return evaluateDomainPressure({
    moduleId: module.climate_module_id,
    title: module.title,
    domains: module.domains,
    tasks: module.tasks,
    domainScores: input.domainScores,
  });
}

export function evaluateChildSocialSafety(input: {
  childSocialSafetyId: string;
  domainScores: Record<string, number>;
}): DomainPressureEvaluation {
  const module = getChildSocialSafetyModuleById(input.childSocialSafetyId);
  if (!module) {
    throw new Error("Child social safety module not found.");
  }

  return evaluateDomainPressure({
    moduleId: module.child_social_safety_id,
    title: module.title,
    domains: module.domains,
    tasks: module.tasks,
    domainScores: input.domainScores,
  });
}

export function evaluateChildPatternStabilizer(input: {
  patternStabilizerId: string;
  patternScores: Record<string, number>;
}): DomainPressureEvaluation {
  const module = getChildPatternStabilizerById(input.patternStabilizerId);
  if (!module) {
    throw new Error("Child emotional pattern stabilizer module not found.");
  }

  return evaluateDomainPressure({
    moduleId: module.pattern_stabilizer_id,
    title: module.title,
    domains: module.patterns,
    tasks: module.tasks,
    domainScores: input.patternScores,
  });
}

export function evaluateFamilyEmotionalArchitecture(input: {
  architectureModuleId: string;
  domainScores: Record<string, number>;
}): DomainPressureEvaluation {
  const module = getFamilyArchitectureModuleById(input.architectureModuleId);
  if (!module) {
    throw new Error("Family emotional architecture module not found.");
  }

  return evaluateDomainPressure({
    moduleId: module.architecture_module_id,
    title: module.title,
    domains: module.domains,
    tasks: module.tasks,
    domainScores: input.domainScores,
  });
}

export function evaluateChildSensoryRegulation(input: {
  sensoryRegulationId: string;
  domainScores: Record<string, number>;
}): DomainPressureEvaluation {
  const module = getChildSensoryRegulationModuleById(input.sensoryRegulationId);
  if (!module) {
    throw new Error("Child sensory regulation module not found.");
  }

  return evaluateDomainPressure({
    moduleId: module.sensory_regulation_id,
    title: module.title,
    domains: [...module.domains],
    tasks: [...module.tasks],
    domainScores: input.domainScores,
  });
}

export function evaluateParentEmotionalExpansion(input: {
  emotionExpansionId: string;
  domainScores: Record<string, number>;
}): DomainPressureEvaluation {
  const module = getParentEmotionalExpansionModuleById(input.emotionExpansionId);
  if (!module) {
    throw new Error("Parent emotional expansion module not found.");
  }

  return evaluateDomainPressure({
    moduleId: module.emotion_expansion_id,
    title: module.title,
    domains: [...module.domains],
    tasks: [...module.tasks],
    domainScores: input.domainScores,
  });
}

export function evaluateFamilyStressRedistribution(input: {
  stressRedistributionId: string;
  domainScores: Record<string, number>;
}): DomainPressureEvaluation {
  const module = getFamilyStressRedistributionModuleById(input.stressRedistributionId);
  if (!module) {
    throw new Error("Family stress-load redistribution module not found.");
  }

  return evaluateDomainPressure({
    moduleId: module.stress_redistribution_id,
    title: module.title,
    domains: [...module.domains],
    tasks: [...module.tasks],
    domainScores: input.domainScores,
  });
}

export function evaluateParentBehaviourCalibration(input: {
  calibrationModuleId: string;
  domainScores: Record<string, number>;
}): DomainPressureEvaluation {
  const module = getParentBehaviourCalibrationModuleById(input.calibrationModuleId);
  if (!module) {
    throw new Error("Parent behaviour calibration module not found.");
  }

  return evaluateDomainPressure({
    moduleId: module.calibration_module_id,
    title: module.title,
    domains: [...module.domains],
    tasks: [...module.tasks],
    domainScores: input.domainScores,
  });
}

export function evaluateFamilyPredictabilityArchitecture(input: {
  predictabilityArchId: string;
  domainScores: Record<string, number>;
}): DomainPressureEvaluation {
  const module = getFamilyPredictabilityArchitectureModuleById(input.predictabilityArchId);
  if (!module) {
    throw new Error("Family predictability architecture module not found.");
  }

  return evaluateDomainPressure({
    moduleId: module.predictability_arch_id,
    title: module.title,
    domains: [...module.domains],
    tasks: [...module.tasks],
    domainScores: input.domainScores,
  });
}

export function evaluateChildMicroTrigger(input: {
  microTriggerId: string;
  domainScores: Record<string, number>;
}): DomainPressureEvaluation {
  const module = getChildMicroTriggerModuleById(input.microTriggerId);
  if (!module) {
    throw new Error("Child micro-trigger identification module not found.");
  }

  return evaluateDomainPressure({
    moduleId: module.micro_trigger_id,
    title: module.title,
    domains: [...module.domains],
    tasks: [...module.tasks],
    domainScores: input.domainScores,
  });
}

export function evaluateParentCognitiveLoad(input: {
  cognitiveLoadId: string;
  domainScores: Record<string, number>;
}): DomainPressureEvaluation {
  const module = getParentCognitiveLoadModuleById(input.cognitiveLoadId);
  if (!module) {
    throw new Error("Parent cognitive load reduction module not found.");
  }

  return evaluateDomainPressure({
    moduleId: module.cognitive_load_id,
    title: module.title,
    domains: [...module.domains],
    tasks: [...module.tasks],
    domainScores: input.domainScores,
  });
}

export function evaluateParentGroundingArchitecture(input: {
  groundingArchId: string;
  domainScores: Record<string, number>;
}): DomainPressureEvaluation {
  const module = getParentGroundingArchitectureModuleById(input.groundingArchId);
  if (!module) {
    throw new Error("Parent emotional grounding architecture module not found.");
  }

  return evaluateDomainPressure({
    moduleId: module.grounding_arch_id,
    title: module.title,
    domains: [...module.domains],
    tasks: [...module.tasks],
    domainScores: input.domainScores,
  });
}

export function evaluateHighRiskHouseholdEmotionalSafety(input: {
  householdEmotionalSafetyId: string;
  domainScores: Record<string, number>;
}): DomainPressureEvaluation {
  const module = getHighRiskHouseholdEmotionalSafetyModuleById(input.householdEmotionalSafetyId);
  if (!module) {
    throw new Error("High-risk household emotional safety module not found.");
  }

  return evaluateDomainPressure({
    moduleId: module.household_emotional_safety_id,
    title: module.title,
    domains: [...module.domains],
    tasks: [...module.tasks],
    domainScores: input.domainScores,
  });
}

export function evaluateFamilyEmotionalStabilityBlueprint(input: {
  stabilityBlueprintId: string;
  domainScores: Record<string, number>;
}): DomainPressureEvaluation {
  const module = getFamilyEmotionalStabilityBlueprintById(input.stabilityBlueprintId);
  if (!module) {
    throw new Error("Family emotional stability blueprint not found.");
  }

  return evaluateDomainPressure({
    moduleId: module.stability_blueprint_id,
    title: module.title,
    domains: [...module.domains],
    tasks: [...module.tasks],
    domainScores: input.domainScores,
  });
}

function evaluateDomainPressure(input: {
  moduleId: string;
  title: string;
  domains: string[];
  tasks: string[];
  domainScores: Record<string, number>;
}): DomainPressureEvaluation {
  const scores = input.domains.map((domain) => clamp(input.domainScores[domain] ?? 1, 1, 5));
  const averageScore = Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10;
  const pressureLevel = averageScore >= 4 ? "high" : averageScore >= 3 ? "moderate" : "low";
  const flaggedDomains = input.domains.filter((domain) => (input.domainScores[domain] ?? 1) >= 4);

  return {
    moduleId: input.moduleId,
    title: input.title,
    averageScore,
    pressureLevel,
    flaggedDomains,
    recommendedTasks: flaggedDomains.length > 0 ? input.tasks : [],
  };
}
