import { supabase } from "../supabase";

export type CommunityServicesPlatformStatus = "implemented" | "requires_configuration" | "requires_review";

export type CommunityServicesPlatform = {
  id: "community_services_platform";
  title: string;
  purpose: string;
  status: CommunityServicesPlatformStatus;
  modules: string[];
  tables: string[];
  runtimeGates: string[];
};

export type CommunityReferralSendCheck = {
  hasNeedSummary?: boolean;
  consentRecorded?: boolean;
  minimumNecessaryInformationOnly?: boolean;
  serviceActive?: boolean;
  safetySensitive?: boolean;
  protectedContactConfigured?: boolean;
};

export type CommunityReferralClosureCheck = {
  accessConfirmed?: boolean;
  needAddressed?: boolean;
  familyViewRecorded?: boolean;
  openBarriers?: boolean;
};

export type CommunityServiceMatchCheck = {
  eligibilityKnown?: boolean;
  suitabilityExplained?: boolean;
  capacityKnown?: boolean;
  alternativesOffered?: boolean;
  barrierWarningsRecorded?: boolean;
};

export const communityServicesPlatform: CommunityServicesPlatform = {
  id: "community_services_platform",
  title: "Community and Services Platform",
  purpose:
    "Provides SafeSteps service navigation for providers, categories, locations, capacity, eligibility, suitability, search, matching, consent, referrals, waitlists, bookings, attendance, barriers, outcomes, alternatives, resource guides, feedback, and service-access audit.",
  status: "implemented",
  modules: [
    "service_categories",
    "service_providers",
    "provider_contacts",
    "provider_locations",
    "service_definitions",
    "delivery_sites",
    "eligibility_rules",
    "suitability_rules",
    "capacity_snapshots",
    "information_reviews",
    "service_search",
    "service_matching",
    "referral_consent",
    "referrals",
    "waitlists",
    "bookings",
    "engagement_events",
    "barrier_tracking",
    "outcomes",
    "alternatives",
    "resource_guides",
    "feedback",
    "audit",
  ],
  tables: [
    "community_service_categories",
    "community_service_providers",
    "community_provider_contacts",
    "community_provider_locations",
    "community_services",
    "community_service_delivery_sites",
    "community_service_eligibility_rules",
    "community_service_suitability_rules",
    "community_service_capacity_snapshots",
    "community_service_information_reviews",
    "community_service_search_requests",
    "community_service_match_results",
    "community_service_referrals",
    "community_referral_consents",
    "community_referral_waitlist_records",
    "community_referral_bookings",
    "community_referral_engagement_events",
    "community_referral_barriers",
    "community_referral_outcomes",
    "community_service_alternatives",
    "community_resource_guides",
    "community_service_feedback",
    "community_service_audit_events",
  ],
  runtimeGates: [
    "Referral sending requires consent or a documented no-consent-required basis.",
    "Safety-sensitive referrals require protected contact configuration.",
    "Providers receive only minimum necessary information.",
    "Referral closure requires service access, need-addressed status, and the family view.",
    "Open service barriers prevent referral closure.",
    "Waitlists and capacity must be visible before matching is treated as actionable.",
    "Non-attendance must include context and must not be treated as family failure by default.",
    "Provider feedback remains separate from verified fact.",
  ],
};

export function evaluateCommunityReferralSendReadiness(check: CommunityReferralSendCheck) {
  const blockers: string[] = [];

  if (!check.hasNeedSummary) {
    blockers.push("Referral needs a clear need summary.");
  }

  if (!check.consentRecorded) {
    blockers.push("Referral needs consent or a documented no-consent-required basis.");
  }

  if (!check.minimumNecessaryInformationOnly) {
    blockers.push("Referral information must be minimum necessary.");
  }

  if (!check.serviceActive) {
    blockers.push("Selected service must be active before referral is sent.");
  }

  if (check.safetySensitive && !check.protectedContactConfigured) {
    blockers.push("Safety-sensitive referrals require protected contact configuration.");
  }

  return {
    ready: blockers.length === 0,
    blockers,
  };
}

export function evaluateCommunityReferralClosure(check: CommunityReferralClosureCheck) {
  const blockers: string[] = [];

  if (!check.accessConfirmed) {
    blockers.push("Service access must be confirmed before referral closure.");
  }

  if (!check.needAddressed) {
    blockers.push("The relevant need must be addressed or an alternative plan recorded.");
  }

  if (!check.familyViewRecorded) {
    blockers.push("Family view must be recorded before closure.");
  }

  if (check.openBarriers) {
    blockers.push("Open access barriers must be resolved or transferred before closure.");
  }

  return {
    ready: blockers.length === 0,
    blockers,
  };
}

export function evaluateCommunityServiceMatch(check: CommunityServiceMatchCheck) {
  const warnings: string[] = [];

  if (!check.eligibilityKnown) {
    warnings.push("Eligibility is unknown.");
  }

  if (!check.suitabilityExplained) {
    warnings.push("Suitability explanation is missing.");
  }

  if (!check.capacityKnown) {
    warnings.push("Capacity or waitlist status is unknown.");
  }

  if (!check.alternativesOffered) {
    warnings.push("Alternatives should be offered when access is uncertain.");
  }

  if (!check.barrierWarningsRecorded) {
    warnings.push("Transport, cost, accessibility, language, safety, or cultural barriers should be recorded.");
  }

  return {
    actionable: warnings.length === 0,
    warnings,
  };
}

export function getCommunityServicesReadinessSummary() {
  return {
    implemented: communityServicesPlatform.status === "implemented" ? 1 : 0,
    total: 1,
    tableCount: communityServicesPlatform.tables.length,
    moduleCount: communityServicesPlatform.modules.length,
    runtimeGateCount: communityServicesPlatform.runtimeGates.length,
    readyForRuntimeIntegration: communityServicesPlatform.status === "implemented",
  };
}

export async function getCommunityServicesLiveSummary() {
  const [servicesResult, referralsResult, barriersResult] = await Promise.all([
    supabase.from("community_services").select("id", { count: "exact", head: true }),
    supabase.from("community_service_referrals").select("id", { count: "exact", head: true }),
    supabase.from("community_referral_barriers").select("id", { count: "exact", head: true }),
  ]);

  if (servicesResult.error || referralsResult.error || barriersResult.error) {
    throw servicesResult.error ?? referralsResult.error ?? barriersResult.error;
  }

  return {
    services: servicesResult.count ?? 0,
    referrals: referralsResult.count ?? 0,
    barriers: barriersResult.count ?? 0,
  };
}
