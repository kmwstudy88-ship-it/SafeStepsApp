import { assessParentingCoachSafety, createParentingCoachPlan } from "../lib/engines/parentingCoachEngine";

describe("Parenting Super Coach", () => {
  it("starts with parent regulation when overwhelmed", () => {
    const plan = createParentingCoachPlan({ ageBand: "3_5", moment: "meltdown", parentCapacity: "overwhelmed" });
    expect(plan.regulate).toContain("step back");
    expect(plan.steps[0]).toContain("safety");
  });

  it.each([
    "I am afraid I might hurt my child",
    "My teen says she doesn't want to live",
    "My child is not breathing",
    "I am worried about sexual abuse",
  ])("stops ordinary coaching for urgent or specialist concerns: %s", (message) => {
    expect(assessParentingCoachSafety(message).safeForCoaching).toBe(false);
  });

  it("uses age-aware autonomy for teenagers", () => {
    const plan = createParentingCoachPlan({ ageBand: "13_17", moment: "connection", parentCapacity: "steady" });
    expect(plan.steps.join(" ")).toContain("autonomy");
  });

  it("presents behaviour explanations as possibilities", () => {
    const plan = createParentingCoachPlan({ ageBand: "6_9", moment: "homework", parentCapacity: "stretched" });
    expect(plan.possibleNeeds).toHaveLength(3);
    expect(plan.possibleNeeds.join(" ")).not.toContain("definitely");
  });

  it("models accountable repair without blaming the child", () => {
    const plan = createParentingCoachPlan({ ageBand: "10_12", moment: "repair", parentCapacity: "steady" });
    expect(plan.sayThis).toContain("my job");
    expect(plan.sayThis).not.toContain("made me");
  });
});
