import { requireAuthenticatedUser } from "./requireAuthenticatedUser.js";

const PUBLIC_API_ROUTES = Object.freeze([
  { method: "GET", path: "/health" },
  { method: "POST", path: "/auth/child/login" },
  { method: "POST", path: "/auth/parent/login" },
  { method: "POST", path: "/auth/caseworker/login" },
]);

function normalizePath(value) {
  const path = typeof value === "string" ? value.split(/[?#]/, 1)[0] : "/";
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
}

export function isPublicApiRequest(method, path) {
  const normalizedMethod = String(method || "").toUpperCase();
  const normalizedPath = normalizePath(path);
  return PUBLIC_API_ROUTES.some(
    (route) => route.method === normalizedMethod && route.path === normalizedPath,
  );
}

export function universalApiProtection(req, res, next) {
  if (isPublicApiRequest(req.method, req.path ?? req.originalUrl)) {
    next();
    return;
  }

  return requireAuthenticatedUser(req, res, next);
}

export { PUBLIC_API_ROUTES };
