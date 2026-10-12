import type { AssessmentResponse } from "../lib/engines/assessmentScoringEngine";
import {
  allSafeStepsDefinitionMatchupQuestions,
  getDefinitionMatchupBankReadinessSummaries,
  getDefinitionMatchupCombinedReadinessSummary,
  getDefinitionMatchupQuestionById,
  getDefinitionMatchupReadinessSummary,
  safeStepsDefinitionMatchupDomain,
  safeStepsDefinitionMatchupQuestions,
  safeStepsDefinitionMatchupQuiz,
  safeStepsDefinitionMatchupQuizSlug,
  safeStepsDefinitionMatchupScoringBands,
  toDefinitionMatchupScoringItems,
} from "../lib/data/safeStepsDefinitionMatchupQuiz";
import { scoreAssessment } from "../lib/engines/assessmentScoringEngine";

describe("safeStepsDefinitionMatchupQuiz", () => {
  it("loads the 100-question definition and meaning match-up quiz", () => {
    const summary = getDefinitionMatchupReadinessSummary();

    expect(safeStepsDefinitionMatchupQuizSlug).toBe("safesteps-definition-meaning-match-v1");
    expect(summary).toMatchObject({
      quizId: "safesteps_definition_meaning_match_001_100",
      questionCount: 100,
      declaredQuestionCount: 100,
      uniqueQuestionCount: 100,
      optionsPerQuestion: 6,
      invalidOptionCountQuestions: 0,
      missingCorrectOptionQuestions: 0,
      maximumScore: 100,
      passingScore: 75,
      readyForRuntimeIntegration: true,
    });
    expect(safeStepsDefinitionMatchupQuestions).toHaveLength(100);
  });

  it("loads the additional 201-1200 definition and meaning match-up bank", () => {
    const bankSummaries = getDefinitionMatchupBankReadinessSummaries();
    const combined = getDefinitionMatchupCombinedReadinessSummary();

    expect(bankSummaries).toHaveLength(2);
    expect(bankSummaries[1]).toMatchObject({
      quizId: "safesteps_definition_meaning_match_201_1200",
      questionCount: 1000,
      declaredQuestionCount: 1000,
      questionNumberStart: 201,
      questionNumberEnd: 1200,
      invalidOptionCountQuestions: 0,
      missingCorrectOptionQuestions: 0,
      questionNumberGaps: [],
      readyForRuntimeIntegration: true,
    });
    expect(allSafeStepsDefinitionMatchupQuestions).toHaveLength(1100);
    expect(combined).toMatchObject({
      bankCount: 2,
      questionCount: 1100,
      declaredQuestionCount: 1100,
      uniqueQuestionCount: 1100,
      invalidOptionCountQuestions: 0,
      missingCorrectOptionQuestions: 0,
      questionNumberGaps: [{ from: 101, to: 200 }],
      readyForRuntimeIntegration: true,
    });
  });

  it("preserves scoring bands and the interpretation safeguard", () => {
    expect(safeStepsDefinitionMatchupScoringBands).toHaveLength(5);
    expect(safeStepsDefinitionMatchupScoringBands[0]).toMatchObject({
      id: "excellent_understanding",
      minScore: 90,
      maxScore: 100,
    });
    expect(safeStepsDefinitionMatchupQuiz.scoring.interpretationSafeguard).toContain(
      "must not be used alone as proof of parenting capacity",
    );
  });

  it("keeps each question scoreable with one correct option among six options", () => {
    const first = getDefinitionMatchupQuestionById("safesteps_definition_match_001");
    const expanded = getDefinitionMatchupQuestionById("safesteps_definition_match_1200");

    expect(first).toMatchObject({
      term: "Emotional regulation",
      correctOptionId: "q001_c",
      correctDefinition: "Managing emotions and behaviour in a safe and healthy way.",
    });
    expect(first?.options).toHaveLength(6);
    expect(expanded).toMatchObject({
      number: 1200,
      assessmentType: "definition_meaning_match",
    });
    expect(expanded?.options).toHaveLength(6);
    expect(
      allSafeStepsDefinitionMatchupQuestions.every(
        (question) => question.options.length === 6 && question.options.some((option) => option.id === question.correctOptionId),
      ),
    ).toBe(true);
  });

  it("converts definition matchup questions into scoring-engine items", () => {
    const items = toDefinitionMatchupScoringItems();
    const responses: AssessmentResponse[] = safeStepsDefinitionMatchupQuestions.map((question) => ({
      itemId: question.id,
      selectedOptionId: question.correctOptionId,
    }));

    const result = scoreAssessment({
      domains: [safeStepsDefinitionMatchupDomain],
      items,
      responses,
      bands: safeStepsDefinitionMatchupScoringBands,
    });

    expect(items).toHaveLength(100);
    expect(items.every((item) => item.itemType === "multiple_choice" && item.options?.length === 6)).toBe(true);
    expect(result.overallScore).toBe(100);
    expect(result.band?.id).toBe("excellent_understanding");
  });

  it("converts the expanded bank into scoring-engine items without loading duplicate IDs", () => {
    const expandedItems = toDefinitionMatchupScoringItems(allSafeStepsDefinitionMatchupQuestions);
    const itemIds = new Set(expandedItems.map((item) => item.id));

    expect(expandedItems).toHaveLength(1100);
    expect(itemIds.size).toBe(1100);
    expect(expandedItems.every((item) => item.itemType === "multiple_choice" && item.options?.length === 6)).toBe(true);
  });
});
