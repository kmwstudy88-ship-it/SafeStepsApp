import type { FamilyBridgeTriageResult } from "./familyBridgeClinicalEngine";
import type { SupportGuideDomain } from "./supportGuideEngine";

export type SupportRegion = "australia" | "queensland" | "northern_territory";

export type SupportReferral = {
  id: string;
  label: string;
  phone: string;
  dialTarget: string;
  detail: string;
  availability: string;
  regions: SupportRegion[];
  domains: SupportGuideDomain[];
  urgent?: boolean;
  safetyNote?: string;
  website?: string;
};

const allDomains: SupportGuideDomain[] = [
  "parenting",
  "child_psychology",
  "family_violence",
  "substance_use",
  "mental_health",
];

export const supportReferralDirectory: SupportReferral[] = [
  {
    id: "emergency",
    label: "Triple Zero",
    phone: "000",
    dialTarget: "tel:000",
    detail: "Police, ambulance or fire for immediate danger",
    availability: "24 hours a day, 7 days a week",
    regions: ["australia", "queensland", "northern_territory"],
    domains: allDomains,
    urgent: true,
  },
  {
    id: "lifeline",
    label: "Lifeline",
    phone: "13 11 14",
    dialTarget: "tel:131114",
    detail: "Crisis support and suicide prevention",
    availability: "24 hours a day, 7 days a week",
    regions: ["australia", "queensland", "northern_territory"],
    domains: ["mental_health", "parenting", "child_psychology", "substance_use"],
    website: "https://www.lifeline.org.au/",
  },
  {
    id: "respect",
    label: "1800RESPECT",
    phone: "1800 737 732",
    dialTarget: "tel:1800737732",
    detail: "Domestic, family and sexual violence counselling",
    availability: "24 hours a day, 7 days a week",
    regions: ["australia", "queensland", "northern_territory"],
    domains: ["family_violence"],
    safetyNote: "Calls may appear on an itemised phone bill. Use a safer device if needed.",
    website: "https://www.1800respect.org.au/",
  },
  {
    id: "aod_hotline",
    label: "Alcohol & Drug Hotline",
    phone: "1800 250 015",
    dialTarget: "tel:1800250015",
    detail: "Free, confidential alcohol and other drug information and support",
    availability: "24 hours a day, 7 days a week in most locations",
    regions: ["australia", "queensland", "northern_territory"],
    domains: ["substance_use"],
    website: "https://www.health.gov.au/contacts/national-alcohol-and-other-drug-hotline",
  },
  {
    id: "parentline",
    label: "Parentline QLD & NT",
    phone: "1300 30 1300",
    dialTarget: "tel:1300301300",
    detail: "Professional counselling and support for parents and carers",
    availability: "8am–10pm, 7 days a week",
    regions: ["queensland", "northern_territory"],
    domains: ["parenting", "child_psychology", "mental_health"],
    website: "https://parentline.com.au/",
  },
];

export function getSupportGuideReferrals(
  domain: SupportGuideDomain,
  region: SupportRegion,
  triage?: FamilyBridgeTriageResult | null,
): SupportReferral[] {
  const urgent = triage?.assignedRiskLevel === "LEVEL_4";
  const relevant = supportReferralDirectory.filter((service) =>
    service.regions.includes(region) && (service.domains.includes(domain) || (urgent && service.urgent)),
  );

  return relevant.sort((left, right) => {
    if (urgent && Boolean(left.urgent) !== Boolean(right.urgent)) return left.urgent ? -1 : 1;
    if (left.domains.includes(domain) !== right.domains.includes(domain)) return left.domains.includes(domain) ? -1 : 1;
    return left.label.localeCompare(right.label);
  });
}
