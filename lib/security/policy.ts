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

const STAFF_CASE_ROLES = [
  "facilitator",
  "caseworker