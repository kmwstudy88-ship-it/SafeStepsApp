export type ContentSafetyTier = 1 | 2 | 3;
export interface LocalizedString { locale: string; text: string; reviewedBy?: string; reviewedAt?: string }
export interface LocalizedFlowCopy { flowId: string; key: string; tier: ContentSafetyTier; values: LocalizedString[] }
export interface LocaleProfile { locale: string; rtl?: boolean; readingLevel?: string; dateFormat?: string; phoneFormat?: string; referralJurisdictions?: string[] }

export const INITIAL_LOCALES = ["en", "ar", "zh-Hans", "zh-Hant", "vi", "hi", "es", "pa", "fa", "prs"] as const;

export function canPublishLocalizedCopy(input: { tier: ContentSafetyTier; nativeReview: boolean; safeguardingReview: boolean; specialistReview: boolean; overflowTest: boolean; referralReview: boolean }) {
  const blockers: string[] = [];
  if (!input.nativeReview) blockers.push("Native-language review is required");
  if (!input.safeguardingReview) blockers.push("Safeguarding review is required");
  if (!input.overflowTest) blockers.push("UI overflow and text-scaling test is required");
  if (input.tier === 3 && !input.specialistReview) blockers.push("Crisis/DV specialist review is required");
  if (input.tier === 3 && !input.referralReview) blockers.push("Locale referral and crisis-contact review is required");
  return { allowed: blockers.length === 0, blockers };
}

export const ACCESSIBILITY_RELEASE_CHECKS = [
  "Keyboard-only navigation", "Screen-reader critical-alert announcement", "200% text scaling",
  "Large touch targets", "High contrast without color-only meaning", "Reduced motion",
  "One question at a time", "Quick exit remains discoverable", "RTL layout where enabled",
] as const;
