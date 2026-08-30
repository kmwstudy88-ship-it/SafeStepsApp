import { evaluateMultiFactorRisk } from "../../backend/engines/multiFactorRiskEngine.js";

const indicator = {
  id: "risk-1",
  category: "supervision",
  severity: "high",
  likelihood: "likely",
  frequency: "recurring",
  evidenceQuality: "verified",
  sourceType: "direct_observation",
  observedAt: "2026-08-14T00:00:00Z",
};

describe("multi-factor risk assessment engine", () => {
  test("returns insufficient information instead of guessing", () => {
    const result = evaluateMultiFactorRisk({}, { now: new Date("2026-08-15T00:00:00Z") });
    expect(result.level).toBe("NONE");
    expect(result.confidence.label).toBe("INSUFFICIENT");
    expect(result.flags).toContain("insufficient_risk_information");
    expect(result.humanReviewRequired).toBe(true);
  });

  test("scores risk with a transparent factor breakdown", () => {
    const result = evaluateMultiFactorRisk(
      { indicators: [indicator] },
      { now: new Date("2026-08-15T00:00:00Z") },
    );
    expect(result.rawRiskScore).toBeGreaterThan(0);
    expect(result.indicatorBreakdown[0]).toEqual(expect.objectContaining({
      id: "risk-1", category: "supervision", sourceType: "direct_observation",
    }));
    expect(result.automatedDecisionPermitted).toBe(false);
  });

  test("caps protective mitigation at thirty-five percent of raw risk", () => {
    const result = evaluateMultiFactorRisk({
      indicators: [indicator],
      protectiveFactors: [{
        id: "protective-1", strength: "imminent", confidence: "verified", sustained: true,
      }],
    }, { now: new Date("2026-08-15T00:00:00Z") });
    expect(result.appliedMitigation).toBeLessThanOrEqual(result.rawRiskScore * 0.35 + 0.01);
    expect(result.contextualScore).toBeGreaterThanOrEqual(result.rawRiskScore * 0.65 - 0.01);
    expect(result.flags).toContain("protective_mitigation_capped");
  });

  test("protective factors never cancel an imminent indicator", () => {
    const result = evaluateMultiFactorRisk({
      indicators: [{ ...indicator, severity: "imminent" }],
      protectiveFactors: [{
        strength: "imminent", confidence: "verified", sustained: true,
      }],
    }, { now: new Date("2026-08-15T00:00:00Z") });
    expect(result.level).toBe("IMMINENT");
    expect(result.contextualScore).toBeGreaterThanOrEqual(90);
    expect(result.escalation).toBe("immediate_professional_safety_review");
  });

  test("AI signals remain pending human validation", () => {
    const result = evaluateMultiFactorRisk({
      indicators: [{ ...indicator, aiGenerated: true }],
    }, { now: new Date("2026-08-15T00:00:00Z") });
    expect(result.flags).toContain("ai_signal_requires_human_validation");
    expect(result.humanReviewRequired).toBe(true);
  });

  test("confidence increases with corroborated independent sources", () => {
    const result = evaluateMultiFactorRisk({
      indicators: [
        indicator,
        { ...indicator, id: "risk-2", sourceType: "collateral", evidenceQuality: "verified" },
        { ...indicator, id: "risk-3", sourceType: "document", evidenceQuality: "direct" },
        { ...indicator, id: "risk-4", sourceType: "self_report", evidenceQuality: "corroborated" },
        { ...indicator, id: "risk-5", sourceType: "objective_measure", evidenceQuality: "verified" },
      ],
    }, { now: new Date("2026-08-15T00:00:00Z") });
    expect(result.confidence.label).toBe("HIGH");
  });

  test("never outputs an automated child-safety case decision", () => {
    const result = evaluateMultiFactorRisk({ indicators: [indicator] });
    expect(result.decisionBoundary).toMatch(/cannot determine removal, contact, parental capacity/i);
    expect(result).not.toHaveProperty("removalDecision");
    expect(result).not.toHaveProperty("contactDecision");
  });
});
