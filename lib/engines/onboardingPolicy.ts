export type ParentOnboardingStatus =
  | "not_started"
  | "account_protected"
  | "consent_recorded"
  | "intake_in_progress"
  | "onboarding_complete";

export type ParentOnboardingRoute =
  | "/onboarding/protect-account"
  | "/onboarding/consent-information-sharing"
  | "/onboarding/accessibility-preferences"
  | "/intake"
  | "/dashboard";

export type ParentAccessibilityPreferences = {
  textSize: "small" | "medium" | "large";
  highContrast: boolean;
  reducedMotion: boolean;
  readAloud: boolean;
  captions: boolean;
  simpleLanguage: boolean;
};

export const defaultParentAccessibilityPreferences: ParentAccessibilityPreferences = {
  textSize: "medium",
  highContrast: false,
  reducedMotion: false,
  readAloud: false,
  captions: false,
  simpleLanguage: false,
};

export function normaliseParentOnboardingStatus(value: unknown): ParentOnboardingStatus {
  switch (value) {
    case "account_protected":
    case "consent_recorded":
    case "intake_in_progress":
    case "onboarding_complete":
      return value;
    default:
      return "not_started";
  }
}

export function getParentOnboardingResumeRoute(value: unknown): ParentOnboardingRoute {
  switch (normaliseParentOnboardingStatus(value)) {
    case "account_protected":
      return "/onboarding/consent-information-sharing";
    case "consent_recorded":
      return "/onboarding/accessibility-preferences";
    case "intake_in_progress":
      return "/intake";
    case "onboarding_complete":
      return "/dashboard";
    default:
      return "/onboarding/protect-account";
  }
}

export function getPinValidationError(pin: string, confirmation: string) {
  if (!/^\d{6}$/.test(pin)) {
    return "Enter a 6-digit PIN.";
  }

  if (pin !== confirmation) {
    return "The PINs do not match.";
  }

  return null;
}

export function normaliseParentAccessibilityPreferences(
  value: unknown,
): ParentAccessibilityPreferences {
  const input =
    value && typeof value === "object"
      ? (value as Partial<ParentAccessibilityPreferences>)
      : {};
  const textSize =
    input.textSize === "small" || input.textSize === "large" ? input.textSize : "medium";

  return {
    textSize,
    highContrast: input.highContrast === true,
    reducedMotion: input.reducedMotion === true,
    readAloud: input.readAloud === true,
    captions: input.captions === true,
    simpleLanguage: input.simpleLanguage === true,
  };
}
