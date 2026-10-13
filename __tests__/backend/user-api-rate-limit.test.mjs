import { describe, expect, jest, test } from "@jest/globals";

import { createRateLimiter } from "../../backend/middleware/userApiRateLimit.js";

function invoke(limiter, { authorization, ip = "127.0.0.1" } = {}) {
  const req = { headers: { authorization }, ip };
  const res = { setHeader: jest.fn() };
  const next = jest.fn();
  limiter(req, res, next);
  return { res, next };
}

describe("users API rate limit", () => {
  test("returns 429 after the configured number of requests from one client", () => {
    const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60_000 });
    const request = { ip: "192.0.2.1" };

    expect(invoke(limiter, request).next).toHaveBeenCalledWith();
    expect(invoke(limiter, request).next).toHaveBeenCalledWith();

    const { res, next } = invoke(limiter, request);
    expect(res.setHeader).toHaveBeenCalledWith("Retry-After", "60");
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 429,
      code: "RATE_LIMITED",
    });
  });

  test("uses the client IP instead of unauthenticated bearer tokens", () => {
    const limiter = createRateLimiter({ maxRequests: 1 });
    const firstToken = { authorization: ["Bearer", "client-a"].join(" "), ip: "192.0.2.1" };
    const secondToken = { authorization: ["Bearer", "client-b"].join(" "), ip: "192.0.2.1" };

    expect(invoke(limiter, firstToken).next).toHaveBeenCalledWith();
    expect(invoke(limiter, secondToken).next.mock.calls[0][0]).toMatchObject({ statusCode: 429 });
    expect(
      invoke(limiter, { authorization: firstToken.authorization, ip: "192.0.2.2" }).next,
    ).toHaveBeenCalledWith();
  });

  test("uses the client IP when the authorization header is not a bearer token", () => {
    const limiter = createRateLimiter({ maxRequests: 1 });

    expect(invoke(limiter, { ip: "192.0.2.1" }).next).toHaveBeenCalledWith();
    expect(
      invoke(limiter, { authorization: "Basic invalid", ip: "192.0.2.1" }).next.mock.calls[0][0],
    ).toMatchObject({ statusCode: 429 });
    expect(
      invoke(limiter, { authorization: "Basic invalid", ip: "192.0.2.2" }).next,
    ).toHaveBeenCalledWith();
  });

  test("does not share limits across different client IPs even with the same token", () => {
    const limiter = createRateLimiter({ maxRequests: 1 });
    const authorization = ["Bearer", "test-client"].join(" ");

    expect(invoke(limiter, { authorization, ip: "192.0.2.1" }).next).toHaveBeenCalledWith();

    expect(invoke(limiter, { authorization, ip: "192.0.2.2" }).next).toHaveBeenCalledWith();
  });

  test("counts a request only once when middleware is mounted more than once", () => {
    const limiter = createRateLimiter({ maxRequests: 1 });
    const authorization = ["Bearer", "test-client"].join(" ");
    const req = { headers: { authorization }, ip: "192.0.2.1" };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();

    limiter(req, res, next);
    limiter(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenNthCalledWith(1);
    expect(next).toHaveBeenNthCalledWith(2);
    expect(
      invoke(limiter, { authorization, ip: "192.0.2.1" }).next.mock.calls[0][0],
    ).toMatchObject({ statusCode: 429 });
  });

  test("resets the request count after the window expires", () => {
    let currentTime = 0;
    const limiter = createRateLimiter({
      maxRequests: 1,
      windowMs: 1_000,
      now: () => currentTime,
    });

    expect(invoke(limiter, { ip: "192.0.2.1" }).next).toHaveBeenCalledWith();
    expect(invoke(limiter, { ip: "192.0.2.1" }).next.mock.calls[0][0].statusCode).toBe(429);

    currentTime = 1_000;
    expect(invoke(limiter, { ip: "192.0.2.1" }).next).toHaveBeenCalledWith();
  });

  test("bounds the number of tracked client keys", () => {
    const limiter = createRateLimiter({ maxClients: 1 });
    expect(invoke(limiter, { ip: "192.0.2.1" }).next).toHaveBeenCalledWith();

    const { res, next } = invoke(limiter, { ip: "192.0.2.2" });
    expect(res.setHeader).toHaveBeenCalledWith("Retry-After", "60");
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 429 });
  });

  test("reclaims expired client slots so new clients can be tracked", () => {
    let currentTime = 0;
    const limiter = createRateLimiter({
      maxClients: 1,
      windowMs: 1_000,
      now: () => currentTime,
    });

    expect(invoke(limiter, { ip: "192.0.2.1" }).next).toHaveBeenCalledWith();
    expect(invoke(limiter, { ip: "192.0.2.2" }).next.mock.calls[0][0].statusCode).toBe(429);

    currentTime = 1_000;
    expect(invoke(limiter, { ip: "192.0.2.2" }).next).toHaveBeenCalledWith();
  });
});
