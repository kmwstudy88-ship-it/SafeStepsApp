import { ApiError } from "../lib/apiError.js";

const windows = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 12;

export function consumeSupportGuideLimit(key, now = Date.now()) {
  if (windows.size > 5_000) {
    for (const [storedKey, value] of windows) {
      if (now >= value.resetAt) windows.delete(storedKey);
    }
  }
  const existing = windows.get(key);
  if (!existing || now >= existing.resetAt) {
    const next = { count: 1, resetAt: now + WINDOW_MS };
    windows.set(key, next);
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: next.resetAt };
  }
  existing.count += 1;
  return {
    allowed: existing.count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - existing.count),
    resetAt: existing.resetAt,
  };
}

export function supportGuideRateLimit(req, res, next) {
  const key = req.safeStepsAuth?.user?.id ?? `local:${req.ip ?? "unknown"}`;
  const result = consumeSupportGuideLimit(key);
  res.setHeader("X-RateLimit-Remaining", String(result.remaining));
  if (!result.allowed) {
    res.setHeader("Retry-After", String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))));
    next(new ApiError(429, "SUPPORT_GUIDE_RATE_LIMIT", "Please pause before requesting more AI guidance. Human support options remain available."));
    return;
  }
  next();
}

export function resetSupportGuideLimitsForTests() {
  windows.clear();
}
