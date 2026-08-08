import {
  analyzeFairnessDocument,
  normalizeFairnessText,
} from "../lib/engines/fairnessDetectionEngine";

describe("fairnessDetectionEngine", () => {
  it("normalizes fairness input and rejects empty content", () => {
    expect(normalizeFairnessText("  line one\r\n line two ")).toBe("line one\n line two");
    expect(() => normalizeFairnessText("   ")).toThrow("non-empty text");
  });

  it("returns structured fairness analysis with required fields", () => {
    const result = analyzeFairnessDocument(
      [
        "Mother should always be the primary carer and father is less nurturing.",
        "You must complete this service or lose custody.",
        "This race makes them aggressive.",
        "A 2 year old should self-soothe alone overnight.",
      ].join(" "),
    );

    expect(result.fairness_score).toBeGreaterThanOrEqual(0);
    expect(result.fairness_score).toBeLessThanOrEqual(100);
    expect(result.bias_indicators.length).toBeGreaterThan(0);
    expect(result.coercion_flags.length).toBeGreaterThan(0);
    expect(result.discrimination_risks.length).toBeGreaterThan(0);
    expect(result.unrealistic_expectations.length).toBeGreaterThan(0);
    expect(result.remediation_recommendations.length).toBeGreaterThan(0);
    expect(result.limitations).toContain("supports human review");
  });

  it("captures multiple bias categories and coercion patterns", () => {
    const result = analyzeFairnessDocument(
      [
        "Mother should always be with children and father is less nurturing.",
        "Unemployed therefore unfit. Poor housing means neglect.",
        "If you don't cooperate we will take your child.",
        "You must complete this plan or lose custody.",
      ].join(" "),
    );

    const categories = new Set(result.bias_indicators.map((item) => item.category));
    expect(categories.has("gender_bias")).toBe(true);
    expect(categories.has("socioeconomic_bias")).toBe(true);
    expect(result.coercion_flags.length).toBeGreaterThanOrEqual(2);
  });
});
