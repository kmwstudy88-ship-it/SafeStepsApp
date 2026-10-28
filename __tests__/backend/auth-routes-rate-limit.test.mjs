import { expect, jest, test } from "@jest/globals";

import { requireAuthenticatedUser } from "../../backend/middleware/requireAuthenticatedUser.js";
import authRoutes from "../../backend/routes/auth/authRoutes.js";

test("rate limits authentication and session endpoints", () => {
  const routes = [
    { method: "post", path: "/child/login" },
    { method: "post", path: "/parent/login" },
    { method: "post", path: "/caseworker/login" },
    { method: "get", path: "/session" },
    { method: "post", path: "/logout" },
  ];

  for (const { method, path } of routes) {
    const route = authRoutes.stack.find(
      (layer) => layer.route?.path === path && layer.route?.methods?.[method],
    )?.route;
    expect(route).toBeDefined();

    const limiter = route.stack.find((layer) => layer.handle.name === "rateLimit")?.handle;
    expect(limiter).toBeDefined();

    const limiterIndex = route.stack.findIndex((layer) => layer.handle === limiter);
    expect(limiterIndex).toBeGreaterThanOrEqual(0);

    const authIndex = route.stack.findIndex(
      (layer) => layer.handle === requireAuthenticatedUser,
    );
    if (authIndex !== -1) {
      expect(limiterIndex).toBeLessThan(authIndex);
    }
  }
});
