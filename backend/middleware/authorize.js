import { badRequest, forbidden } from "../lib/apiError.js";

export const PARENT_DOCUMENT_ROLES = ["parent"];
export const STAFF_DOCUMENT_ROLES = [
  "facilitator",
  "caseworker",
  "supervisor",
  "clinician",
  "admin",
  "super_admin",
];
export const DOCUMENT_ROLES = [...PARENT_DOCUMENT_ROLES, ...STAFF_DOCUMENT_ROLES];

export function hasAnyRole(actualRoles, allowedRoles) {
  return actualRoles.some((role) => allowedRoles.includes(role));
}

export function hasActiveCaseMembership(memberships, caseId) {
  return memberships.some(
    (membership) => membership.caseId === caseId && membership.status === "active",
  );
}

export function requireAnyRole(...allowedRoles) {
  return (req, _res, next) => {
    if (req.safeStepsAuth?.isLocalBypass) {
      next();
      return;
    }

    if (!hasAnyRole(req.safeStepsAuth?.roles ?? [], allowedRoles)) {
      next(
        forbidden(
          "ROLE_FORBIDDEN",
          "Your SafeSteps role cannot perform this action.",
        ),
      );
      return;
    }

    next();
  };
}

export function caseIdFromRequest(req) {
  const value = req.params?.caseId ?? req.body?.caseId ?? req.query?.caseId;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function requireCaseAccess(req, _res, next) {
  if (req.safeStepsAuth?.isLocalBypass) {
    next();
    return;
  }

  const caseId = caseIdFromRequest(req);
  if (!caseId) {
    next(badRequest("caseId is required for this SafeSteps request."));
    return;
  }

  if (!hasActiveCaseMembership(req.safeStepsAuth?.memberships ?? [], caseId)) {
    next(
      forbidden(
        "CASE_ACCESS_FORBIDDEN",
        "You are not an active member of the selected SafeSteps case.",
      ),
    );
    return;
  }

  req.safeStepsCaseId = caseId;
  next();
}
