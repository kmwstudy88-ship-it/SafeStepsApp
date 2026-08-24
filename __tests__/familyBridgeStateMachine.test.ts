import { familyBridgeFlowLibrary } from "../lib/engines/familyBridgeFlowLibrary";
import {
  advanceFamilyBridgeState,
  familyBridgeMachineSpecs,
  startFamilyBridgeSession,
} from "../lib/engines/familyBridgeStateMachine";

describe("FamilyBridge branching state machines", () => {
  it("creates one versioned state machine for every flow", () => {
    expect(familyBridgeMachineSpecs).toHaveLength(familyBridgeFlowLibrary.length);
    expect(familyBridgeMachineSpecs.every((spec) => spec.schemaVersion === "FB-STATE-V1")).toBe(true);
  });

  it("never enters ordinary coaching for Level 4 child-harm risk", () => {
    const flow = familyBridgeFlowLibrary.find((item) => item.id === "FB-FLOW-009")!;
    const started = advanceFamilyBridgeState(startFamilyBridgeSession(flow), { type: "START" });
    expect(started.state).toBe("safety_check");
    expect(started.normalCoachingAllowed).toBe(false);
    const escalated = advanceFamilyBridgeState(started, { type: "SAFETY_ANSWER", immediateDanger: true });
    expect(escalated.state).toBe("emergency_escalation");
  });

  it("requires professional alignment before completing a Level 2 reunification flow", () => {
    const flow = familyBridgeFlowLibrary.find((item) => item.id === "FB-FLOW-001")!;
    let session = advanceFamilyBridgeState(startFamilyBridgeSession(flow), { type: "START" });
    session = advanceFamilyBridgeState(session, { type: "COACHING_DELIVERED" });
    expect(session.state).toBe("professional_alignment");
    session = advanceFamilyBridgeState(session, { type: "PROFESSIONAL_PLAN_SELECTED" });
    expect(session.state).toBe("completed");
  });

  it("forbids automatic raw-disclosure storage in every machine", () => {
    expect(familyBridgeMachineSpecs.every((spec) => spec.documentation.rawDisclosureStorage === "never_automatic")).toBe(true);
    expect(familyBridgeMachineSpecs.find((spec) => spec.flowId === "FB-FLOW-013")?.documentation.policy).toContain("authorized human safeguarding workflow");
  });

  it("does not transition on an invalid event", () => {
    const session = startFamilyBridgeSession(familyBridgeFlowLibrary[0]);
    expect(advanceFamilyBridgeState(session, { type: "COACHING_DELIVERED" })).toBe(session);
  });
});
