import rawProofOfChange from "../../proof-of-change/proof_of_change_tasks_001_100.json";
import rawDefinitionMatchup from "../../definition matchup/safesteps_definition_matchup_100.json";
import rawDefinitionMatchup201To1200 from "../../definition matchup/safesteps_definition_matchup_201_1200.json";
import rawSequenceKnowledge from "../../sequence-knowledge/safesteps_sequence_knowledge_universe_1000.json";

type ProofOfChangeTask = {
  id: number;
  code: string;
  categoryId: string;
  title: string;
};

type ProofOfChangeDataset = {
  schemaVersion: string;
  program: {
    id: string;
    name: string;
    taskRange: { from: number; to: number };
    totalProgramTasks: number;
  };
  defaults: {
    evidenceRequired: boolean;
    evidenceOptions: string[];
    statuses: string[];
    safeguards: {
      childConsentRequiredWhenApplicable: boolean;
      allowAlternativeEvidence: boolean;
      barriersMustBeConsidered: boolean;
      singleUploadDoesNotProveSustainedChange: boolean;
    };
  };
  categories: { id: string; name: string; taskIds: number[] }[];
  tasks: ProofOfChangeTask[];
};

type DefinitionMatchupDataset = {
  schemaVersion: string;
  id: string;
  questionCount: number;
  questionNumberStart?: number;
  questionNumberEnd?: number;
  domainCount?: number;
  competenciesPerDomain?: number;
  scoring: {
    passingScore?: number;
    passingPercentage?: number;
    interpretationSafeguard: string;
  };
  delivery: {
    optionsPerQuestion: number;
  };
  questions: {
    id: string;
    number: number;
    term: string;
    options: { id: string; text: string }[];
    correctOptionId: string;
  }[];
};

type SequenceKnowledgeDataset = {
  schema_version: string;
  dataset_id: string;
  ethical_use: string;
  generation_summary: {
    assessment_count: number;
    domain_count: number;
    context_count: number;
    correct_steps_per_assessment: number;
  };
  assessments: {
    id: string;
    assessment_type: "sequence_knowledge_with_distractors";
    status: string;
    domain: string;
    context: { id: string; label: string; setting: string };
    items: {
      step_id: string;
      text: string;
      item_type: "correct_step" | "distractor";
      correct_position?: number;
      critical?: boolean;
      distractor_reason?: string;
      display_order: number;
    }[];
  }[];
};

export type SequenceKnowledgeThemeBundleManifest = {
  id: "safesteps_sequence_ui_theme_bundle";
  sourcePath: string;
  sha256: string;
  entries: {
    path: string;
    expectedBytes: number;
    purpose: "readme" | "mock_screen" | "theme";
  }[];
  integrationRule: string;
  safeguards: string[];
};

export type LearningAssessmentDatasetSummary = {
  id: string;
  title: string;
  sourcePath: string;
  itemCount: number;
  readyForRuntimeIntegration: boolean;
  safeguards: string[];
};

export const proofOfChangeTasksDataset = rawProofOfChange as ProofOfChangeDataset;
export const definitionMatchupDataset = rawDefinitionMatchup as DefinitionMatchupDataset;
export const definitionMatchup201To1200Dataset = rawDefinitionMatchup201To1200 as DefinitionMatchupDataset;
export const definitionMatchupDatasets = [definitionMatchupDataset, definitionMatchup201To1200Dataset];
export const sequenceKnowledgeDataset = rawSequenceKnowledge as SequenceKnowledgeDataset;

export const sequenceKnowledgeThemeBundleManifest: SequenceKnowledgeThemeBundleManifest = {
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
  integrationRule:
    "Treat the zip as a design/reference bundle until its mock data is replaced by selected assessment items and trusted server-side scoring.",
  safeguards: [
    "Do not ship the bundled mock screen with hard-coded answer keys as a production assessment route.",
    "Do not expose correct step positions or distractor reasons to the mobile client before submission.",
    "Submit ordered IDs and excluded IDs to trusted scoring code.",
    "Keep sequence results framed as formative learning evidence unless combined with human review and other evidence.",
  ],
};

