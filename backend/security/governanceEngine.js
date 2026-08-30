const ACCESS_PURPOSES = Object.freeze([
  "case_management",
  "care_coordination",
  "child_safety",
  "service_referral",
  "legal_proceeding",
  "quality_assurance",
  "emergency",
]);

const AUTHORITY_BASES = Object.freeze([
  "consent",
  "authorised_by_law",
  "child_safety_function",
  "court_order",
  "emergency",
]);

const CLASSIFICATIONS = Object.freeze([
  "internal",
  "confidential",
  "restricted",
  "child_private",
]);

const STAFF_ROLES = new Set([
  "facilitator",
  "caseworker",
  "supervisor",
  "clinician",
  "admin",
  "super_admin",
]);

function deny(reason, obligations = []) {
  return { allowed: false, reason, obligations };
}

function allow(obligations) {
  return { allowed: true, reason: "allowed", obligations: [...new Set(obligations)] };
}

export function evaluateGovernedAccess(input) {
  const {
    action,
    role,
    purpose,
    authorityBasis,
    classification = "confidential",
    hasActiveCaseMembership = false,
    consentStatus = "not_required",
    approvalId = null,
    humanReviewConfirmed = false,
    retentionExpired = false,
    legalHold = false,
    emergencyJustification = null,
  } = input ?? {};

  if (!ACCESS_PURPOSES.includes(purpose)) return deny("purpose_required");
  if (!AUTHORITY_BASES.includes(authorityBasis)) return deny("authority_basis_required");
  if (!CLASSIFICATIONS.includes(classification)) return deny("classification_invalid");
  if (!role) return deny("role_required");
  if (!hasActiveCaseMembership) return deny("case_membership_required");

  if (retentionExpired && !legalHold) return deny("retention_expired", ["schedule_secure_disposal"]);

  if (purpose === "emergency") {
    if (authorityBasis !== "emergency" || typeof emergencyJustification !== "string" || emergencyJustification.trim().length < 20) {
      return deny("emergency_justification_required");
    }
  }

  if (classification === "child_private") {
    const selfAccess = role === "child";
    const safeguardingAccess =
      STAFF_ROLES.has(role) &&
      ["child_safety_function", "court_order", "emergency"].includes(authorityBasis);
    if (!selfAccess && !safeguardingAccess) return deny("child_private_access_denied");
  }

  if (authorityBasis === "consent" && consentStatus !== "active") {
    return deny(consentStatus === "withdrawn" ? "consent_withdrawn" : "active_consent_required");
  }

  if (role === "child" && classification !== "child_private") {
    return deny("child_adult_record_denied");
  }

  if (["export", "share_external", "approve_report"].includes(action) &&
      ["restricted", "child_private"].includes(classification) &&
      !approvalId) {
    return deny("approval_required");
  }

  if (["accept_ai_finding", "publish_risk_assessment", "approve_report"].includes(action)) {
    if (!STAFF_ROLES.has(role)) return deny("professional_role_required");
    if (!humanReviewConfirmed) return deny("human_review_required");
  }

  const obligations = ["record_audit_event", "apply_data_minimisation"];
  if (classification === "restricted" || classification === "child_private") {
    obligations.push("prevent_content_in_audit_metadata", "verify_recipient_scope");
  }
  if (authorityBasis === "consent") obligations.push("record_consent_version");
  if (legalHold) obligations.push("preserve_legal_hold");
  if (purpose === "emergency") obligations.push("supervisor_review_within_24_hours");
  if (["accept_ai_finding", "publish_risk_assessment"].includes(action)) {
    obligations.push("preserve_human_rationale", "label_ai_assistance");
  }

  return allow(obligations);
}

export function retentionDisposition({ retentionUntil, legalHold = false, now = new Date() }) {
  if (legalHold) return { disposition: "retain", reason: "legal_hold" };
  const deadline = new Date(retentionUntil);
  if (Number.isNaN(deadline.getTime())) return { disposition: "review", reason: "retention_date_invalid" };
  if (deadline.getTime() > now.getTime()) return { disposition: "retain", reason: "retention_period_active" };
  return { disposition: "secure_disposal_review", reason: "retention_period_ended" };
}

export function validateConsentRecord(record, now = new Date()) {
  if (!record || typeof record !== "object") return { valid: false, reason: "consent_missing" };
  if (!record.subjectUserId || !record.scope || !record.version) {
    return { valid: false, reason: "consent_incomplete" };
  }
  if (record.status !== "active") return { valid: false, reason: `consent_${record.status || "inactive"}` };
  if (record.withdrawnAt) return { valid: false, reason: "consent_withdrawn" };
  if (record.expiresAt && new Date(record.expiresAt).getTime() <= now.getTime()) {
    return { valid: false, reason: "consent_expired" };
  }
  return { valid: true, reason: "active" };
}

export { ACCESS_PURPOSES, AUTHORITY_BASES, CLASSIFICATIONS };
