import { supabase } from "../supabase";

export type WhiteLabelMultiTenantStatus = "implemented" | "requires_configuration" | "requires_review";

export type WhiteLabelMultiTenantPlatform = {
  id: "white_label_multi_tenant_platform";
  title: string;
  purpose: string;
  status: WhiteLabelMultiTenantStatus;
  modules: string[];
  tables: string[];
  runtimeGates: string[];
};

export type TenantFeatureActivationCheck = {
  featureExists?: boolean;
  licenseAllowsFeature?: boolean;
  governanceApproved?: boolean;
  safetyCritical?: boolean;
  childPrivacyCritical?: boolean;
  enablingFeature?: boolean;
  childPrivacyProtected?: boolean;
};

export type TenantDataExportCheck = {
  purposeRecorded?: boolean;
  approvalRecorded?: boolean;
  tenantScopeVerified?: boolean;
  legalBasisRecorded?: boolean;
  retentionBasisRecorded?: boolean;
  includesChildContent?: boolean;
  childPrivacyApprovalRecorded?: boolean;
  secureDeliveryConfigured?: boolean;
};

export type TenantDeletionReadinessCheck = {
  retentionReviewCompleted?: boolean;
  legalHoldActive?: boolean;
  exportOrArchiveCompleted?: boolean;
  approvalRecorded?: boolean;
  safetyRecordPreservationPlan?: boolean;
};

export type TenantBrandingReadinessCheck = {
  accessibleTheme?: boolean;
  safetyMessagingPreserved?: boolean;
  childExperienceReviewed?: boolean;
  culturalReviewCompleted?: boolean;
  supportContactConfigured?: boolean;
};

export const whiteLabelMultiTenantPlatform: WhiteLabelMultiTenantPlatform = {
  id: "white_label_multi_tenant_platform",
  title: "White-Label and Multi-Tenant Platform",
  purpose:
    "Provides SafeSteps enterprise tenancy, data-isolation registry, tenant organisations, memberships, domains, environments, branding, themes, jurisdiction packs, language and cultural packs, feature flags, licensing, tenant storage, retention, export, termination, integrations, deployment, operational monitoring, compliance attestations and tenant audit.",
  status: "implemented",
  modules: [
    "tenant_registry",
    "tenant_domains",
    "tenant_environments",
    "tenant_organisations",
    "tenant_memberships",
    "tenant_roles",
    "tenant_permission_grants",
    "data_isolation_registry",
    "cross_tenant_sharing",
    "jurisdiction_packs",
    "regional_configuration",
    "branding_profiles",
    "themes",
    "language_packs",
    "cultural_packs",
    "terminology_packs",
    "feature_catalogue",
    "feature_flags",
    "configuration_schemas",
    "workflow_templates",
    "form_templates",
    "report_templates",
    "licensing",
    "billing_events",
    "tenant_storage",
    "retention",
    "tenant_exports",
    "tenant_termination",
    "integrations",
    "api_credentials",
    "deployments",
    "operational_status",
    "compliance_attestations",
    "audit",
  ],
  tables: [
    "platform_tenants",
    "platform_tenant_domains",
    "platform_tenant_environments",
    "platform_tenant_organisations",
    "platform_tenant_memberships",
    "platform_tenant_role_definitions",
    "platform_tenant_permission_grants",
    "platform_tenant_data_registry",
    "platform_cross_tenant_sharing_agreements",
    "platform_cross_tenant_access_grants",
    "platform_jurisdiction_packs",
    "platform_tenant_jurisdiction_assignments",
    "platform_regional_configurations",
    "platform_branding_profiles",
    "platform_theme_definitions",
    "platform_tenant_theme_assignments",
    "platform_language_packs",
    "platform_tenant_language_assignments",
    "platform_cultural_content_packs",
    "platform_tenant_cultural_pack_assignments",
    "platform_terminology_packs",
    "platform_feature_definitions",
    "platform_tenant_license_plans",
    "platform_tenant_subscriptions",
    "platform_tenant_feature_flags",
    "platform_feature_rollout_cohorts",
    "platform_configuration_schemas",
    "platform_tenant_configurations",
    "platform_tenant_workflow_templates",
    "platform_tenant_form_templates",
    "platform_tenant_report_templates",
    "platform_billing_events",
    "platform_tenant_storage_policies",
    "platform_tenant_data_retention_policies",
    "platform_tenant_export_requests",
    "platform_tenant_deletion_requests",
    "platform_tenant_integration_endpoints",
    "platform_tenant_api_credentials",
    "platform_tenant_deployment_releases",
    "platform_tenant_operational_status_events",
    "platform_tenant_compliance_attestations",
    "platform_tenant_audit_events",
  ],
  runtimeGates: [
    "Tenant configuration never grants automatic case-content or child-record access.",
    "Cross-tenant sharing requires a scoped agreement, lawful basis and explicit authority.",
    "Branding and theme settings cannot weaken safety messaging, accessibility or child privacy.",
    "Safety-critical and child-privacy-critical features cannot be disabled by ordinary tenant controls.",
    "Billing or licence status must not silently remove safety-critical access.",
    "Tenant exports require approval, legal basis, retention basis, tenant-scope verification and child-privacy approval when child content is included.",
    "Tenant termination requires retention review, no active legal hold, export or archival completion, approval and a safety-record preservation plan.",
    "API credentials must be scoped and revocable.",
    "Jurisdiction, language, cultural and terminology packs are versioned and auditable.",
    "Tenant deployments require rollback-aware release records and operational status monitoring.",
  ],
};

