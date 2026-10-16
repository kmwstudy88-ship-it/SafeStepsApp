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

test("applies the shared limiter after authentication to document upload and analysis lookup", () => {
  const listingRoute = documentRoutes.stack.find(
    (layer) => layer.route?.path === "/:documentId/analyses",
  )?.route;
  const limiter = listingRoute?.stack.find((layer) => layer.handle.name === "rateLimit")?.handle;

  for (const path of ["/upload", "/analyses/:analysisId"]) {
    const route = documentRoutes.stack.find((layer) => layer.route?.path === path)?.route;
    expect(route).toBeDefined();
    expect(route.stack.slice(0, 2).map((layer) => layer.handle)).toEqual([
      requireAuthenticatedUser,
      limiter,
    ]);
    expect(route.stack.some((layer) => layer.handle === requireCaseAccess)).toBe(true);
  }

  const uploadRoute = documentRoutes.stack.find((layer) => layer.route?.path === "/upload")?.route;
  expect(uploadRoute.stack[2].handle).toEqual(expect.any(Function));
  expect(uploadRoute.stack[3].handle).toEqual(expect.any(Function));
  expect(uploadRoute.stack.findIndex((layer) => layer.handle === limiter)).toBeLessThan(3);
});
