export type CanonicalDomainId =
  | "platform"
  | "identity"
  | "organisations"
  | "families"
  | "cases"
  | "child_experience"
  | "learning"
  | "assessments"
  | "evidence"
  | "safety"
  | "visits"
  | "community"
  | "communications"
  | "reports"
  | "analytics"
  | "integrations"
  | "governance"
  | "operations";

export type CanonicalTableMapping = {
  canonicalTable: string;
  domain: CanonicalDomainId;
  tenantScoped: boolean;
  existingTables: string[];
  migrationAction:
    | "keep"
    | "standardise"
    | "merge"
    | "transform"
    | "create_then_link"
    | "create_general_registry"
    | "create_general_registry_and_views"
    | "split_definition_from_instance"
    | "create_compatibility_view_then_migrate";
  requiredColumns?: string[];
};

export type CanonicalReadinessCheck = {
  inventoryCaptured?: boolean;
  mappingApproved?: boolean;
  backupRecorded?: boolean;
  tenantBoundaryDefined?: boolean;
  blockedNamesReviewed?: boolean;
  stage2MigrationOrderDefined?: boolean;
  foundationTestsDefined?: boolean;
};

export const canonicalDomains: { id: CanonicalDomainId; purpose: string }[] = [
  { id: "platform", purpose: "Tenants, environments, configuration and licensing" },
  { id: "identity", purpose: "Profiles, memberships, roles and permissions" },
  { id: "organisations", purpose: "Organisations, units, teams and staff" },
  { id: "families", purpose: "Families, parents, carers, children and relationships" },
  { id: "cases", purpose: "Cases, allocations, plans, goals, tasks and reviews" },
  { id: "child_experience", purpose: "Child voice, privacy, journals, requests and sharing" },
  { id: "learning", purpose: "Courses, lessons, activities, quizzes and certificates" },
  { id: "assessments", purpose: "Assessment definitions, instances, domains and scoring" },
  { id: "evidence", purpose: "Evidence records, files, verification and provenance" },
  { id: "safety", purpose: "Safety plans, incidents, crisis events and emergency actions" },
  { id: "visits", purpose: "Visits, participants, observations and reflections" },
  { id: "community", purpose: "Providers, services, referrals, waitlists and outcomes" },
  { id: "communications", purpose: "Messages, notifications, contact logs and templates" },
  { id: "reports", purpose: "Report definitions, snapshots, exports and court reports" },
  { id: "analytics", purpose: "Metrics, snapshots, outcomes and research" },
  { id: "integrations", purpose: "API clients, webhooks, extensions and sync jobs" },
  { id: "governance", purpose: "Consent, complaints, challenges, audit and legal holds" },
  { id: "operations", purpose: "Releases, backups, incidents and disaster recovery" },
];

export const foundationDependencyOrder = [
  "extensions",
  "platform_tenants",
  "global_lookup_definitions",
  "organisations",
  "profiles",
  "tenant_memberships",
  "roles_and_permissions",
  "families",
  "family_members",
  "children",
  "cases",
  "case_participants",
  "case_allocations",
  "case_plans",
  "case_plan_goals",
  "audit_events",
  "rls_policies",
  "seed_records",
  "tests",
] as const;

export const canonicalTableMappings: CanonicalTableMapping[] = [
  {
    canonicalTable: "platform_tenants",
    domain: "platform",
    tenantScoped: false,
    existingTables: ["platform_tenants"],
    migrationAction: "keep",
  },
  {
    canonicalTable: "organisations",
    domain: "organisations",
    tenantScoped: true,
    existingTables: ["organisations"],
    migrationAction: "standardise",
    requiredColumns: ["tenant_id", "organisation_reference", "organisation_status"],
  },
  {
    canonicalTable: "profiles",
    domain: "identity",
    tenantScoped: false,
    existingTables: ["profiles", "app_profiles", "user_profiles", "parent_profiles", "staff_profiles"],
    migrationAction: "standardise",
    requiredColumns: [
      "id",
      "display_name",
      "preferred_name",
      "primary_email",
      "primary_phone",
      "default_tenant_id",
      "profile_status",
    ],
  },
  {
    canonicalTable: "tenant_memberships",
    domain: "identity",
    tenantScoped: true,
    existingTables: ["platform_tenant_memberships"],
    migrationAction: "create_compatibility_view_then_migrate",
  },
  {
    canonicalTable: "role_assignments",
    domain: "identity",
    tenantScoped: true,
    existingTables: ["user_role_assignments"],
    migrationAction: "transform",
  },
  {
    canonicalTable: "families",
    domain: "families",
    tenantScoped: true,
    existingTables: ["families"],
    migrationAction: "standardise",
    requiredColumns: ["tenant_id", "family_reference", "family_status"],
  },
  {
    canonicalTable: "family_members",
    domain: "families",
    tenantScoped: true,
    existingTables: ["family_members", "case_participants", "parent_child_relationships"],
    migrationAction: "merge",
  },
  {
    canonicalTable: "children",
    domain: "families",
    tenantScoped: true,
    existingTables: ["child_profiles", "children"],
    migrationAction: "create_then_link",
  },
  {
    canonicalTable: "cases",
    domain: "cases",
    tenantScoped: true,
    existingTables: ["cases", "reunification_cases", "casefiles", "case_records"],
    migrationAction: "merge",
    requiredColumns: ["tenant_id", "organisation_id", "family_id", "case_reference", "case_type", "case_status"],
  },
  {
    canonicalTable: "case_participants",
    domain: "cases",
    tenantScoped: true,
    existingTables: ["case_participants"],
    migrationAction: "standardise",
  },
  {
    canonicalTable: "case_allocations",
    domain: "cases",
    tenantScoped: true,
    existingTables: ["case_assignments", "case_allocations", "worker_case_assignments"],
    migrationAction: "merge",
  },
  {
    canonicalTable: "assessment_definitions",
    domain: "assessments",
    tenantScoped: false,
    existingTables: ["assessments", "assessment_frameworks", "assessment_template_versions"],
    migrationAction: "split_definition_from_instance",
  },
  {
    canonicalTable: "assessment_instances",
    domain: "assessments",
    tenantScoped: true,
    existingTables: ["assessments", "assessment_records", "assessment_runs", "assessment_sessions"],
    migrationAction: "transform",
  },
  {
    canonicalTable: "evidence_records",
    domain: "evidence",
    tenantScoped: true,
    existingTables: ["evidence_items", "evidence_records", "evidence_uploads"],
    migrationAction: "merge",
  },
  {
    canonicalTable: "community_service_referrals",
    domain: "community",
    tenantScoped: true,
    existingTables: ["case_service_referrals", "community_service_referrals"],
    migrationAction: "merge",
  },
  {
    canonicalTable: "consent_records",
    domain: "governance",
    tenantScoped: true,
    existingTables: ["community_referral_consents", "child_share_permissions", "consent_records"],
    migrationAction: "create_general_registry",
  },
  {
    canonicalTable: "audit_events",
    domain: "governance",
    tenantScoped: true,
    existingTables: ["audit_events", "platform_tenant_audit_events", "community_service_audit_events", "ai_audit_events"],
    migrationAction: "create_general_registry_and_views",
  },
];

