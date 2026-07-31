import {
  aodMhDfvCriticalOverrides,
  aodMhDfvDefaultResponses,
  aodMhDfvDomains,
  aodMhDfvInstrumentCode,
  aodMhDfvItems,
  aodMhDfvScoringBands,
  aodMhDfvAssessmentSlug,
  evaluateAodMhDfvCrossDomainRules,
} from "../lib/data/aodMhDfvAssessmentInstrument";
import { scoreAssessment, type AssessmentResponse } from "../lib/engines/assessmentScoringEngine";

describe("AOD/MH/DFV assessment instrument", () => {
  test("defines the instrument metadata, domains, items, and default responses", () => {
    expect(aodMhDfvAssessmentSlug).toBe("aod-mh-dfv-v1");
    expect(aodMhDfvInstrumentCode).toBe("AOD_MH_DFV_v1");
    expect(aodMhDfvDomains.map((domain) => domain.id)).toEqual([
      "DFV_SAFETY",
      "AOD_IMPACT",
      "MH_FUNCTIONAL",
      "PROTECTIVE_CAPACITY",
      "PERPETRATOR_ACCOUNTABILITY",
      "SERVICE_COORDINATION",
      "CHILD_IMPACT",
    ]);
    expect(aodMhDfvItems).toHaveLength(22);
    expect(aodMhDfvItems.every((item) => item.options?.length === 5)).toBe(true);
    expect(aodMhDfvDefaultResponses).toHaveLength(aodMhDfvItems.length);
  });

  test("critical override forces Critical Concern without hiding the aggregate score", () => {
    const responses: AssessmentResponse[] = aodMhDfvItems.map((item) => ({
      itemId: item.id,
      selectedOptionId: `${item.id}-0`,
    }));
    responses[0] = { itemId: "DFV1", selectedOptionId: "DFV1-3" };

    const result = scoreAssessment({
      domains: aodMhDfvDomains,
      items: aodMhDfvItems,
      responses,
      bands: aodMhDfvScoringBands,
      overrides: aodMhDfvCriticalOverrides,
    });

    expect(result.overallScore).toBeLessThan(25);
    expect(result.overrideTriggered).toBe(true);
    expect(result.override?.id).toBe("DFV1_HIGH");
    expect(result.band?.label).toBe("Critical Concern");
    expect(result.requiresSupervisorReview).toBe(true);
  });

  test("cross-domain rules suppress AOD improvement against active DFV risk and separate perpetrator tracking", () => {
    const flags = evaluateAodMhDfvCrossDomainRules({
      triggeredOverrideIds: ["DFV3_HIGH", "PA3_HIGH"],
      currentDomainScores: { AOD_IMPACT: 25 },
      previousDomainScores: { AOD_IMPACT: 50 },
    });

    expect(flags.map((flag) => flag.ruleCode)).toEqual([
      "DFV_OVERRIDES_AOD_TREND",
      "SEPARATE_VICTIM_PERPETRATOR_PLANS",
    ]);
    expect(flags[0].flagText).toContain("suppressed");
    expect(flags[1].flagText).toContain("separate units");
  });
});
