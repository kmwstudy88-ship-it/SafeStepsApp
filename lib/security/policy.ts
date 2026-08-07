export type SecurityRole =
  | "child"
  | "parent"
  | "facilitator"
  | "caseworker"
  | "supervisor"
  | "clinician"
  | "court_viewer"
  | "carer"
  | "advocate"
  | "admin"
  | "super_admin";

export type CaseMembershipRole =
  | "case_owner"
  | "child"
  | "parent"
  | "facilitator"
  | "caseworker"
  | "supervisor"
  | "clinician"
  | "court_viewer"
  | "carer"
  | "advocate"
  | "admin";

export type SensitiveRouteId =
  | "evidence"
  | "child_records"
  | "assessment_records"
  | "reports"
  | "documents"
  | "sessions"
  | "referrals"
  | "worker_workspace"
  | "parent_child_messages";

export type SensitiveAction =
  | "view"
  | "upload_evidence"
  | "edit_assessment"
  | "accept_ai_finding"
  | "export_document"
  | "review_parent_child_message";

export type SensitiveRoutePolicy = {
  id: SensitiveRouteId;
  prefixes: readonly string[];
  allowedRoles: readonly SecurityRole[];
  requiresCaseMembership: true;
  childBoundary: "none" | "child_private" | "child_shared";
};

const STAFF_CASE_ROLES: readonly SecurityRole[] = [
  "facilitator",
  "caseworker",
  "supervisor",
  "clinician",
  "admin",
  "super_admin",
];

export const SENSITIVE_ROUTE_POLICIES: readonly SensitiveRoutePolicy[] = [
  {
    id: "parent_child_messages",
    prefixes: ["/parent-child/messages"],
    allowedRoles: ["child", "parent", "caseworker", "supervisor", "admin", "super_admin"],
    requiresCaseMembership: true,
    childBoundary: "child_shared",
  },
  {
    id: "child_records",
    prefixes: ["/child"],
    allowedRoles: ["child", "caseworker", "supervisor", "clinician", "admin", "super_admin"],
    requiresCaseMembership: true,
    childBoundary: "child_private",
  },
  {
    id: "assessment_records",
    prefixes: [
      "/assessment-system/records",
      "/assessment-system/scoring",
      "/assessment-system/rubric-scoring",
      "/assessment-system/readiness-index",
      "/assessment-system/report-output",
      "/assessment-system/parent-identity",
      "/assessment-system/parent-profiles",
      "/assessment-system/child-development-capacity",
      "/assessment-system/intensive-reunification-support",
    ],
    allowedRoles: ["parent", ...STAFF_CASE_ROLES],
    requiresCaseMembership: true,
    childBoundary: "none",
  },
  {
    id: "evidence",
    prefixes: ["/assessment-system/evidence-uploads", "/evidence-upload", "/daily-evidence", "/evidence"],
    allowedRoles: ["parent", ...STAFF_CASE_ROLES],
    requiresCaseMembership: true,
    childBoundary: "none",
  },
  {
    id: "reports",
    prefixes: ["/reports"],
    allowedRoles: ["parent", "facilitator", "caseworker", "supervisor", "clinician", "court_viewer", "admin", "super_admin"],
    requiresCaseMembership: true,
    childBoundary: "none",
  },
  {
    id: "documents",
    prefixes: ["/documents"],
    allowedRoles: ["parent", ...STAFF_CASE_ROLES],
    requiresCaseMembership: true,
    childBoundary: "none",
  },
  {
    id: "sessions",
    prefixes: ["/sessions"],
    allowedRoles: ["parent", ...STAFF_CASE_ROLES],
    requiresCaseMembership: true,
    childBoundary: "none",
  },
  {
    id: "referrals",
    prefixes: ["/referrals"],
    allowedRoles: ["parent", "advocate", ...STAFF_CASE_ROLES],
    requiresCaseMembership: true,
    childBoundary: "none",
  },
  {
    id: "worker_workspace",
    prefixes: ["/facilitator"],
    allowedRoles: STAFF_CASE_ROLES,
    requiresCaseMembership: true,
    childBoundary: "none",
  },
] as const;

