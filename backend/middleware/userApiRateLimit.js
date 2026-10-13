import { ApiError } from "../lib/apiError.js";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 120;
const MAX_CLIENTS = 10_000;

export function createRateLimiter({
  windowMs = WINDOW_MS,
  maxRequests = MAX_REQUESTS_PER_WINDOW,
  maxClients = MAX_CLIENTS,
  now = Date.now,
} = {}) {
  const clients = new Map();
  const seenRequests = new WeakSet();
  let nextCleanupAt = 0;

  return function rateLimit(req, res, next) {
    if (req && typeof req === "object") {
      if (seenRequests.has(req)) {
        next();
        return;
      }
      seenRequests.add(req);
    }

    const currentTime = now();
    if (currentTime >= nextCleanupAt) {
      for (const [key, client] of clients) {
        if (client.resetAt <= currentTime) clients.delete(key);
      }
      nextCleanupAt = currentTime + windowMs;
    }

    const key = clientKey(req);
    let client = clients.get(key);
    if (!client) {
      if (clients.size >= maxClients) {
        res.setHeader("Retry-After", String(Math.ceil(windowMs / 1000)));
        next(new ApiError(429, "RATE_LIMITED", "Too many requests. Please try again later."));
        return;
      }

      client = { count: 0, resetAt: currentTime + windowMs };
      clients.set(key, client);
    } else if (client.resetAt <= currentTime) {
      client.count = 0;
      client.resetAt = currentTime + windowMs;
    }

    if (client.count >= maxRequests) {
      res.setHeader("Retry-After", String(Math.ceil((client.resetAt - currentTime) / 1000)));
      next(new ApiError(429, "RATE_LIMITED", "Too many requests. Please try again later."));
      return;
    }

    client.count += 1;
    next();
  };
}

function clientKey(req) {
  return `ip:${req.ip || req.socket?.remoteAddress || "unknown"}`;
}

export const userApiRateLimit = createRateLimiter();