export const learningAssessmentContentSources = [
  {
    id: "proof_of_change_tasks_001_100",
    title: proofOfChangeTasksDataset.program.name,
    sourcePath: "proof-of-change/proof_of_change_tasks_001_100.json",
  },
  {
    id: definitionMatchupDataset.id,
    title: "SafeSteps Definition and Meaning Match-Up",
    sourcePath: "definition matchup/safesteps_definition_matchup_100.json",
  },
  {
    id: definitionMatchup201To1200Dataset.id,
    title: "SafeSteps Definition and Meaning Match-Up - Questions 201-1200",
    sourcePath: "definition matchup/safesteps_definition_matchup_201_1200.json",
  },
  {
    id: sequenceKnowledgeDataset.dataset_id,
    title: "SafeSteps Complete Sequence Knowledge Assessment Universe",
    sourcePath: "sequence-knowledge/safesteps_sequence_knowledge_universe_1000.json",
  },
  {
    id: sequenceKnowledgeThemeBundleManifest.id,
    title: "SafeSteps Sequence Knowledge UI Theme Bundle",
    sourcePath: sequenceKnowledgeThemeBundleManifest.sourcePath,
  },
];

export function getProofOfChangeReadinessSummary(): LearningAssessmentDatasetSummary & {
  categoryCount: number;
  declaredTaskRange: { from: number; to: number };
  totalProgramTasks: number;
  orphanTaskCount: number;
} {
  const taskIds = new Set(proofOfChangeTasksDataset.tasks.map((task) => task.id));
  const categoryTaskIds = new Set(proofOfChangeTasksDataset.categories.flatMap((category) => category.taskIds));
  const orphanTaskCount = proofOfChangeTasksDataset.tasks.filter((task) => !categoryTaskIds.has(task.id)).length;
  const missingCategoryTaskCount = [...categoryTaskIds].filter((taskId) => !taskIds.has(taskId)).length;

  return {
    id: "proof_of_change_tasks_001_100",
    title: proofOfChangeTasksDataset.program.name,
    sourcePath: "proof-of-change/proof_of_change_tasks_001_100.json",
    itemCount: proofOfChangeTasksDataset.tasks.length,
    categoryCount: proofOfChangeTasksDataset.categories.length,
    declaredTaskRange: proofOfChangeTasksDataset.program.taskRange,
    totalProgramTasks: proofOfChangeTasksDataset.program.totalProgramTasks,
    orphanTaskCount: orphanTaskCount + missingCategoryTaskCount,
    readyForRuntimeIntegration:
      proofOfChangeTasksDataset.tasks.length === 100 &&
      proofOfChangeTasksDataset.program.taskRange.from === 1 &&
      proofOfChangeTasksDataset.program.taskRange.to === 100 &&
      orphanTaskCount === 0 &&
      missingCategoryTaskCount === 0 &&
      proofOfChangeTasksDataset.defaults.safeguards.singleUploadDoesNotProveSustainedChange,
    safeguards: [
      "Every proof-of-change task is formative evidence, not a standalone parenting-capacity decision.",
      "Alternative evidence and documented barriers must remain available.",
      "A single upload must not be treated as sustained change.",
      "Child consent is required when child participation or child content is involved.",
    ],
  };
}

