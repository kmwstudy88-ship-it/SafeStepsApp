import { routeWellbeingCheckIn, type WellbeingCheckIn } from "../lib/engines/wellbeingCheckInEngine";

const steady: WellbeingCheckIn = {
  mood: "steady", stress: 2, sleep: "rested", conflict: "low", substanceRisk: "none",
  childDependingNow: false, afraidMayHarm: false, safety: "safe",
};

describe("wellbeing check-in routing", () => {
  it("allows an ordinary low-risk check-in", () => {
    expect(routeWellbeingCheckIn(steady).level).toBe("routine");
  });

  it("offers extra support for a strong substance-use urge", () => {
    expect(routeWellbeingCheckIn({ ...steady, substanceRisk: "strong_urge" }).level).toBe("extra_support");
  });

  it("stops ordinary saving when impaired caregiving may be occurring", () => {
    const route = routeWellbeingCheckIn({ ...steady, substanceRisk: "used", childDependingNow: true });
    expect(route.level).toBe("urgent_human_support");
    expect(route.ordinarySaveAllowed).toBe(false);
  });

  it.each([
    { safety: "unsafe" as const },
    { conflict: "unsafe" as const },
    { afraidMayHarm: true },
  ])("routes explicit danger to human safety support", (change) => {
    expect(routeWellbeingCheckIn({ ...steady, ...change }).level).toBe("urgent_human_support");
  });
});
