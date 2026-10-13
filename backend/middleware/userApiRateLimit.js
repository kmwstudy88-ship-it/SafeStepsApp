import { createHash } from "node:crypto";
import { createClient } from "redis";

import { ApiError } from "../lib/apiError.js";
import { bearerToken } from "./requireAuthenticatedUser.js";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 120;
const MAX_CLIENTS = 10_000;
const REDIS_RATE_LIMIT_SCRIPT = `
local count = tonumber(redis.call('GET', KEYS[1]) or '0')
local ttl = redis.call('PTTL', KEYS[1])
if count >= tonumber(ARGV[2]) then
  return { count, ttl, 0 }
end
count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
else
  ttl = redis.call('PTTL', KEYS[1])
end
return { count, ttl, 1 }
`;

export function createRateLimiter({
  windowMs = WINDOW_MS,
  maxRequests = MAX_REQUESTS_PER_WINDOW,
  maxClients = MAX_CLIENTS,
  now = Date.now,
  increment,
} = {}) {
  const seenRequests = new WeakSet();
  const incrementCounter = increment ?? createLocalCounter({ maxClients, windowMs });

  return async function rateLimit(req, res, next) {
    if (req && typeof req === "object") {
      if (seenRequests.has(req)) {
        next();
        return;
      }
      seenRequests.add(req);
    }

    const currentTime = now();
    let result;
    try {
      result = await incrementCounter(clientKey(req), currentTime, windowMs, maxRequests);
    } catch (error) {
      next(
        new ApiError(503, "RATE_LIMIT_STORE_UNAVAILABLE", "The request limiter is temporarily unavailable.", {
          cause: error,
        }),
      );
      return;
    }

    if (!result || !result.allowed) {
      const resetAt = result?.resetAt ?? currentTime + windowMs;
      res.setHeader("Retry-After", String(Math.ceil((resetAt - currentTime) / 1000)));
      next(new ApiError(429, "RATE_LIMITED", "Too many requests. Please try again later."));
      return;
    }

    next();
  };
}

function createLocalCounter({ maxClients, windowMs }) {
  const clients = new Map();
  let nextCleanupAt = 0;

  return (key, currentTime, _windowMs, maxRequests) => {
    if (currentTime >= nextCleanupAt) {
      for (const [clientKey, client] of clients) {
        if (client.resetAt <= currentTime) clients.delete(clientKey);
      }
      nextCleanupAt = currentTime + windowMs;
    }

    let client = clients.get(key);
    if (!client) {
      if (clients.size >= maxClients) return null;
      client = { count: 0, resetAt: currentTime + windowMs };
      clients.set(key, client);
    } else if (client.resetAt <= currentTime) {
      client.count = 0;
      client.resetAt = currentTime + windowMs;
    }

    if (client.count >= maxRequests) {
      return { allowed: false, resetAt: client.resetAt };
    }

    client.count += 1;
    return { allowed: true, resetAt: client.resetAt };
  };
}

function clientKey(req) {
  const token = bearerToken(req.headers?.authorization);
  if (token) {
    return `token:${createHash("sha256").update(token).digest("hex")}`;
  }

  return `ip:${req.ip || req.socket?.remoteAddress || "unknown"}`;
}

const redisClient = createClient({
  url: process.env.REDIS_URL ?? "redis://safesteps-redis:6379",
});
let redisConnection;

redisClient.on("error", (error) => {
  console.error("Users API rate-limit Redis error:", error);
});

async function incrementRedisCounter(key, currentTime, windowMs, maxRequests) {
  if (!redisClient.isOpen) {
    redisConnection ??= redisClient.connect().finally(() => {
      redisConnection = undefined;
    });
    await redisConnection;
  }

  const redisKey = `safesteps:users:rate-limit:${createHash("sha256").update(key).digest("hex")}`;
  const [count, ttl, allowed] = await redisClient.eval(REDIS_RATE_LIMIT_SCRIPT, {
    keys: [redisKey],
    arguments: [String(windowMs), String(maxRequests)],
  });

  return {
    allowed: Number(allowed) === 1,
    resetAt: currentTime + (Number(ttl) > 0 ? Number(ttl) : windowMs),
    count: Number(count),
  };
}

export const userApiRateLimit = createRateLimiter({ increment: incrementRedisCounter });