export function getDefinitionMatchupDatasetSummary(): LearningAssessmentDatasetSummary & {
  declaredQuestionCount: number;
  bankCount: number;
  questionNumberGaps: { from: number; to: number }[];
  invalidQuestionCount: number;
  passingScore: number | undefined;
} {
  const allQuestions = definitionMatchupDatasets.flatMap((dataset) => dataset.questions);
  const invalidQuestionCount = definitionMatchupDatasets.reduce(
    (total, dataset) =>
      total +
      dataset.questions.filter(
        (question) =>
          question.options.length !== dataset.delivery.optionsPerQuestion ||
          !question.options.some((option) => option.id === question.correctOptionId),
      ).length,
    0,
  );
  const declaredQuestionCount = definitionMatchupDatasets.reduce((total, dataset) => total + dataset.questionCount, 0);
  const questionNumbers = [...new Set(allQuestions.map((question) => question.number))].sort((a, b) => a - b);
  const questionNumberGaps: { from: number; to: number }[] = [];

  for (let index = 1; index < questionNumbers.length; index += 1) {
    const previous = questionNumbers[index - 1];
    const current = questionNumbers[index];

    if (current - previous > 1) {
      questionNumberGaps.push({ from: previous + 1, to: current - 1 });
    }
  }

  return {
    id: "safesteps_definition_meaning_match_available_banks",
    title: "SafeSteps Definition and Meaning Match-Up Available Banks",
    sourcePath: "definition matchup/",
    itemCount: allQuestions.length,
    declaredQuestionCount,
    bankCount: definitionMatchupDatasets.length,
    questionNumberGaps,
    invalidQuestionCount,
    passingScore: definitionMatchupDataset.scoring.passingScore ?? definitionMatchupDataset.scoring.passingPercentage,
    readyForRuntimeIntegration:
      allQuestions.length === declaredQuestionCount &&
      invalidQuestionCount === 0 &&
      definitionMatchupDatasets.every((dataset) => dataset.scoring.interpretationSafeguard.length > 0),
    safeguards: [definitionMatchupDataset.scoring.interpretationSafeguard],
  };
}

export function getSequenceKnowledgeDatasetSummary(): LearningAssessmentDatasetSummary & {
  declaredAssessmentCount: number;
  domainCount: number;
  contextCount: number;
  invalidAssessmentCount: number;
  criticalStepCoverageCount: number;
  themeBundle: {
    sourcePath: string;
    sha256: string;
    entryCount: number;
    expectedByteCount: number;
    integrationRule: string;
  };
} {
  const domains = new Set(sequenceKnowledgeDataset.assessments.map((assessment) => assessment.domain));
  const contexts = new Set(sequenceKnowledgeDataset.assessments.map((assessment) => assessment.context.id));
  const invalidAssessmentCount = sequenceKnowledgeDataset.assessments.filter((assessment) => {
    const correctSteps = assessment.items.filter((item) => item.item_type === "correct_step");
    const distractors = assessment.items.filter((item) => item.item_type === "distractor");
    const positions = new Set(correctSteps.map((item) => item.correct_position));

    return (
      correctSteps.length !== sequenceKnowledgeDataset.generation_summary.correct_steps_per_assessment ||
      distractors.length < 1 ||
      positions.size !== sequenceKnowledgeDataset.generation_summary.correct_steps_per_assessment ||
      !correctSteps.every((item) => typeof item.correct_position === "number")
    );
  }).length;
  const criticalStepCoverageCount = sequenceKnowledgeDataset.assessments.filter((assessment) =>
    assessment.items.some((item) => item.item_type === "correct_step" && item.critical),
  ).length;

  return {
    id: sequenceKnowledgeDataset.dataset_id,
    title: "SafeSteps Complete Sequence Knowledge Assessment Universe",
    sourcePath: "sequence-knowledge/safesteps_sequence_knowledge_universe_1000.json",
    itemCount: sequenceKnowledgeDataset.assessments.length,
    declaredAssessmentCount: sequenceKnowledgeDataset.generation_summary.assessment_count,
    domainCount: domains.size,
    contextCount: contexts.size,
    invalidAssessmentCount,
    criticalStepCoverageCount,
    themeBundle: {
      sourcePath: sequenceKnowledgeThemeBundleManifest.sourcePath,
      sha256: sequenceKnowledgeThemeBundleManifest.sha256,
      entryCount: sequenceKnowledgeThemeBundleManifest.entries.length,
      expectedByteCount: sequenceKnowledgeThemeBundleManifest.entries.reduce((sum, entry) => sum + entry.expectedBytes, 0),
      integrationRule: sequenceKnowledgeThemeBundleManifest.integrationRule,
    },
    readyForRuntimeIntegration:
      sequenceKnowledgeDataset.assessments.length === sequenceKnowledgeDataset.generation_summary.assessment_count &&
      domains.size === sequenceKnowledgeDataset.generation_summary.domain_count &&
      contexts.size === sequenceKnowledgeDataset.generation_summary.context_count &&
      invalidAssessmentCount === 0 &&
      criticalStepCoverageCount === sequenceKnowledgeDataset.assessments.length &&
      sequenceKnowledgeDataset.ethical_use.length > 0,
    safeguards: [sequenceKnowledgeDataset.ethical_use, ...sequenceKnowledgeThemeBundleManifest.safeguards],
  };
}

