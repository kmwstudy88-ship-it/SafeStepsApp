import { forbidden, unauthorized } from "../lib/apiError.js";
import {
  createSafeStepsClient,
  ensureActiveSecuritySession,
  resolveAuthorizationContext,
} from "../lib/supabase.js";

export function bearerToken(authorizationHeader) {
  if (typeof authorizationHeader !== "string") return null;
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function requireAuthenticatedUser(req, _res, next) {
  try {
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.SAFESTEPS_ALLOW_UNAUTHENTICATED_LOCAL_API === "true"
    ) {
      req.safeStepsAuth = {
        accessToken: null,
        user: null,
        roles: ["caseworker"],
        memberships: [],
        sessionReference: null,
        supabase: null,
        isLocalBypass: true,
      };
      req.safeStepsUser = null;
      next();
      return;
    }

    const token = bearerToken(req.headers.authorization);
    if (!token) {
      throw unauthorized("AUTH_REQUIRED", "Authentication required. Send a valid SafeSteps bearer token.");
    }

    const client = createSafeStepsClient(token);
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) {
      throw unauthorized("AUTH_INVALID", "The SafeSteps bearer token is invalid or expired.");
    }

    const authorization = await resolveAuthorizationContext(client, data.user.id);
    if (authorization.roles.length === 0) {
      throw forbidden("ROLE_UNASSIGNED", "This account does not have an assigned SafeSteps role.");
    }

    const sessionReference = await ensureActiveSecuritySession(client, data.user, token, {
      deviceReference: req.headers["x-device-id"],
      platform: req.headers["x-client-platform"],
      clientVersion: req.headers["x-client-version"],
    });

    req.safeStepsUser = data.user;
    req.safeStepsAuth = {
      accessToken: token,
      user: data.user,
      roles: authorization.roles,
      memberships: authorization.memberships,
      sessionReference,
      supabase: client,
      isLocalBypass: false,
    };
    next();
  } catch (error) {
    next(error);
  }
}
