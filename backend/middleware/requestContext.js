import { randomUUID } from "node:crypto";

const SAFE_REQUEST_ID = /^[a-zA-Z0-9._-]{8,128}$/;

export function requestContext(req, res, next) {
  const incoming = req.headers["x-request-id"];
  req.id = typeof incoming === "string" && SAFE_REQUEST_ID.test(incoming) ? incoming : randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
}
