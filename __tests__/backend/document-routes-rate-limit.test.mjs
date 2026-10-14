import { expect, jest, test } from "@jest/globals";

import { requireCaseAccess } from "../../backend/middleware/authorize.js";
import { requireAuthenticatedUser } from "../../backend/middleware/requireAuthenticatedUser.js";
import documentRoutes from "../../backend/routes/documents/documentRoutes.js";

test("rate limits requests to the document analyses listing route", async () => {
  const route = documentRoutes.stack.find(
    (layer) => layer.route?.path === "/:documentId/analyses",
  )?.route;
  expect(route).toBeDefined();

  const limiter = route.stack.find((layer) => layer.handle.name === "rateLimit")?.handle;
  expect(limiter).toBeDefined();

  expect(route.stack.slice(0, 4).map((layer) => layer.handle)).toEqual([
    requireAuthenticatedUser,
    limiter,
    expect.any(Function),
    requireCaseAccess,
  ]);

  const invokeLimiter = async () => {
    const req = { headers: {}, ip: "192.0.2.1" };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();
    await limiter(req, res, next);
    return { res, next };
  };

  for (let request = 0; request < 120; request += 1) {
    expect((await invokeLimiter()).next).toHaveBeenCalledWith();
  }

  const { res, next } = await invokeLimiter();
  expect(res.setHeader).toHaveBeenCalledWith("Retry-After", "60");
  expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 429, code: "RATE_LIMITED" });
});
