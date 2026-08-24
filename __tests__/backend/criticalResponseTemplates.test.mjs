import { describe, expect, test } from "@jest/globals";
import { buildCriticalResponse, CRITICAL_RESPONSE_TEMPLATES } from "../../backend/Services/PersonalAiSupport/CriticalResponseTemplates.js";

describe("locked critical response templates", () => {
  test.each([
    ["CHILD_ABUSE_DISCLOSURE", "child_abuse_disclosure"], ["SELF_HARM", "self_harm_warning"],
    ["CHILD_HARM", "parent_may_hurt_child"], ["IMPAIRED_CARE", "intoxicated_with_child_present"],
    ["FAMILY_VIOLENCE", "active_dv_danger"],
  ])("maps %s without a model call", (rule, key) => {
    const result = buildCriticalResponse([rule], "urgent message");
    expect(result.templateKey).toBe(key);
    expect(result.reply.steps).toHaveLength(3);
    expect([result.reply.acknowledgement, ...result.reply.steps, result.reply.followUp].join(" ").match(/\?/g)).toHaveLength(1);
  });

  test("uses the discreet monitored-device variant", () => {
    expect(buildCriticalResponse(["FAMILY_VIOLENCE"], "My partner checks my phone and has a knife now").templateKey).toBe("dv_monitored_device_risk");
  });

  test("registry is complete and has a safe unknown fallback", () => {
    expect(CRITICAL_RESPONSE_TEMPLATES).toHaveLength(7);
    expect(buildCriticalResponse(["UNKNOWN"], "help").templateKey).toBe("critical_critical_unclear");
  });
});
