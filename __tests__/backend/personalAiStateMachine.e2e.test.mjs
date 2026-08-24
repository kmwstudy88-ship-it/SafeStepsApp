import { jest } from "@jest/globals";
import { createPersonalAiChat } from "../../backend/Services/PersonalAiSupport/PersonalAiSupportService.js";

const safeReply = { heading: "A safe next step", acknowledgement: "That sounds difficult.", steps: ["Pause and breathe.", "Choose one practical action.", "Use human support if safety changes."], followUp: "What feels most manageable right now?" };
const clientWith = (reply = safeReply) => ({ chat: { completions: { create: jest.fn(async () => ({ choices: [{ message: { content: JSON.stringify(reply) } }] })) } } });
const run = (message, extra = {}, options = {}) => createPersonalAiChat({ message, conversationId: "conv-test", consentToAiSupport: true, ...extra }, { client: clientWith(), ...options });

describe("SafeSteps end-to-end conversation state machine", () => {
  test.each([
    ["Help me prepare for a visit", "visit_preparation", "low"],
    ["I yelled at my child", "parent_yelled", "medium"],
    ["I missed a visit", "parent_missed_visit", "medium"],
    ["I relapsed and my child is here", "substance_use_support", "high"],
  ])("routes %s", async (message, flowId, riskLevel) => {
    const result = await run(message); expect(result.flowId).toBe(flowId); expect(result.riskLevel).toBe(riskLevel); expect(result.assistantMessage.length).toBeGreaterThan(0);
  });

  test.each([
    ["I might hurt my child", "parent_may_hurt_child"], ["Someone hurt me", "child_discloses_abuse"],
    ["I want to die", "child_self_harm_warning"], ["He is hitting me now", "critical_safety"],
  ])("critical message enters safety-check and bypasses the model: %s", async (message, flowId) => {
    const client = clientWith(); const result = await createPersonalAiChat({ message, consentToAiSupport: true }, { client });
    expect(result).toMatchObject({ flowId, riskLevel: "critical", state: "safety_check", completionState: "escalated", requiresHumanHandoff: true, source: "safety_intercept" });
    expect(client.chat.completions.create).not.toHaveBeenCalled(); expect(result.assistantMessage).toMatch(/000|Lifeline|child-protection|safe adult/i);
  });

  test("uses discreet monitored-device support", async () => { const result = await run("She can see my phone and read this"); expect(result.flowId).toBe("family_violence_safety"); expect(result.requiresHumanHandoff).toBe(true); });

  test("unsafe model output is replaced and routed to human support", async () => {
    const client = clientWith({ ...safeReply, acknowledgement: "You have PTSD and the court will definitely remove custody." });
    const result = await createPersonalAiChat({ message: "They said I was unsafe", consentToAiSupport: true }, { client });
    expect(result.source).toBe("guardrail_fallback"); expect(result.requiresHumanHandoff).toBe(true); expect(result.assistantMessage).not.toMatch(/you have PTSD|definitely remove/i);
  });

  test("persists only consented minimum-necessary effects", async () => {
    const saveConversationTurn = jest.fn(); const createInteractionNoteIfNeeded = jest.fn(); const createHandoffIfNeeded = jest.fn();
    await run("I might hurt my child", { consentToStoreNote: true, consentToShareWithSupport: true }, { saveConversationTurn, createInteractionNoteIfNeeded, createHandoffIfNeeded });
    expect(saveConversationTurn).toHaveBeenCalledTimes(1); expect(createInteractionNoteIfNeeded).toHaveBeenCalledWith(expect.objectContaining({ storeVerbatimDisclosure: false })); expect(createHandoffIfNeeded).toHaveBeenCalledWith(expect.objectContaining({ automaticEmergencyDispatch: false }));
  });

  test("negation is not escalated and multiple risk selects child harm", async () => {
    expect((await run("I'm not drunk and my kid is here")).riskLevel).not.toBe("critical");
    const multi = await run("I relapsed and I might hurt my child"); expect(multi).toMatchObject({ riskLevel: "critical", flowId: "parent_may_hurt_child" });
  });

  test("returns the minimum API contract", async () => { const result = await run("Help me prepare for a visit"); for (const key of ["flowId","state","assistantMessage","riskLevel","escalationType","requiresHumanHandoff","shouldDocument","completionState"]) expect(result).toHaveProperty(key); });
});
