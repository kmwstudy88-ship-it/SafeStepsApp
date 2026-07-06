import {
  buildParentProfilePayload,
  emptyParentProfileDomains,
  hydrateParentProfileDomains,
  type ParentProfileRecord,
} from "../lib/engines/parentProfileEngine";

describe("parent profile domain engine", () => {
  test("builds separate JSONB blocks for each parent domain", () => {
    const payload = buildParentProfilePayload({
      caseId: "case-1",
      ownerId: "user-1",
      parentRole: "mother",
      displayName: "  Parent A  ",
      domains: {
        identity: {
          ...emptyParentProfileDomains.identity,
          name: "  Parent A  ",
          traumaHistory: "  complex trauma history  ",
        },
        protectiveCapacities: {
          ...emptyParentProfileDomains.protectiveCapacities,
          insight: "  emerging insight  ",
        },
        riskIndicators: {
          ...emptyParentProfileDomains.riskIndicators,
          substanceUse: "  monitored  ",
        },
        parentingBehaviors: {
          ...emptyParentProfileDomains.parentingBehaviors,
          supervision: "  improving  ",
        },
        engagement: {
          ...emptyParentProfileDomains.engagement,
          attendance: "  weekly  ",
        },
      },
    });

    expect(payload.display_name).toBe("Parent A");
    expect(payload.identity).toMatchObject({
      name: "Parent A",
      traumaHistory: "complex trauma history",
    });
    expect(payload.protective_capacities).toMatchObject({ insight: "emerging insight" });
    expect(payload.risk_indicators).toMatchObject({ substanceUse: "monitored" });
    expect(payload.parenting_behaviors).toMatchObject({ supervision: "improving" });
    expect(payload.engagement).toMatchObject({ attendance: "weekly" });
  });

  test("hydrates missing JSONB keys with empty defaults", () => {
    const record = {
      identity: { name: "Parent B" },
      protective_capacities: { empathy: "high" },
      risk_indicators: {},
      parenting_behaviors: {},
      engagement: {},
    } as ParentProfileRecord;

    const domains = hydrateParentProfileDomains(record);

    expect(domains.identity.name).toBe("Parent B");
    expect(domains.identity.age).toBe("");
    expect(domains.protectiveCapacities.empathy).toBe("high");
    expect(domains.riskIndicators.unsafePartners).toBe("");
  });
});
