import type { AssessmentDomain, AssessmentItem, AssessmentScoringBand } from "../engines/assessmentScoringEngine";
import rawDefinitionMatchupQuiz from "../../definition matchup/safesteps_definition_matchup_100.json";
import rawDefinitionMatchupQuiz201To1200 from "../../definition matchup/safesteps_definition_matchup_201_1200.json";

export type SafeStepsDefinitionMatchupOption = {
  id: string;
  label: string;
  text: string;
};

export type SafeStepsDefinitionMatchupQuestion = {
  id: string;
  number: number;
  assessmentType: "definition_meaning_match";
  domain?: string;
  competency?: string;
  term: string;
  prompt: string;
  options: SafeStepsDefinitionMatchupOption[];
  correctOptionId: string;
  correctDefinition: string;
  explanation: string;
  points: number;
  shuffleOptions: boolean;
  allowRetry: boolean;
  maxAttempts: number;
};

export type SafeStepsDefinitionMatchupScoreBand = {
  minimum?: number;
  maximum?: number;
  minimumPercentage?: number;
  maximumPercentage?: number;
  label: string;
  action: string;
};

export type SafeStepsDefinitionMatchupQuiz = {
  schemaVersion: string;
  id: string;
  title: string;
  description: string;
  instructions: string;
  questionCount: number;
  questionNumberStart?: number;
  questionNumberEnd?: number;
  domainCount?: number;
  competenciesPerDomain?: number;
  scoring: {
    pointsPerCorrectAnswer: number;
    pointsPerIncorrectAnswer: number;
    maximumScore?: number;
    fullBankMaximumScore?: number;
    percentageFormula: string;
    scoreBands: SafeStepsDefinitionMatchupScoreBand[];
    passingScore?: number;
    passingPercentage?: number;
    completionRule: string;
    interpretationSafeguard: string;
  };
  delivery: {
    selectionMode: "single_answer";
    optionsPerQuestion: number;
    randomiseQuestionOrder: boolean;
    randomiseOptionOrder: boolean;
    recommendedQuestionsPerAttempt: number;
    supportedAttemptSizes?: number[];
    balanceAttemptsAcrossDomains?: boolean;
    showCorrectAnswerAfterAttempt: boolean;
    showExplanationAfterAttempt: boolean;
    recordAttemptHistory: boolean;
    preventDuplicateQuestionsWithinAttempt?: boolean;
  };
  questions: SafeStepsDefinitionMatchupQuestion[];
};

export const safeStepsDefinitionMatchupQuizSlug = "safesteps-definition-meaning-match-v1";

export const safeStepsDefinitionMatchupQuiz = rawDefinitionMatchupQuiz as SafeStepsDefinitionMatchupQuiz;

export const safeStepsDefinitionMatchupQuiz201To1200 =
  rawDefinitionMatchupQuiz201To1200 as SafeStepsDefinitionMatchupQuiz;

export const safeStepsDefinitionMatchupBanks = [
  safeStepsDefinitionMatchupQuiz,
  safeStepsDefinitionMatchupQuiz201To1200,
];

export const safeStepsDefinitionMatchupQuestions = safeStepsDefinitionMatchupQuiz.questions;

export const allSafeStepsDefinitionMatchupQuestions = safeStepsDefinitionMatchupBanks.flatMap((bank) => bank.questions);

export const safeStepsDefinitionMatchupDomain: AssessmentDomain = {
  id: "definition_meaning_match",
  name: "Definition and Meaning Match-Up",
  weight: 1,
};

export const safeStepsDefinitionMatchupScoringBands: AssessmentScoringBand[] =
  safeStepsDefinitionMatchupQuiz.scoring.scoreBands.map((band) => ({
    id: band.label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
    label: band.label,
    minScore: band.minimum ?? band.minimumPercentage ?? 0,
    maxScore: band.maximum ?? band.maximumPercentage ?? 0,
    recommendation: band.action,
  }));

