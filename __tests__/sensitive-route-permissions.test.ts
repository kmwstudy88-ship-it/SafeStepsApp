import {
  SENSITIVE_ROUTE_POLICIES,
  canPerformSensitiveAction,
  canViewChildRecord,
  evaluateSensitiveRouteAccess,
  getSensitiveRoutePolicy,
  type SecurityRole,
  type SensitiveRouteId,
} from "../lib/security/policy";

const routeCases: Array<{ id: SensitiveRouteId; path: string; allowedRole: SecurityRole; deniedRole: SecurityRole }> = [
  { id: "evidence", path: "/evidence", allowedRole: "parent", deniedRole: "child" },
  { id: "child_records", path: "/child/feelings", allowedRole: "child", deniedRole: "parent" },
  { id: "assessment_records", path: "/assessment-system/records", allowedRole: "caseworker", deniedRole: "child" },
  { id: "reports", path: "/reports", allowedRole: "court_viewer", deniedRole: "child" },
  { id: "documents", path: "/documents", allowedRole: "parent", deniedRole: "child" },
  { id: "sessions", path: "/sessions", allowedRole: "facilitator", deniedRole: "child" },
  { id: "referrals", path: "/referrals", allowedRole: "advocate", deniedRole: "child" },
  { id: "contact_session_entry", path: "/facilitator/contact-session-log", allowedRole: "facilitator", deniedRole: "caseworker" },
  { id: "contact_progression_review", path: "/facilitator/contact-progression-review", allowedRole: "caseworker", deniedRole: "parent" },
  { id: "worker_workspace", path: "/facilitator", allowedRole: "caseworker", deniedRole: "parent" },
  { id: "parent_child_messages", path: "/parent-child/messages", allowedRole: "parent", deniedRole: "facilitator" },
];

describe("sensitive route policy", () => {
  test("every required sensitive route has a policy", () => {
    expect(new Set(SENSITIVE_ROUTE_POLICIES.map((policy) => policy.id))).toEqual(
      new Set(routeCases.map((route) => route.id)),
    );
  });

  test.each(routeCases)("$id resolves its route policy", ({ id, path }) => {
    expect(getSensitiveRoutePolicy(path)?.id).toBe(id);
  });

  test.each(routeCases)("$id denies an otherwise allowed role without case membership", ({ id, path, allowedRole }) => {
    expect(evaluateSensitiveRouteAccess({ pathname: path, role: allowedRole, hasCaseMembership: false })).toEqual({
      allowed: false,
      routeId: id,
      reason: "case_membership_required",
    });
  });

  test.each(routeCases)("$id allows an approved role with active case membership", ({ id, path, allowedRole }) => {
    expect(evaluateSensitiveRouteAccess({ pathname: path, role: allowedRole, hasCaseMembership: true })).toEqual({
      allowed: true,
      routeId: id,
      reason: "allowed",
    });
  });

  test.each(routeCases)("$id denies a non-approved role even with case membership", ({ id, path, deniedRole }) => {
    expect(evaluateSensitiveRouteAccess({ pathname: path, role: deniedRole, hasCaseMembership: true })).toEqual({
      allowed: false,
      routeId: id,
      reason: "role_denied",
    });
  });

  test("contact session entry is more restrictive than the worker workspace", () => {
    expect(getSensitiveRoutePolicy("/facilitator/contact-session-log")?.id).toBe("contact_session_entry");
    expect(evaluateSensitiveRouteAccess({
      pathname: "/facilitator/contact-session-log",
      role: "caseworker",
      hasCaseMembership: true,
    })).toEqual({
      allowed: false,
      routeId: "contact_session_entry",
      reason: "role_denied",
    });
  });

  test("contact progression review permits facilitator and caseworker roles", () => {
    expect(evaluateSensitiveRouteAccess({
      pathname: "/facilitator/contact-progression-review",
      role: "facilitator",
      hasCaseMembership: true,
    })).toEqual({
      allowed: true,
      routeId: "contact_progression_review",
      reason: "allowed",
    });
    expect(evaluateSensitiveRouteAccess({
      pathname: "/facilitator/contact-progression-review",
      role: "caseworker",
      hasCaseMembership: true,
    })).toEqual({
      allowed: true,
      routeId: "contact_progression_review",
      reason: "allowed",
    });
  });

  test("does not protect unrelated public learning routes with case policy", () => {
    expect(evaluateSensitiveRouteAccess({ pathname: "/lessons", role: "parent", hasCaseMembership: false })).toEqual({
      allowed: true,
      routeId: null,
      reason: "not_sensitive",
    });
  });
});

describe("child permission boundary", () => {
  test("child can view only their own private record", () => {
    expect(canViewChildRecord({
      role: "child", isSelf: true, hasCaseMembership: true, isAssignedSafeguardingStaff: false,
      isRelatedParent: false, shareAudience: "private",
    })).toBe(true);
    expect(canViewChildRecord({
      role: "child", isSelf: false, hasCaseMembership: true, isAssignedSafeguardingStaff: false,
      isRelatedParent: false, shareAudience: "private",
    })).toBe(false);
  });

  test("parent cannot view child-private records", () => {
    expect(canViewChildRecord({
      role: "parent", isSelf: false, hasCaseMembership: true, isAssignedSafeguardingStaff: false,
      isRelatedParent: true, shareAudience: "private",
    })).toBe(false);
  });

  test("related parent can view content explicitly shared to parent", () => {
    expect(canViewChildRecord({
      role: "parent", isSelf: false, hasCaseMembership: true, isAssignedSafeguardingStaff: false,
      isRelatedParent: true, shareAudience: "parent",
    })).toBe(true);
  });

  test("unassigned worker is denied private child records", () => {
    expect(canViewChildRecord({
      role: "caseworker", isSelf: false, hasCaseMembership: true, isAssignedSafeguardingStaff: false,
      isRelatedParent: false, shareAudience: "private",
    })).toBe(false);
  });

  test("assigned safeguarding worker can view private child records", () => {
    expect(canViewChildRecord({
      role: "caseworker", isSelf: false, hasCaseMembership: true, isAssignedSafeguardingStaff: true,
      isRelatedParent: false, shareAudience: "private",
    })).toBe(true);
  });
});

describe("sensitive action capability", () => {
  test("parent cannot edit assessments or accept AI findings", () => {
    expect(canPerformSensitiveAction("parent", "edit_assessment")).toBe(false);
    expect(canPerformSensitiveAction("parent", "accept_ai_finding")).toBe(false);
  });

  test("assessment staff can edit assessments and accept AI findings", () => {
    expect(canPerformSensitiveAction("caseworker", "edit_assessment")).toBe(true);
    expect(canPerformSensitiveAction("supervisor", "accept_ai_finding")).toBe(true);
  });

  test("child cannot upload general case evidence or export documents", () => {
    expect(canPerformSensitiveAction("child", "upload_evidence")).toBe(false);
    expect(canPerformSensitiveAction("child", "export_document")).toBe(false);
  });
});
