import { supabase } from "../supabase";
import {
  evaluateSensitiveRouteAccess,
  type CaseMembershipRole,
  type SecurityRole,
} from "./policy";

const SECURITY_ROLES: readonly SecurityRole[] = [
  "child", "parent", "facilitator", "caseworker", "supervisor", "clinician",
  "court_viewer", "carer", "advocate", "admin", "super_admin",
];

const ROLE_PRIORITY: readonly SecurityRole[] = [
  "super_admin", "admin", "supervisor", "clinician", "caseworker", "facilitator",
  "court_viewer", "advocate", "carer", "child", "parent",
];

export type CaseAccessGrant = {
  caseId: string;
  userId: string;
  role: SecurityRole;
  membershipRole: CaseMembershipRole;
  membershipStatus: "active";
  caseStatus: string;
};

export class SensitiveAccessError extends Error {
  constructor(
    message: string,
    readonly code: "AUTH_REQUIRED" | "ROLE_REQUIRED" | "CASE_REQUIRED" | "CASE_AMBIGUOUS" | "ACCESS_DENIED",
  ) {
    super(message);
    this.name = "SensitiveAccessError";
  }
}

function parseSecurityRole(value: unknown): SecurityRole | null {
  return typeof value === "string" && SECURITY_ROLES.includes(value as SecurityRole)
    ? (value as SecurityRole)
    : null;
}

async function currentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new SensitiveAccessError("Sign in before opening protected SafeSteps records.", "AUTH_REQUIRED");
  return data.user;
}

export async function getCurrentSecurityRole(): Promise<SecurityRole> {
  const user = await currentUser();
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (error) throw error;

  const databaseRoles = (data ?? [])
    .map((item) => parseSecurityRole(item.role))
    .filter((role): role is SecurityRole => Boolean(role));
  const metadataRole = parseSecurityRole(user.app_metadata?.role) ?? parseSecurityRole(user.user_metadata?.role);
  const roles = metadataRole ? [...databaseRoles, metadataRole] : databaseRoles;
  const role = ROLE_PRIORITY.find((candidate) => roles.includes(candidate));

  if (!role) throw new SensitiveAccessError("Your SafeSteps role has not been assigned.", "ROLE_REQUIRED");
  return role;
}

export async function listMyActiveCaseIds(): Promise<string[]> {
  const user = await currentUser();
  const { data, error } = await supabase
    .from("case_memberships")
    .select("case_id")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (error) throw error;
  return [...new Set((data ?? []).map((item) => String(item.case_id)))];
}

export async function resolveSingleActiveCaseId(): Promise<string> {
  const caseIds = await listMyActiveCaseIds();
  if (caseIds.length === 0) {
    throw new SensitiveAccessError("No active case membership is assigned to this account.", "CASE_REQUIRED");
  }
  if (caseIds.length > 1) {
    throw new SensitiveAccessError("Select a case before opening sensitive records.", "CASE_AMBIGUOUS");
  }
  return caseIds[0];
}

export async function getCaseAccessGrant(caseId: string): Promise<CaseAccessGrant | null> {
  const user = await currentUser();
  const role = await getCurrentSecurityRole();
  const { data, error } = await supabase.rpc("get_my_case_access_grant", { target_case_id: caseId });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return {
    caseId,
    userId: user.id,
    role,
    membershipRole: row.membership_role as CaseMembershipRole,
    membershipStatus: "active",
    caseStatus: String(row.case_status ?? "active"),
  };
}

export async function assertSensitiveRouteAccess(pathname: string, requestedCaseId?: string | null): Promise<CaseAccessGrant> {
  const role = await getCurrentSecurityRole();
  const caseId = requestedCaseId || (await resolveSingleActiveCaseId());
  const grant = await getCaseAccessGrant(caseId);
  const decision = evaluateSensitiveRouteAccess({ pathname, role, hasCaseMembership: Boolean(grant) });

  if (!decision.allowed || !grant) {
    throw new SensitiveAccessError(
      decision.reason === "role_denied"
        ? "Your SafeSteps role cannot open this protected area."
        : "You are not an active member of the selected case.",
      "ACCESS_DENIED",
    );
  }

  return grant;
}
