import { expect, jest, test } from "@jest/globals";

import { requireAuthenticatedUser } from "../../backend/middleware/requireAuthenticatedUser.js";
import agentSkillsRoutes from "../../backend/routes/agent-skills/agentSkillsRoutes.js";
import aiSupportRoutes from "../../backend/routes/ai-support/aiSupportRoutes.js";

test("rate limits all AI Support Coach routes before authentication", () => {
  const routes = [
    { method: "post", path: "/coach/turn" },
    { method: "post", path: "/couples-dfv/safety-check" },
    { method: "post", path: "/scales/score" },
    { method: "post", path: "/psychologist/formulate" },
    { method: "post", path: "/evaluator/assess" },
    { method: "post", path: "/clinician/sign-off" },
    { method: "post", path: "/stealth/verify-pin" },
    { method: "post", path: "/safety-plan/save" },
    { method: "post", path: "/visits/coach" },
    { method: "post", path: "/family-meeting/repair-script" },
    { method: "post", path: "/addiction/urge-surf" },
    { method: "post", path: "/neuro-sleep/profile" },
    { method: "post", path: "/kinship-carer/check-in" },
    { method: "post", path: "/cultural-sewb/yarning-map" },
    { method: "post", path: "/court-annexure/compile" },
    { method: "post", path: "/informants/submit-360" },
    { method: "post", path: "/prescriptions/generate" },
    { method: "post", path: "/child/three-houses" },
  ];

  for (const { method, path } of routes) {
    const route = aiSupportRoutes.stack.find(
      (layer) => layer.route?.path === path && layer.route?.methods?.[method],
    )?.route;
    expect(route).toBeDefined();

    const limiter = route.stack.find((layer) => layer.handle.name === "rateLimit")?.handle;
    expect(limiter).toBeDefined();

    const limiterIndex = route.stack.findIndex((layer) => layer.handle === limiter);
    const authIndex = route.stack.findIndex((layer) => layer.handle === requireAuthenticatedUser);

    expect(limiterIndex).toBeGreaterThanOrEqual(0);
    expect(authIndex).toBeGreaterThanOrEqual(0);
    expect(limiterIndex).toBeLessThan(authIndex);
  }
});

test("rate limits all Agent Skills routes before authentication", () => {
  const routes = [
    "/fairness-detect",
    "/contradiction-detect",
    "/evidence-extract",
    "/requirement-extract",
    "/timeline-extract",
    "/risk-assess",
    "/concern-classify",
    "/expectation-detect",
  ];

  for (const path of routes) {
    const route = agentSkillsRoutes.stack.find(
      (layer) => layer.route?.path === path && layer.route?.methods?.post,
    )?.route;
    expect(route).toBeDefined();

    const limiter = route.stack.find((layer) => layer.handle.name === "rateLimit")?.handle;
    expect(limiter).toBeDefined();

    const limiterIndex = route.stack.findIndex((layer) => layer.handle === limiter);
    const authIndex = route.stack.findIndex((layer) => layer.handle === requireAuthenticatedUser);

    expect(limiterIndex).toBeGreaterThanOrEqual(0);
    expect(authIndex).toBeGreaterThanOrEqual(0);
    expect(limiterIndex).toBeLessThan(authIndex);
  }
});
