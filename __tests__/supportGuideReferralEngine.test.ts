import { getSupportGuideReferrals } from "../lib/engines/supportGuideReferralEngine";
import { createSupportGuideReply } from "../lib/engines/supportGuideEngine";

describe("Support Guide referrals", () => {
  it("does not show a regional Parentline service for national-only selection", () => {
    expect(getSupportGuideReferrals("parenting", "australia").map((item) => item.id)).not.toContain("parentline");
  });

  it("shows Parentline for a Queensland parenting request", () => {
    expect(getSupportGuideReferrals("parenting", "queensland").map((item) => item.id)).toContain("parentline");
  });

  it("prioritises emergency help for Level 4 risk", () => {
    const triage = createSupportGuideReply("I am going to kill myself tonight", "mental_health").triage;
    expect(getSupportGuideReferrals("mental_health", "queensland", triage)[0]?.id).toBe("emergency");
  });

  it("routes family violence to specialist support", () => {
    expect(getSupportGuideReferrals("family_violence", "queensland").map((item) => item.id)).toContain("respect");
  });
});