export function evaluateTenantFeatureActivation(check: TenantFeatureActivationCheck) {
  const blockers: string[] = [];

  if (!check.featureExists) {
    blockers.push("Feature must exist in the tenant feature catalogue.");
  }

  if (!check.licenseAllowsFeature) {
    blockers.push("Tenant licence does not allow this feature.");
  }

  if (!check.governanceApproved) {
    blockers.push("Feature override requires governance approval.");
  }

  if ((check.safetyCritical || check.childPrivacyCritical) && check.enablingFeature === false) {
    blockers.push("Safety-critical and child-privacy-critical features cannot be disabled by tenant configuration.");
  }

  if (!check.childPrivacyProtected) {
    blockers.push("Child privacy controls must remain active across every tenant.");
  }

  return {
    ready: blockers.length === 0,
    blockers,
  };
}

export function evaluateTenantDataExportReadiness(check: TenantDataExportCheck) {
  const blockers: string[] = [];

  if (!check.purposeRecorded) {
    blockers.push("Tenant export needs a recorded purpose.");
  }

  if (!check.approvalRecorded) {
    blockers.push("Tenant export needs an approval record.");
  }

  if (!check.tenantScopeVerified) {
    blockers.push("Tenant export must be verified as tenant-scoped.");
  }

  if (!check.legalBasisRecorded) {
    blockers.push("Tenant export needs a legal basis.");
  }

  if (!check.retentionBasisRecorded) {
    blockers.push("Tenant export needs a retention basis.");
  }

  if (check.includesChildContent && !check.childPrivacyApprovalRecorded) {
    blockers.push("Exports containing child content require child-privacy approval.");
  }

  if (!check.secureDeliveryConfigured) {
    blockers.push("Tenant export requires secure delivery configuration.");
  }

  return {
    ready: blockers.length === 0,
    blockers,
  };
}

export function evaluateTenantDeletionReadiness(check: TenantDeletionReadinessCheck) {
  const blockers: string[] = [];

  if (!check.retentionReviewCompleted) {
    blockers.push("Tenant deletion requires completed retention review.");
  }

  if (check.legalHoldActive) {
    blockers.push("Tenant deletion cannot proceed while a legal hold is active.");
  }

  if (!check.exportOrArchiveCompleted) {
    blockers.push("Tenant deletion requires completed export or archival.");
  }

  if (!check.approvalRecorded) {
    blockers.push("Tenant deletion requires approval.");
  }

  if (!check.safetyRecordPreservationPlan) {
    blockers.push("Tenant deletion requires a safety-record preservation plan.");
  }

  return {
    ready: blockers.length === 0,
    blockers,
  };
}

export function evaluateTenantBrandingReadiness(check: TenantBrandingReadinessCheck) {
  const blockers: string[] = [];

  if (!check.accessibleTheme) {
    blockers.push("Tenant branding requires an accessibility-validated theme.");
  }

  if (!check.safetyMessagingPreserved) {
    blockers.push("Tenant branding must preserve SafeSteps safety messaging.");
  }

  if (!check.childExperienceReviewed) {
    blockers.push("Child-facing branding requires child-experience review.");
  }

  if (!check.culturalReviewCompleted) {
    blockers.push("Tenant branding requires cultural review before release.");
  }

  if (!check.supportContactConfigured) {
    blockers.push("Tenant branding requires visible support contact configuration.");
  }

  return {
    ready: blockers.length === 0,
    blockers,
  };
}

export function getWhiteLabelMultiTenantReadinessSummary() {
  return {
    implemented: whiteLabelMultiTenantPlatform.status === "implemented" ? 1 : 0,
    total: 1,
    tableCount: whiteLabelMultiTenantPlatform.tables.length,
    moduleCount: whiteLabelMultiTenantPlatform.modules.length,
    runtimeGateCount: whiteLabelMultiTenantPlatform.runtimeGates.length,
    readyForRuntimeIntegration: whiteLabelMultiTenantPlatform.status === "implemented",
  };
}

export async function getWhiteLabelMultiTenantLiveSummary() {
  const [tenantsResult, featuresResult, exportsResult, auditResult] = await Promise.all([
    supabase.from("platform_tenants").select("id", { count: "exact", head: true }),
    supabase.from("platform_tenant_feature_flags").select("id", { count: "exact", head: true }),
    supabase.from("platform_tenant_export_requests").select("id", { count: "exact", head: true }),
    supabase.from("platform_tenant_audit_events").select("id", { count: "exact", head: true }),
  ]);

  if (tenantsResult.error || featuresResult.error || exportsResult.error || auditResult.error) {
    throw tenantsResult.error ?? featuresResult.error ?? exportsResult.error ?? auditResult.error;
  }

  return {
    tenants: tenantsResult.count ?? 0,
    featureFlags: featuresResult.count ?? 0,
    exportRequests: exportsResult.count ?? 0,
    auditEvents: auditResult.count ?? 0,
  };
}
