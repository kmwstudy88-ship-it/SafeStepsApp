import { expect, jest, test } from "@jest/globals";

import { requireAuthenticatedUser } from "../../backend/middleware/requireAuthenticatedUser.js";
import fairnessRoutes from "../../backend/routes/documents/fairnessRoutes.js";

test("rate limits requests to the fairness analysis endpoint before authentication", () => {
  const route = fairnessRoutes.stack.find(
    (layer) => layer.route?.path === "/fairness" && layer.route?.methods?.post,
  )?.route;
  expect(route).toBeDefined();

  const limiter = route.stack.find((layer) => layer.handle.name === "rateLimit")?.handle;
  expect(limiter).toBeDefined();

  const limiterIndex = route.stack.findIndex((layer) => layer.handle === limiter);
  const authIndex = route.stack.findIndex((layer) => layer.handle === requireAuthenticatedUser);

  expect(limiterIndex).toBeGreaterThanOrEqual(0);
  expect(authIndex).toBeGreaterThanOrEqual(0);
  expect(limiterIndex).toBeLessThan(authIndex);
});