export const blockedLegacyTableNames = [
  "casefiles",
  "case_files",
  "client_cases",
  "family_cases",
  "service_case_records",
  "assessment_runs",
  "assessment_sessions",
  "tenant_users",
  "account_tenants",
];

export const stage2FoundationMigrations = [
  "0001_extensions.sql",
  "0002_platform_tenants.sql",
  "0003_organisations.sql",
  "0004_profiles_and_memberships.sql",
  "0005_roles_and_permissions.sql",
  "0006_families_and_members.sql",
  "0007_children.sql",
  "0008_cases_and_participants.sql",
  "0009_case_allocations.sql",
  "0010_audit_foundation.sql",
  "0011_foundation_rls.sql",
  "0012_foundation_tests.sql",
];

export const milestone1AcceptanceTests = [
  "Tenant A user reads Tenant B family: denied.",
  "Tenant A administrator reads Tenant B case: denied.",
  "Unassigned worker reads a case: denied.",
  "Assigned worker reads authorised case: allowed.",
  "Parent reads own approved case data: allowed.",
  "Parent reads another family's data: denied.",
  "Child reads child-approved content: allowed.",
  "Parent reads child-private journal: denied.",
  "Suspended membership uses active session: denied.",
  "Expired role assignment accesses record: denied.",
  "Audit event created for sensitive access: required.",
  "Cross-tenant grant expires: access immediately denied.",
  "Tenant export includes another tenant: test must fail.",
  "Service-role operation lacks tenant scope: rejected or audited exception.",
];

export function getCanonicalMapping(canonicalTable: string) {
  return canonicalTableMappings.find((mapping) => mapping.canonicalTable === canonicalTable);
}

export function listTenantScopedCanonicalTables() {
  return canonicalTableMappings.filter((mapping) => mapping.tenantScoped).map((mapping) => mapping.canonicalTable);
}

export function findBlockedLegacyNames(tableNames: string[]) {
  const normalised = new Set(tableNames.map((name) => name.toLowerCase()));
  return blockedLegacyTableNames.filter((name) => normalised.has(name));
}

export function evaluateStage1Readiness(check: CanonicalReadinessCheck) {
  const blockers: string[] = [];

  if (!check.backupRecorded) {
    blockers.push("Record a Supabase backup timestamp before executable consolidation migrations.");
  }

  if (!check.inventoryCaptured) {
    blockers.push("Capture current tables, columns, foreign keys, indexes, RLS policies, functions and triggers.");
  }

  if (!check.mappingApproved) {
    blockers.push("Approve the canonical schema mapping before Stage 2 migrations.");
  }

  if (!check.tenantBoundaryDefined) {
    blockers.push("Define tenant_id expectations for tenant-owned operational tables.");
  }

  if (!check.blockedNamesReviewed) {
    blockers.push("Review blocked legacy table names before adding new schema.");
  }

  if (!check.stage2MigrationOrderDefined) {
    blockers.push("Define the ordered Stage 2 foundation migration list.");
  }

  if (!check.foundationTestsDefined) {
    blockers.push("Define foundation tenant-isolation, child-privacy and audit tests.");
  }

  return {
    readyForStage2: blockers.length === 0,
    blockers,
  };
}
