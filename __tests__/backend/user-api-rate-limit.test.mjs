import { describe, expect, jest, test } from "@jest/globals";

import { createRateLimiter } from "../../backend/middleware/userApiRateLimit.js";

async function invoke(limiter, { authorization, ip = "127.0.0.1" } = {}) {
  const req = { headers: { authorization }, ip };
  const res = { setHeader: jest.fn() };
  const next = jest.fn();
  await limiter(req, res, next);
  return { res, next };
}

describe("users API rate limit", () => {
  test("returns 429 after the configured number of requests from one client", async () => {
    const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60_000 });
    const request = { ip: "192.0.2.1" };

    expect((await invoke(limiter, request)).next).toHaveBeenCalledWith();
    expect((await invoke(limiter, request)).next).toHaveBeenCalledWith();

    const { res, next } = await invoke(limiter, request);
    expect(res.setHeader).toHaveBeenCalledWith("Retry-After", "60");
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 429,
      code: "RATE_LIMITED",
    });
  });

  test("fails closed when the request counter store is unavailable", async () => {
    const limiter = createRateLimiter({
      increment: async () => {
        throw new Error("counter store unavailable");
      },
    });

    const { next } = await invoke(limiter, { ip: "192.0.2.1" });
    expect(next.mock.calls[0][0]).toMatchObject({
      statusCode: 503,
      code: "RATE_LIMIT_STORE_UNAVAILABLE",
    });
  });

  test("uses the client IP instead of bearer tokens", async () => {
    const limiter = createRateLimiter({ maxRequests: 1 });
    const firstToken = { authorization: ["Bearer", "client-a"].join(" "), ip: "192.0.2.1" };
    const secondToken = { authorization: ["Bearer", "client-b"].join(" "), ip: "192.0.2.1" };

    expect((await invoke(limiter, firstToken)).next).toHaveBeenCalledWith();
    expect(
      (await invoke(limiter, secondToken)).next.mock.calls[0][0],
    ).toMatchObject({ statusCode: 429 });
    expect(
      (await invoke(limiter, { authorization: firstToken.authorization, ip: "192.0.2.2" })).next,
    ).toHaveBeenCalledWith();
  });

  test("uses the client IP when the authorization header is not a bearer token", async () => {
    const limiter = createRateLimiter({ maxRequests: 1 });

    expect((await invoke(limiter, { ip: "192.0.2.1" })).next).toHaveBeenCalledWith();
    expect(
      (await invoke(limiter, { authorization: "Basic invalid", ip: "192.0.2.1" })).next.mock.calls[0][0],
    ).toMatchObject({ statusCode: 429 });
    expect(
      (await invoke(limiter, { authorization: "Basic invalid", ip: "192.0.2.2" })).next,
    ).toHaveBeenCalledWith();
  });

  test("does not share limits across different client IPs even with the same token", async () => {
    const limiter = createRateLimiter({ maxRequests: 1 });
    const authorization = ["Bearer", "test-client"].join(" ");

    expect((await invoke(limiter, { authorization, ip: "192.0.2.1" })).next).toHaveBeenCalledWith();

    expect((await invoke(limiter, { authorization, ip: "192.0.2.2" })).next).toHaveBeenCalledWith();
  });

  test("counts a request only once when middleware is mounted more than once", async () => {
    const limiter = createRateLimiter({ maxRequests: 1 });
    const authorization = ["Bearer", "test-client"].join(" ");
    const req = { headers: { authorization }, ip: "192.0.2.1" };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();

    await limiter(req, res, next);
    await limiter(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenNthCalledWith(1);
    expect(next).toHaveBeenNthCalledWith(2);
    expect(
      (await invoke(limiter, { authorization, ip: "192.0.2.1" })).next.mock.calls[0][0],
    ).toMatchObject({ statusCode: 429 });
  });

  test("resets the request count after the window expires", async () => {
    let currentTime = 0;
    const limiter = createRateLimiter({
      maxRequests: 1,
      windowMs: 1_000,
      now: () => currentTime,
    });

    expect((await invoke(limiter, { ip: "192.0.2.1" })).next).toHaveBeenCalledWith();
    expect((await invoke(limiter, { ip: "192.0.2.1" })).next.mock.calls[0][0].statusCode).toBe(429);

    currentTime = 1_000;
    expect((await invoke(limiter, { ip: "192.0.2.1" })).next).toHaveBeenCalledWith();
  });

  test("bounds the number of tracked client keys", async () => {
    const limiter = createRateLimiter({ maxClients: 1 });
    expect((await invoke(limiter, { ip: "192.0.2.1" })).next).toHaveBeenCalledWith();

    const { res, next } = await invoke(limiter, { ip: "192.0.2.2" });
    expect(res.setHeader).toHaveBeenCalledWith("Retry-After", "60");
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 429 });
  });

  test("reclaims expired client slots so new clients can be tracked", async () => {
    let currentTime = 0;
    const limiter = createRateLimiter({
      maxClients: 1,
      windowMs: 1_000,
      now: () => currentTime,
    });

    expect((await invoke(limiter, { ip: "192.0.2.1" })).next).toHaveBeenCalledWith();
    expect((await invoke(limiter, { ip: "192.0.2.2" })).next.mock.calls[0][0].statusCode).toBe(429);

    currentTime = 1_000;
    expect((await invoke(limiter, { ip: "192.0.2.2" })).next).toHaveBeenCalledWith();
  });

  test("shares a client's request counter between limiter instances", async () => {
    const clients = new Map();
    const sharedIncrement = (key, currentTime, windowMs, maxRequests) => {
      let client = clients.get(key);
      if (!client || client.resetAt <= currentTime) {
        client = { count: 0, resetAt: currentTime + windowMs };
        clients.set(key, client);
      }
      if (client.count >= maxRequests) return { allowed: false, resetAt: client.resetAt };
      client.count += 1;
      return { allowed: true, resetAt: client.resetAt };
    };
    const firstInstance = createRateLimiter({ maxRequests: 2, increment: sharedIncrement });
    const secondInstance = createRateLimiter({ maxRequests: 2, increment: sharedIncrement });
    const request = { ip: "192.0.2.1" };

    expect((await invoke(firstInstance, request)).next).toHaveBeenCalledWith();
    expect((await invoke(secondInstance, request)).next).toHaveBeenCalledWith();
    expect((await invoke(firstInstance, request)).next.mock.calls[0][0]).toMatchObject({
      statusCode: 429,
      code: "RATE_LIMITED",
    });
  });
});
