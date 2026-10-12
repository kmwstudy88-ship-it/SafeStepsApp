import {
  multiSourceEvidenceRequirements,
  reunificationAssessmentPhases,
  safeStepsDefaultResponses,
  safeStepsProtectiveCapacityDomains,
  safeStepsProtectiveCapacityItems,
} from "../lib/data/safeStepsAssessmentInstrument";
import {
  safeStepsParentingAssessmentDomains,
  safeStepsParentingAssessmentItems,
  safeStepsParentingAssessmentSlug,
  toParentingAssessmentScoringItems,
} from "../lib/data/safeStepsParentingAssessmentItems";
import {
  safeStepsParentingFillBlankQuizDomains,
  safeStepsParentingFillBlankQuizItems,
  safeStepsParentingFillBlankQuizSlug,
  toParentingFillBlankQuizScoringItems,
} from "../lib/data/safeStepsParentingFillBlankQuizItems";
import {
  safeStepsParentingDomainFillBlankQuizDomains,
  safeStepsParentingDomainFillBlankQuizItems,
  safeStepsParentingDomainFillBlankQuizSlug,
  toParentingDomainFillBlankQuizScoringItems,
} from "../lib/data/safeStepsParentingDomainFillBlankQuizItems";
import {
  safeStepsSequenceAssessmentDomains,
  safeStepsSequenceAssessmentItems,
  safeStepsSequenceAssessmentSlug,
  toSequenceAssessmentScoringItems,
  toSequenceAssessmentScoringResponses,
} from "../lib/data/safeStepsSequenceAssessmentItems";
import { scoreAssessment, type AssessmentResponse } from "../lib/engines/assessmentScoringEngine";

