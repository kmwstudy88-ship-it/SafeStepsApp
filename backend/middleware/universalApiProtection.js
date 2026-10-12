import { forbidden, unauthorized } from "../lib/apiError.js";
import {
  hasActiveChildMembership,
  hasValidChildRoleSet,
  isChildApiRequestAllowed,
  isChildSessionWithinMaximumAge,
  isRestrictedChildAccount,
} from "../security/childAccessPolicy.js";
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
  const path = req.path ?? req.originalUrl;
  if (isPublicApiRequest(req.method, path)) {
    next();
    return;
  }

  return requireAuthenticatedUser(req, res, (error) => {
    if (error) {
      next(error);
      return;
    }

    const auth = req.safeStepsAuth;
    if (!isRestrictedChildAccount(auth?.roles)) {
      next();
      return;
    }

    if (!hasValidChildRoleSet(auth.roles) || !hasActiveChildMembership(auth.memberships)) {
      next(forbidden(
        "CHILD_ACCESS_CONTEXT_INVALID",
        "This child account does not have a valid restricted SafeSteps access context.",
      ));
      return;
    }

    if (!isChildSessionWithinMaximumAge(auth.accessToken)) {
      next(unauthorized(
        "CHILD_SESSION_EXPIRED",
        "This child session has ended. Please sign in again with a trusted adult or worker.",
      ));
      return;
    }

    if (!isChildApiRequestAllowed(req.method, path)) {
      next(forbidden(
        "CHILD_ROUTE_RESTRICTED",
        "This area is not available from a child account.",
      ));
      return;
    }

    next();
  });
}

export { PUBLIC_API_ROUTES };
