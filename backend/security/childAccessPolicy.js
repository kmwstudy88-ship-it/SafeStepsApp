const CHILD_SESSION_MAX_AGE_SECONDS = 30 * 60;

const CHILD_API_ROUTES = Object.freeze([
  { method: "GET", path: "/auth/session", exact: true },
  { method: "POST", path: "/auth/logout", exact: true },
  { method: "*", path: "/child", exact: false },
]);

function normalizePath(value) {
  const path = typeof value === "string" ? value.split(/[?#]/, 1)[0] : "/";
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
}

function prefixMatches(path, prefix) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function isRestrictedChildAccount(roles) {
  return Array.isArray(roles) && roles.includes("child");
}

export function hasValidChildRoleSet(roles) {
  return Array.isArray(roles) && roles.length === 1 && roles[0] === "child";
}

export function hasActiveChildMembership(memberships) {
  return Array.isArray(memberships) && memberships.some(
    (membership) =>
      membership?.status === "active" &&
      membership?.membershipRole === "child" &&
      typeof membership?.caseId === "string" &&
      membership.caseId.length > 0,
  );
}

export function hasRequiredChildDeviceMetadata(metadata) {
  return Boolean(
    typeof metadata?.deviceReference === "string" &&
      metadata.deviceReference.trim().length >= 8 &&
      typeof metadata?.platform === "string" &&
      metadata.platform.trim().length > 0 &&
      typeof metadata?.clientVersion === "string" &&
      metadata.clientVersion.trim().length > 0,
  );
}

export function isChildApiRequestAllowed(method, path) {
  const normalizedMethod = String(method || "").toUpperCase();
  const normalizedPath = normalizePath(path);
  return CHILD_API_ROUTES.some((route) => {
    const methodMatches = route.method === "*" || route.method === normalizedMethod;
    const pathMatches = route.exact
      ? normalizedPath === route.path
      : prefixMatches(normalizedPath, route.path);
    return methodMatches && pathMatches;
  });
}

export function tokenIssuedAtSeconds(accessToken) {
  try {
    const payload = JSON.parse(
      Buffer.from(String(accessToken).split(".")[1], "base64url").toString("utf8"),
    );
    return Number.isFinite(payload.iat) ? Number(payload.iat) : null;
  } catch {
    return null;
  }
}

export function childSessionExpiresAt(accessToken) {
  const issuedAt = tokenIssuedAtSeconds(accessToken);
  return issuedAt === null ? null : issuedAt + CHILD_SESSION_MAX_AGE_SECONDS;
}

export function isChildSessionWithinMaximumAge(accessToken, nowSeconds = Math.floor(Date.now() / 1000)) {
  const expiresAt = childSessionExpiresAt(accessToken);
  return expiresAt !== null && nowSeconds < expiresAt;
}

export function evaluateChildLoginEligibility({ roles, memberships, metadata }) {
  if (!hasValidChildRoleSet(roles)) return { allowed: false, reason: "child_role_invalid" };
  if (!hasActiveChildMembership(memberships)) {
    return { allowed: false, reason: "child_membership_required" };
  }
  if (!hasRequiredChildDeviceMetadata(metadata)) {
    return { allowed: false, reason: "child_device_metadata_required" };
  }
  return { allowed: true, reason: "allowed" };
}

export { CHILD_API_ROUTES, CHILD_SESSION_MAX_AGE_SECONDS };
