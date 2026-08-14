import {
  CHILD_SESSION_MAX_AGE_SECONDS,
  childSessionExpiresAt,
  evaluateChildLoginEligibility,
  hasActiveChildMembership,
  isChildApiRequestAllowed,
  isChildSessionWithinMaximumAge,
} from "../../backend/security/childAccessPolicy.js";

function token(payload) {
  return `header.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.signature`;
}

const validMembership = [{ caseId: "case-1", membershipRole: "child", status: "active" }];
const validMetadata = {
  deviceReference: "device-123",
  platform: "android",
  clientVersion: "1.0.0",
};

describe("restricted child access policy", () => {
  test("requires a child-only role set", () => {
    expect(evaluateChildLoginEligibility({
      roles: ["child"], memberships: validMembership, metadata: validMetadata,
    })).toEqual({ allowed: true, reason: "allowed" });
    expect(evaluateChildLoginEligibility({
      roles: ["child", "parent"], memberships: validMembership, metadata: validMetadata,
    }).reason).toBe("child_role_invalid");
  });

  test("requires an active child case membership", () => {
    expect(hasActiveChildMembership(validMembership)).toBe(true);
    expect(hasActiveChildMembership([
      { caseId: "case-1", membershipRole: "parent", status: "active" },
    ])).toBe(false);
    expect(evaluateChildLoginEligibility({
      roles: ["child"], memberships: [], metadata: validMetadata,
    }).reason).toBe("child_membership_required");
  });

  test("requires device, platform and client-version metadata", () => {
    expect(evaluateChildLoginEligibility({
      roles: ["child"], memberships: validMembership, metadata: {},
    }).reason).toBe("child_device_metadata_required");
  });

  test.each([
    ["GET", "/auth/session"],
    ["POST", "/auth/logout"],
    ["GET", "/child"],
    ["POST", "/child/feelings"],
  ])("allows child-safe endpoint %s %s", (method, path) => {
    expect(isChildApiRequestAllowed(method, path)).toBe(true);
  });

  test.each([
    ["POST", "/auth/session"],
    ["GET", "/auth/logout"],
    ["GET", "/documents"],
    ["GET", "/worksheets"],
    ["GET", "/users/me"],
    ["GET", "/referrals"],
    ["GET", "/childish"],
  ])("denies adult or mismatched endpoint %s %s", (method, path) => {
    expect(isChildApiRequestAllowed(method, path)).toBe(false);
  });

  test("limits child sessions to thirty minutes from token issue", () => {
    const accessToken = token({ iat: 1_000 });
    expect(childSessionExpiresAt(accessToken)).toBe(1_000 + CHILD_SESSION_MAX_AGE_SECONDS);
    expect(isChildSessionWithinMaximumAge(accessToken, 2_799)).toBe(true);
    expect(isChildSessionWithinMaximumAge(accessToken, 2_800)).toBe(false);
    expect(isChildSessionWithinMaximumAge("invalid", 1_001)).toBe(false);
  });
});