describe("reunification assessment instrument", () => {
  test("includes master-document rubric domains", () => {
    expect(safeStepsProtectiveCapacityDomains.map((domain) => domain.id)).toEqual(
      expect.arrayContaining([
        "protective-capacity",
        "insight-accountability",
        "emotional-regulation",
        "parenting-skills",
        "environmental-stability",
        "anti-gaming",
      ]),
    );
  });

  test("keeps default responses aligned to every scoring item", () => {
    const responseIds = new Set(safeStepsDefaultResponses.map((response) => response.itemId));

    expect(safeStepsProtectiveCapacityItems.every((item) => responseIds.has(item.id))).toBe(true);
  });

  test("captures phase and multi-source evidence requirements", () => {
    expect(reunificationAssessmentPhases).toHaveLength(5);
    expect(multiSourceEvidenceRequirements.map((item) => item.source)).toEqual(
      expect.arrayContaining(["Self-report", "Observation", "Collateral", "Document and media evidence"]),
    );
  });

  test("ships SafeSteps multiple-choice parenting assessment items", () => {
    const itemIds = new Set(safeStepsParentingAssessmentItems.map((item) => item.id));
    const domains = new Set(safeStepsParentingAssessmentItems.map((item) => item.domain));

    expect(safeStepsParentingAssessmentSlug).toBe("safesteps-parenting-multiple-choice-v1");
    expect(safeStepsParentingAssessmentItems).toHaveLength(154);
    expect(itemIds.size).toBe(154);
    expect(domains.size).toBe(32);
    expect(safeStepsParentingAssessmentDomains).toHaveLength(32);
    expect(itemIds.has("SAFEPARENT_Q115")).toBe(true);
    expect(itemIds.has("SAFEPARENT_Q116")).toBe(false);
    expect(itemIds.has("SAFEPARENT_Q120")).toBe(false);
    expect(itemIds.has("SAFEPARENT_Q121")).toBe(true);
    expect(itemIds.has("SAFEPARENT_Q140")).toBe(true);
    expect(itemIds.has("SAFEPARENT_Q141")).toBe(true);
    expect(itemIds.has("SAFEPARENT_Q160")).toBe(true);
    expect(itemIds.has("SAFEPARENT_Q161")).toBe(true);
    expect(itemIds.has("SAFEPARENT_Q163")).toBe(true);
    expect(safeStepsParentingAssessmentItems.every((item) => Object.keys(item.options).join("") === "ABCD")).toBe(true);
  });

  test("converts parenting multiple-choice items into scoreable assessment items", () => {
    const items = toParentingAssessmentScoringItems();
    const responses: AssessmentResponse[] = safeStepsParentingAssessmentItems.map((item) => ({
      itemId: item.id,
      selectedOptionId: `${item.id}_${item.correctOption}`,
    }));

    const result = scoreAssessment({
      domains: safeStepsParentingAssessmentDomains,
      items,
      responses,
      bands: [{ id: "pass", label: "Complete", minScore: 0, maxScore: 100 }],
    });

    expect(items).toHaveLength(154);
    expect(items.every((item) => item.itemType === "multiple_choice" && item.options?.length === 4)).toBe(true);
    expect(result.overallScore).toBe(100);
  });

  test("ships SafeSteps fill-in-the-blank parenting quiz items", () => {
    const itemIds = new Set(safeStepsParentingFillBlankQuizItems.map((item) => item.id));
    const domains = new Set(safeStepsParentingFillBlankQuizItems.map((item) => item.domain));

    expect(safeStepsParentingFillBlankQuizSlug).toBe("safesteps-parenting-fill-blank-v1");
    expect(safeStepsParentingFillBlankQuizItems).toHaveLength(120);
    expect(itemIds.size).toBe(120);
    expect(domains.size).toBe(18);
    expect(safeStepsParentingFillBlankQuizDomains).toHaveLength(18);
    expect(itemIds.has("SAFEPARENT_FILL_Q001")).toBe(true);
    expect(itemIds.has("SAFEPARENT_FILL_Q020")).toBe(true);
    expect(itemIds.has("SAFEPARENT_FILL_Q021")).toBe(true);
    expect(itemIds.has("SAFEPARENT_FILL_Q120")).toBe(true);
    expect(safeStepsParentingFillBlankQuizItems.every((item) => item.question.includes("______"))).toBe(true);
    expect(
      safeStepsParentingFillBlankQuizItems.every((item) => Object.keys(item.options).join("") === "ABCD"),
    ).toBe(true);
  });

  test("converts fill-in-the-blank parenting quiz items into scoreable assessment items", () => {
    const items = toParentingFillBlankQuizScoringItems();
    const responses: AssessmentResponse[] = safeStepsParentingFillBlankQuizItems.map((item) => ({
      itemId: item.id,
      selectedOptionId: `${item.id}_${item.correctOption}`,
    }));

    const result = scoreAssessment({
      domains: safeStepsParentingFillBlankQuizDomains,
      items,
      responses,
      bands: [{ id: "pass", label: "Complete", minScore: 0, maxScore: 100 }],
    });

    expect(items).toHaveLength(120);
    expect(items.every((item) => item.itemType === "multiple_choice" && item.options?.length === 4)).toBe(true);
    expect(result.overallScore).toBe(100);
  });

  test("ships SafeSteps domain-structured fill-in-the-blank parenting quiz items", () => {
    const itemIds = new Set(safeStepsParentingDomainFillBlankQuizItems.map((item) => item.id));
    const domains = new Set(safeStepsParentingDomainFillBlankQuizItems.map((item) => item.domain));

    expect(safeStepsParentingDomainFillBlankQuizSlug).toBe("safesteps-parenting-domain-fill-blank-v1");
    expect(safeStepsParentingDomainFillBlankQuizItems).toHaveLength(170);
    expect(itemIds.size).toBe(170);
    expect(domains.size).toBe(4);
    expect(safeStepsParentingDomainFillBlankQuizDomains).toHaveLength(4);
    expect(itemIds.has("SAFEPARENT_DOMAIN_FILL_Q001")).toBe(true);
    expect(itemIds.has("SAFEPARENT_DOMAIN_FILL_Q029")).toBe(true);
    expect(itemIds.has("SAFEPARENT_DOMAIN_FILL_Q030")).toBe(false);
    expect(itemIds.has("SAFEPARENT_DOMAIN_FILL_Q081")).toBe(true);
    expect(itemIds.has("SAFEPARENT_DOMAIN_FILL_Q100")).toBe(true);
    expect(itemIds.has("SAFEPARENT_DOMAIN_FILL_Q101")).toBe(true);
    expect(itemIds.has("SAFEPARENT_DOMAIN_FILL_Q141")).toBe(true);
    expect(itemIds.has("SAFEPARENT_DOMAIN_FILL_Q142")).toBe(false);
    expect(itemIds.has("SAFEPARENT_DOMAIN_FILL_Q201")).toBe(true);
    expect(itemIds.has("SAFEPARENT_DOMAIN_FILL_Q240")).toBe(true);
    expect(itemIds.has("SAFEPARENT_DOMAIN_FILL_Q241")).toBe(false);
    expect(itemIds.has("SAFEPARENT_DOMAIN_FILL_Q401")).toBe(true);
    expect(itemIds.has("SAFEPARENT_DOMAIN_FILL_Q440")).toBe(true);
    expect(itemIds.has("SAFEPARENT_DOMAIN_FILL_Q441")).toBe(false);
    expect(safeStepsParentingDomainFillBlankQuizItems.every((item) => item.question.includes("______"))).toBe(true);
    expect(safeStepsParentingDomainFillBlankQuizItems.every((item) => item.scoreWeight >= 2)).toBe(true);
  });

  test("converts domain-structured fill-in-the-blank quiz items into weighted scoreable assessment items", () => {
    const items = toParentingDomainFillBlankQuizScoringItems();
    const responses: AssessmentResponse[] = safeStepsParentingDomainFillBlankQuizItems.map((item) => ({
      itemId: item.id,
      selectedOptionId: `${item.id}_${item.correctOption}`,
    }));

    const result = scoreAssessment({
      domains: safeStepsParentingDomainFillBlankQuizDomains,
      items,
      responses,
      bands: [{ id: "pass", label: "Complete", minScore: 0, maxScore: 100 }],
    });

    expect(items).toHaveLength(170);
    expect(items.some((item) => item.weight === 3)).toBe(true);
    expect(result.overallScore).toBe(100);
  });

  test("ships SafeSteps sequence assessment items", () => {
    const itemIds = new Set(safeStepsSequenceAssessmentItems.map((item) => item.id));
    const domains = new Set(safeStepsSequenceAssessmentItems.map((item) => item.domainId));

    expect(safeStepsSequenceAssessmentSlug).toBe("safesteps-sequence-assessment-v1");
    expect(safeStepsSequenceAssessmentItems).toHaveLength(157);
    expect(itemIds.size).toBe(157);
    expect(domains.size).toBe(12);
    expect(safeStepsSequenceAssessmentDomains).toHaveLength(12);
    expect(itemIds.has("DRS_001")).toBe(true);
    expect(itemIds.has("SPS_003")).toBe(true);
    expect(itemIds.has("ERS_002")).toBe(true);
    expect(itemIds.has("PSS_003")).toBe(true);
    expect(itemIds.has("DRS_008")).toBe(true);
    expect(itemIds.has("TCS_001")).toBe(true);
    expect(itemIds.has("HHS_005")).toBe(true);
    expect(itemIds.has("PCI_001")).toBe(true);
    expect(itemIds.has("BSS_005")).toBe(true);
    expect(itemIds.has("SRS_005")).toBe(true);
    expect(itemIds.has("CMS_005")).toBe(true);
    expect(itemIds.has("EFS_005")).toBe(true);
    expect(itemIds.has("RRS_005")).toBe(true);
    expect(itemIds.has("DRS_013")).toBe(true);
    expect(itemIds.has("HHS_008")).toBe(true);
    expect(itemIds.has("HHS_009")).toBe(false);
    expect(itemIds.has("BSS_010")).toBe(true);
    expect(itemIds.has("CMS_009")).toBe(true);
    expect(itemIds.has("CMS_010")).toBe(false);
    expect(itemIds.has("DRS_023")).toBe(true);
    expect(itemIds.has("HHS_015")).toBe(true);
    expect(itemIds.has("PCI_015")).toBe(true);
    expect(itemIds.has("BSS_015")).toBe(true);
    expect(itemIds.has("SRS_013")).toBe(true);
    expect(itemIds.has("SRS_014")).toBe(false);
    expect(safeStepsSequenceAssessmentItems.every((item) => item.scoring.type === "sequence" && item.scoring.max === 3)).toBe(true);
    expect(safeStepsSequenceAssessmentItems.every((item) => item.correctSequence.length === 3)).toBe(true);
  });

  test("converts sequence assessments into numeric scoreable assessment items", () => {
    const items = toSequenceAssessmentScoringItems();
    const responses = toSequenceAssessmentScoringResponses(
      safeStepsSequenceAssessmentItems.map((item) => ({
        itemId: item.id,
        sequence: item.correctSequence,
      })),
    );

    const result = scoreAssessment({
      domains: safeStepsSequenceAssessmentDomains,
      items,
      responses,
      bands: [{ id: "pass", label: "Complete", minScore: 0, maxScore: 100 }],
    });

    expect(items).toHaveLength(157);
    expect(items.every((item) => item.itemType === "numeric" && item.maxValue === 3)).toBe(true);
    expect(responses.every((response) => response.numericValue === 3)).toBe(true);
    expect(result.overallScore).toBe(100);
  });
});
