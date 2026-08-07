const SECRET_KEY = /authorization|cookie|password|token|secret|api.?key|session/i;

export function redact(value, depth = 0) {
  if (depth > 5) return "[MAX_DEPTH]";
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SECRET_KEY.test(key) ? "[REDACTED]" : redact(item, depth + 1),
    ]),
  );
}

export function log(level, event, metadata = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: "safesteps-api",
    event,
    ...redact(metadata),
  };
  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export function requestLogger(req, res, next) {
  const startedAt = Date.now();

  res.on("finish", () => {
    log(res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info", "http.request", {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl?.split("?", 1)[0] ?? req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      userId: req.safeStepsAuth?.user?.id ?? null,
      roles: req.safeStepsAuth?.roles ?? [],
    });
  });

  next();
}