const getQuestionPointValue = (question: SafeStepsDefinitionMatchupQuestion) =>
  question.points ?? safeStepsDefinitionMatchupQuiz.scoring.pointsPerCorrectAnswer;

export const toDefinitionMatchupScoringItems = (
  questions: SafeStepsDefinitionMatchupQuestion[] = safeStepsDefinitionMatchupQuestions,
): AssessmentItem[] =>
  questions.map((question) => ({
    id: question.id,
    domainId: safeStepsDefinitionMatchupDomain.id,
    itemType: "multiple_choice",
    weight: getQuestionPointValue(question),
    options: question.options.map((option) => ({
      id: option.id,
      itemId: question.id,
      value: option.label,
      label: option.text,
      score: option.id === question.correctOptionId ? getQuestionPointValue(question) : 0,
    })),
  }));

export function getDefinitionMatchupQuestionById(id: string) {
  return allSafeStepsDefinitionMatchupQuestions.find((question) => question.id === id);
}

function getInvalidOptionQuestions(questions: SafeStepsDefinitionMatchupQuestion[], optionsPerQuestion: number) {
  return questions.filter((question) => question.options.length !== optionsPerQuestion);
}

function getMissingCorrectOptionQuestions(questions: SafeStepsDefinitionMatchupQuestion[]) {
  return questions.filter((question) => !question.options.some((option) => option.id === question.correctOptionId));
}

function getQuestionNumberGaps(questions: SafeStepsDefinitionMatchupQuestion[]) {
  const numbers = [...new Set(questions.map((question) => question.number))].sort((a, b) => a - b);
  const gaps: { from: number; to: number }[] = [];

  for (let index = 1; index < numbers.length; index += 1) {
    const previous = numbers[index - 1];
    const current = numbers[index];

    if (current - previous > 1) {
      gaps.push({ from: previous + 1, to: current - 1 });
    }
  }

  return gaps;
}

export function getDefinitionMatchupReadinessSummary() {
  const questionIds = new Set(safeStepsDefinitionMatchupQuestions.map((question) => question.id));
  const terms = new Set(safeStepsDefinitionMatchupQuestions.map((question) => question.term));
  const invalidOptionCounts = getInvalidOptionQuestions(
    safeStepsDefinitionMatchupQuestions,
    safeStepsDefinitionMatchupQuiz.delivery.optionsPerQuestion,
  );
  const missingCorrectOptions = getMissingCorrectOptionQuestions(safeStepsDefinitionMatchupQuestions);

  return {
    slug: safeStepsDefinitionMatchupQuizSlug,
    quizId: safeStepsDefinitionMatchupQuiz.id,
    questionCount: safeStepsDefinitionMatchupQuestions.length,
    declaredQuestionCount: safeStepsDefinitionMatchupQuiz.questionCount,
    uniqueQuestionCount: questionIds.size,
    uniqueTermCount: terms.size,
    optionsPerQuestion: safeStepsDefinitionMatchupQuiz.delivery.optionsPerQuestion,
    invalidOptionCountQuestions: invalidOptionCounts.length,
    missingCorrectOptionQuestions: missingCorrectOptions.length,
    maximumScore: safeStepsDefinitionMatchupQuiz.scoring.maximumScore ?? safeStepsDefinitionMatchupQuiz.questionCount,
    passingScore: safeStepsDefinitionMatchupQuiz.scoring.passingScore ?? safeStepsDefinitionMatchupQuiz.scoring.passingPercentage,
    interpretationSafeguard: safeStepsDefinitionMatchupQuiz.scoring.interpretationSafeguard,
    readyForRuntimeIntegration:
      safeStepsDefinitionMatchupQuestions.length === safeStepsDefinitionMatchupQuiz.questionCount &&
      questionIds.size === safeStepsDefinitionMatchupQuiz.questionCount &&
      invalidOptionCounts.length === 0 &&
      missingCorrectOptions.length === 0,
  };
}

