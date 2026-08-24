import {
  evaluateFamilyBridgeClinicalInput,
  familyBridgeClinicalSystemPrompt,
  familyBridgeClinicalFlows,
} from "../lib/engines/familyBridgeClinicalEngine";

describe("familyBridgeClinicalEngine", () => {
  it("contains the evidence-based clinical architecture and NMT framework", () => {
    expect(familyBridgeClinicalSystemPrompt).toContain("Neurosequential Model of Therapeutics");
    expect(familyBridgeClinicalSystemPrompt).toContain("REGULATE");
    expect(familyBridgeClinicalSystemPrompt).toContain("RELATE");
    expect(familyBridgeClinicalSystemPrompt).toContain("REASON");
  });

  it("routes imminent harm to a Level 4 emergency workflow", () => {
    const result = evaluateFamilyBridgeClinicalInput({
      text: "I am going to hurt my son if he doesn't stop. I can't control my rage right now.",
    });

    expect(result.riskLevel).toBe("LEVEL_4");
    expect(result.matchedFlow?.id).toBe("FB-FLOW-007");
    expect(result.safetyInterceptTriggered).toBe(true);
    expect(result.clinicalResponse).toContain("Step completely away from your child");
  });

  it("routes a substance-impaired handover to an urgent Level 3 safety response", () => {
    const result = evaluateFamilyBridgeClinicalInput({
      text: "My ex dropped the kids off and he smells like booze. He is screaming at me on the driveway right now.",
    });

    expect(result.riskLevel).toBe("LEVEL_3");
    expect(result.matchedFlow?.id).toBe("FB-FLOW-025");
    expect(result.safetyInterceptTriggered).toBe(true);
    expect(result.clinicalResponse).toContain("Bring your children fully inside your home");
  });

  it("exposes a curated clinical flow library for safe-case review and implementation", () => {
    expect(familyBridgeClinicalFlows.length).toBeGreaterThanOrEqual(5);
    expect(familyBridgeClinicalFlows.map((flow) => flow.id)).toEqual(
      expect.arrayContaining(["FB-FLOW-007", "FB-FLOW-012", "FB-FLOW-015", "FB-FLOW-025"]),
    );
  });
});