export function evaluateSequenceKnowledgeClientIntegration(input: {
  usesMockInitialSteps?: boolean;
  exposesCorrectPositions?: boolean;
  exposesDistractorReasons?: boolean;
  submitsOrderedAndExcludedIds?: boolean;
  trustedScoringConfigured?: boolean;
}) {
  const blockers: string[] = [];

  if (input.usesMockInitialSteps) {
    blockers.push("Replace bundled mock INITIAL_STEPS with selected sequence assessment items before production use.");
  }

  if (input.exposesCorrectPositions) {
    blockers.push("Correct step positions must not be exposed to the mobile client before submission.");
  }

  if (input.exposesDistractorReasons) {
    blockers.push("Distractor reasons must not be exposed to the mobile client before submission.");
  }

  if (!input.submitsOrderedAndExcludedIds) {
    blockers.push("The client must submit ordered IDs and excluded IDs for scoring.");
  }

  if (!input.trustedScoringConfigured) {
    blockers.push("Sequence knowledge scoring must run in trusted code.");
  }

  return {
    readyForProductionRoute: blockers.length === 0,
    blockers,
  };
}

export function getLearningAssessmentContentReadinessSummary() {
  const proofOfChange = getProofOfChangeReadinessSummary();
  const definitionMatchup = getDefinitionMatchupDatasetSummary();
  const sequenceKnowledge = getSequenceKnowledgeDatasetSummary();
  const datasets = [proofOfChange, definitionMatchup, sequenceKnowledge];

  return {
    datasetCount: datasets.length,
    totalAssessmentItems: datasets.reduce((sum, dataset) => sum + dataset.itemCount, 0),
    readyDatasetCount: datasets.filter((dataset) => dataset.readyForRuntimeIntegration).length,
    readyForRuntimeIntegration: datasets.every((dataset) => dataset.readyForRuntimeIntegration),
    datasets,
  };
}

export function evaluateLearningAssessmentUse(input: {
  purpose: "learning" | "formative_assessment" | "worker_review" | "court_report" | "safety_decision" | "capacity_decision";
  hasHumanReview?: boolean;
  combinesMultipleEvidenceSources?: boolean;
  childContentInvolved?: boolean;
  childConsentRecorded?: boolean;
}) {
  const blockers: string[] = [];

  if (["court_report", "safety_decision", "capacity_decision"].includes(input.purpose)) {
    if (!input.hasHumanReview) {
      blockers.push("High-impact use requires human review.");
    }

    if (!input.combinesMultipleEvidenceSources) {
      blockers.push("High-impact use requires multiple evidence sources beyond a quiz or task result.");
    }
  }

  if (input.childContentInvolved && !input.childConsentRecorded) {
    blockers.push("Child-involved assessment content requires recorded child consent when applicable.");
  }

  return {
    allowed: blockers.length === 0,
    blockers,
  };
}