export type RouteAccessDecision = {
  allowed: boolean;
  routeId: SensitiveRouteId | null;
  reason: "not_sensitive" | "allowed" | "missing_role" | "role_denied" | "case_membership_required";
};

function normalizePathname(pathname: string): string {
  const withoutQuery = pathname.split(/[?#]/, 1)[0] || "/";
  const withSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
}

function prefixMatches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function getSensitiveRoutePolicy(pathname: string): SensitiveRoutePolicy | null {
  const normalized = normalizePathname(pathname);
  const matches = SENSITIVE_ROUTE_POLICIES.filter((policy) =>
    policy.prefixes.some((prefix) => prefixMatches(normalized, normalizePathname(prefix))),
  );

  return (
    matches.sort((left, right) => {
      const leftLength = Math.max(...left.prefixes.map((prefix) => prefix.length));
      const rightLength = Math.max(...right.prefixes.map((prefix) => prefix.length));
      return rightLength - leftLength;
    })[0] ?? null
  );
}

export function canRoleAccessSensitiveRoute(role: SecurityRole | null | undefined, routeId: SensitiveRouteId): boolean {
  if (!role) return false;
  const policy = SENSITIVE_ROUTE_POLICIES.find((item) => item.id === routeId);
  return Boolean(policy?.allowedRoles.includes(role));
}

export function evaluateSensitiveRouteAccess(input: {
  pathname: string;
  role: SecurityRole | null | undefined;
  hasCaseMembership: boolean;
}): RouteAccessDecision {
  const policy = getSensitiveRoutePolicy(input.pathname);
  if (!policy) return { allowed: true, routeId: null, reason: "not_sensitive" };
  if (!input.role) return { allowed: false, routeId: policy.id, reason: "missing_role" };
  if (!policy.allowedRoles.includes(input.role)) {
    return { allowed: false, routeId: policy.id, reason: "role_denied" };
  }
  if (policy.requiresCaseMembership && !input.hasCaseMembership) {
    return { allowed: false, routeId: policy.id, reason: "case_membership_required" };
  }
  return { allowed: true, routeId: policy.id, reason: "allowed" };
}

export function canPerformSensitiveAction(role: SecurityRole | null | undefined, action: SensitiveAction): boolean {
  if (!role) return false;
  switch (action) {
    case "view":
      return true;
    case "upload_evidence":
      return ["parent", ...STAFF_CASE_ROLES].includes(role);
    case "edit_assessment":
    case "accept_ai_finding":
      return ["caseworker", "supervisor", "clinician", "admin", "super_admin"].includes(role);
    case "export_document":
      return ["parent", "caseworker", "supervisor", "clinician", "court_viewer", "admin", "super_admin"].includes(role);
    case "review_parent_child_message":
      return ["caseworker", "supervisor", "admin", "super_admin"].includes(role);
  }
}

export function canViewChildRecord(input: {
  role: SecurityRole | null | undefined;
  isSelf: boolean;
  hasCaseMembership: boolean;
  isAssignedSafeguardingStaff: boolean;
  isRelatedParent: boolean;
  shareAudience: "private" | "parent" | "caseworker" | "both";
}): boolean {
  if (!input.role || !input.hasCaseMembership) return false;
  if (input.role === "child") return input.isSelf;
  if (input.role === "parent") {
    return input.isRelatedParent && ["parent", "both"].includes(input.shareAudience);
  }
  if (["admin", "super_admin"].includes(input.role)) return true;
  if (["caseworker", "supervisor", "clinician"].includes(input.role)) {
    return input.isAssignedSafeguardingStaff;
  }
  return false;
}

export function canViewParentWorkerCaseRecord(input: {
  role: SecurityRole | null | undefined;
  hasCaseMembership: boolean;
}): boolean {
  return Boolean(input.role && input.hasCaseMembership && input.role !== "child");
}
