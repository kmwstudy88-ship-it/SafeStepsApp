import {
  evaluateGovernedAccess,
  retentionDisposition,
  validateConsentRecord,
} from "../../backend/security/governanceEngine.js";

const base = {
  action: "view",
  role: "caseworker",
  purpose: "case_management",
  authorityBasis: "child_safety_function",
  classification: "confidential",
  hasActiveCaseMembership: true,
};

describe("governance and compliance decisions", () => {
  test("requires a declared purpose, authority and case membership", () => {
    expect(evaluateGovernedAccess({ ...base, purpose: null }).reason).toBe("purpose_required");
    expect(evaluateGovernedAccess({ ...base, authorityBasis: null }).reason).toBe("authority_basis_required");
    expect(evaluateGovernedAccess({ ...base, hasActiveCaseMembership: false }).reason).toBe("case_membership_required");
  });

  test("stops consent-based access after withdrawal", () => {
    expect(evaluateGovernedAccess({
      ...base, authorityBasis: "consent", consentStatus: "withdrawn",
    })).toEqual({ allowed: false, reason: "consent_withdrawn", obligations: [] });
  });

  test("protects child-private information", () => {
    expect(evaluateGovernedAccess({
      ...base, role: "parent", classification: "child_private", authorityBasis: "consent",
      consentStatus: "active",
    }).reason).toBe("child_private_access_denied");
    expect(evaluateGovernedAccess({
      ...base, role: "child", classification: "child_private",
    }).allowed).toBe(true);
  });

  test("requires approval for restricted exports", () => {
    expect(evaluateGovernedAccess({
      ...base, action: "export", classification: "restricted",
    }).reason).toBe("approval_required");
    expect(evaluateGovernedAccess({
      ...base, action: "export", classification: "restricted", approvalId: "approval-1",
    }).allowed).toBe(true);
  });

  test("never accepts AI findings without professional human review", () => {
    expect(evaluateGovernedAccess({
      ...base, action: "accept_ai_finding",
    }).reason).toBe("human_review_required");
    const decision = evaluateGovernedAccess({
      ...base, action: "accept_ai_finding", humanReviewConfirmed: true,
    });
    expect(decision.allowed).toBe(true);
    expect(decision.obligations).toEqual(expect.arrayContaining([
      "preserve_human_rationale", "label_ai_assistance", "record_audit_event",
    ]));
  });

  test("requires meaningful emergency justification", () => {
    expect(evaluateGovernedAccess({
      ...base, purpose: "emergency", authorityBasis: "emergency", emergencyJustification: "urgent",
    }).reason).toBe("emergency_justification_required");
    expect(evaluateGovernedAccess({
      ...base, purpose: "emergency", authorityBasis: "emergency",
      emergencyJustification: "Immediate action is required to protect a child.",
    }).obligations).toContain("supervisor_review_within_24_hours");
  });

  test("retention expiry schedules review, while a legal hold preserves records", () => {
    expect(retentionDisposition({
      retentionUntil: "2025-01-01T00:00:00Z", now: new Date("2026-01-01T00:00:00Z"),
    }).disposition).toBe("secure_disposal_review");
    expect(retentionDisposition({
      retentionUntil: "2025-01-01T00:00:00Z", legalHold: true,
    })).toEqual({ disposition: "retain", reason: "legal_hold" });
  });

  test("validates versioned consent and expiry", () => {
    const consent = {
      subjectUserId: "user-1", scope: "referral", version: "v1", status: "active",
      expiresAt: "2027-01-01T00:00:00Z",
    };
    expect(validateConsentRecord(consent, new Date("2026-01-01T00:00:00Z"))).toEqual({
      valid: true, reason: "active",
    });
    expect(validateConsentRecord(consent, new Date("2028-01-01T00:00:00Z")).reason).toBe("consent_expired");
  });
});
