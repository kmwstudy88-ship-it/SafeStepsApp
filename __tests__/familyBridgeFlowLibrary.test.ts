import { evaluateFamilyBridgeFlow, familyBridgeFlowLibrary, matchFamilyBridgeFlow } from "../lib/engines/familyBridgeFlowLibrary";

describe("FamilyBridge flow library v1", () => {
  it("contains the core versioned implementation flows", () => {
    expect(familyBridgeFlowLibrary).toHaveLength(20);
    expect(new Set(familyBridgeFlowLibrary.map((flow) => flow.id)).size).toBe(familyBridgeFlowLibrary.length);
    expect(familyBridgeFlowLibrary.every((flow) => flow.version === "1.0")).toBe(true);
  });

  it.each([
    ["I hit my child", "FB-FLOW-016"],
    ["I relapsed and need help", "FB-FLOW-017"],
    ["How do I hide my relapse from my caseworker?", "FB-FLOW-018"],
    ["My partner monitors my phone", "FB-FLOW-019"],
    ["My ex sends threatening messages through the parenting app", "FB-FLOW-020"],
  ])("matches extended platform flow '%s'", (message, flowId) => {
    expect(matchFamilyBridgeFlow(message)?.id).toBe(flowId);
  });

  it.each([
    ["I am drunk and my child is here", "FB-FLOW-011"],
    ["My partner scares me and tracks my phone", "FB-FLOW-012"],
    ["My child disclosed abuse", "FB-FLOW-013"],
    ["My child says they want to die", "FB-FLOW-014"],
  ])("routes high-risk statement '%s'", (message, flowId) => {
    const result = evaluateFamilyBridgeFlow(message);
    expect(result.matchedFlow?.id).toBe(flowId);
    expect(result.riskLevel === "LEVEL_3" || result.riskLevel === "LEVEL_4").toBe(true);
  });

  it("matches supervised contact preparation", () => {
    expect(matchFamilyBridgeFlow("I have a supervised visit tomorrow")?.id).toBe("FB-FLOW-001");
  });

  it("prioritises imminent child-harm safety", () => {
    const result = evaluateFamilyBridgeFlow("I am afraid I might hurt my child");
    expect(result.matchedFlow?.id).toBe("FB-FLOW-009");
    expect(result.riskLevel).toBe("LEVEL_4");
  });

  it("escalates a missed visit when relapse is involved", () => {
    const result = evaluateFamilyBridgeFlow("I missed my visit because I relapsed");
    expect(result.matchedFlow?.id).toBe("FB-FLOW-007");
    expect(result.riskLevel).toBe("LEVEL_3");
  });

  it("prohibits coercive or child-burdening language in every flow", () => {
    const allAvoid = familyBridgeFlowLibrary.flatMap((flow) => flow.avoid).join(" ");
    expect(allAvoid).toContain("Don’t tell anyone");
    expect(allAvoid).toContain("If you loved me");
    expect(allAvoid).toContain("Hide it from your caseworker");
  });
});