export function getDefinitionMatchupBankReadinessSummaries() {
  return safeStepsDefinitionMatchupBanks.map((bank) => {
    const questions = bank.questions;
    const questionIds = new Set(questions.map((question) => question.id));
    const terms = new Set(questions.map((question) => question.term));
    const invalidOptionQuestions = getInvalidOptionQuestions(questions, bank.delivery.optionsPerQuestion);
    const missingCorrectOptionQuestions = getMissingCorrectOptionQuestions(questions);
    const numberGaps = getQuestionNumberGaps(questions);

    return {
      quizId: bank.id,
      title: bank.title,
      questionCount: questions.length,
      declaredQuestionCount: bank.questionCount,
      uniqueQuestionCount: questionIds.size,
      uniqueTermCount: terms.size,
      questionNumberStart: bank.questionNumberStart ?? Math.min(...questions.map((question) => question.number)),
      questionNumberEnd: bank.questionNumberEnd ?? Math.max(...questions.map((question) => question.number)),
      optionsPerQuestion: bank.delivery.optionsPerQuestion,
      invalidOptionCountQuestions: invalidOptionQuestions.length,
      missingCorrectOptionQuestions: missingCorrectOptionQuestions.length,
      questionNumberGaps: numberGaps,
      maximumScore: bank.scoring.maximumScore ?? bank.scoring.fullBankMaximumScore ?? bank.questionCount,
      passingScore: bank.scoring.passingScore ?? bank.scoring.passingPercentage,
      interpretationSafeguard: bank.scoring.interpretationSafeguard,
      readyForRuntimeIntegration:
        questions.length === bank.questionCount &&
        questionIds.size === bank.questionCount &&
        invalidOptionQuestions.length === 0 &&
        missingCorrectOptionQuestions.length === 0 &&
        numberGaps.length === 0,
    };
  });
}

export function getDefinitionMatchupCombinedReadinessSummary() {
  const questionIds = new Set(allSafeStepsDefinitionMatchupQuestions.map((question) => question.id));
  const terms = new Set(allSafeStepsDefinitionMatchupQuestions.map((question) => question.term));
  const domains = new Set(
    allSafeStepsDefinitionMatchupQuestions.flatMap((question) => (question.domain ? [question.domain] : [])),
  );
  const competencies = new Set(
    allSafeStepsDefinitionMatchupQuestions.flatMap((question) => (question.competency ? [question.competency] : [])),
  );
  const invalidOptionQuestions = safeStepsDefinitionMatchupBanks.flatMap((bank) =>
    getInvalidOptionQuestions(bank.questions, bank.delivery.optionsPerQuestion),
  );
  const missingCorrectOptionQuestions = getMissingCorrectOptionQuestions(allSafeStepsDefinitionMatchupQuestions);
  const questionNumberGaps = getQuestionNumberGaps(allSafeStepsDefinitionMatchupQuestions);
  const bankSummaries = getDefinitionMatchupBankReadinessSummaries();

  return {
    slug: "safesteps-definition-meaning-match-combined-v1",
    bankCount: safeStepsDefinitionMatchupBanks.length,
    questionCount: allSafeStepsDefinitionMatchupQuestions.length,
    declaredQuestionCount: safeStepsDefinitionMatchupBanks.reduce((total, bank) => total + bank.questionCount, 0),
    uniqueQuestionCount: questionIds.size,
    uniqueTermCount: terms.size,
    domainCount: domains.size,
    competencyCount: competencies.size,
    invalidOptionCountQuestions: invalidOptionQuestions.length,
    missingCorrectOptionQuestions: missingCorrectOptionQuestions.length,
    questionNumberGaps,
    interpretationSafeguard: safeStepsDefinitionMatchupQuiz.scoring.interpretationSafeguard,
    bankSummaries,
    readyForRuntimeIntegration:
      bankSummaries.every((summary) => summary.readyForRuntimeIntegration) &&
      allSafeStepsDefinitionMatchupQuestions.length === questionIds.size &&
      invalidOptionQuestions.length === 0 &&
      missingCorrectOptionQuestions.length === 0,
  };
}
