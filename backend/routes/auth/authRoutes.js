import express from "express";

import { badRequest, forbidden, unauthorized } from "../../lib/apiError.js";
import {
  createSafeStepsClient,
  ensureActiveSecuritySession,
  resolveAuthorizationContext,
} from "../../lib/supabase.js";
import { requireAuthenticatedUser } from "../../middleware/requireAuthenticatedUser.js";

const router = express.Router();

const AUDIENCE_ROLES = {
  child: ["child"],
  parent: ["parent"],
  caseworker: ["caseworker", "supervisor", "clinician", "admin", "super_admin"],
};

router.post("/child/login", loginForAudience("child"));
router.post("/parent/login", loginForAudience("parent"));
router.post("/caseworker/login", loginForAudience("caseworker"));

router.get("/session", requireAuthenticatedUser, async (req, res) => {
  res.json({
    data: sessionResponse(req.safeStepsAuth),
    meta: { requestId: req.id },
  });
});

router.post("/logout", requireAuthenticatedUser, async (req, res, next) => {
  try {
    if (!req.safeStepsAuth.isLocalBypass) {
      const { error } = await req.safeStepsAuth.supabase
        .from("user_security_sessions")
        .update({
          revoked_at: new Date().toISOString(),
          revocation_reason: "user_logout",
        })
        .eq("user_id", req.safeStepsAuth.user.id)
        .eq("auth_session_reference", req.safeStepsAuth.sessionReference);

      if (error) throw error;
    }

    res.json({
      data: { signedOut: true },
      meta: { requestId: req.id },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

function loginForAudience(audience) {
  return async (req, res, next) => {
    try {
      const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      if (!email || !password) {
        throw badRequest("Email and password are required.");
      }

      const client = createSafeStepsClient();
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error || !data.user || !data.session) {
        throw unauthorized("LOGIN_FAILED", "The email or password is incorrect.");
      }

      const authorization = await resolveAuthorizationContext(client, data.user.id);
      const allowedRoles = AUDIENCE_ROLES[audience];
      if (!authorization.roles.some((role) => allowedRoles.includes(role))) {
        throw forbidden(
          "LOGIN_ROLE_MISMATCH",
          `This account cannot use the SafeSteps ${audience} login.`,
        );
      }

      await ensureActiveSecuritySession(client, data.user, data.session.access_token, {
        deviceReference: header(req, "x-device-id"),
        platform: header(req, "x-client-platform"),
        clientVersion: header(req, "x-client-version"),
      });

      res.json({
        data: {
          audience,
          user: {
            id: data.user.id,
            email: data.user.email ?? null,
          },
          roles: authorization.roles,
          memberships: authorization.memberships,
          session: {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: data.session.expires_at ?? null,
            expiresIn: data.session.expires_in,
            tokenType: data.session.token_type,
          },
        },
        meta: { requestId: req.id },
      });
    } catch (error) {
      next(error);
    }
  };
}

function sessionResponse(auth) {
  return {
    user: auth.user
      ? {
          id: auth.user.id,
          email: auth.user.email ?? null,
        }
      : null,
    roles: auth.roles,
    memberships: auth.memberships,
    sessionReference: auth.sessionReference,
  };
}

function header(req, name) {
  const value = req.headers[name];
  return typeof value === "string" ? value.slice(0, 200) : null;
}
