import { errorEnvelope, notFound } from "../lib/apiError.js";
import { log } from "../lib/logger.js";

export function notFoundHandler(req, _res, next) {
  next(notFound(`No SafeSteps API route matches ${req.method} ${req.path}.`));
}

export function errorHandler(error, req, res, _next) {
  const normalized = errorEnvelope(error, req.id);

  log(normalized.statusCode >= 500 ? "error" : "warn", "http.error", {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl?.split("?", 1)[0] ?? req.path,
    statusCode: normalized.statusCode,
    errorCode: normalized.body.error.code,
    errorName: error?.name,
  });

  if (res.headersSent) return;
  res.status(normalized.statusCode).json(normalized.body);
}
