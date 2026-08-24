import { createSupportGuideReply } from "../lib/engines/supportGuideEngine";

describe("Support Guide", () => {
  it("offers bounded parenting guidance for a low-risk question", () => {
    const reply = createSupportGuideReply("Bedtime is a battle every night", "parenting");
    expect(reply.triage.assignedRiskLevel).toBe("LEVEL_0");
    expect(reply.steps).toHaveLength(3);
  });

  it("aborts ordinary coaching for imminent self-harm", () => {
    const reply = createSupportGuideReply("I am going to kill myself tonight", "mental_health");
    expect(reply.triage.abortStandardCoaching).toBe(true);
    expect(reply.triage.escalationTargets.map((target) => target.id)).toContain("lifeline");
  });

  it("does not give confrontation advice for family violence", () => {
    const reply = createSupportGuideReply("My partner controls my phone", "family_violence");
    expect(reply.steps.join(" ")).toContain("safer device");
    expect(reply.steps.join(" ")).not.toContain("Confront your partner");
  });
});
