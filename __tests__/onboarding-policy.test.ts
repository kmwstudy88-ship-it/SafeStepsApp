import {
  defaultParentAccessibilityPreferences,
  getParentOnboardingResumeRoute,
  getPinValidationError,
  normaliseParentAccessibilityPreferences,
} from "../lib/engines/onboardingPolicy";

describe("parent onboarding policy", () => {
  test("resumes each incomplete onboarding stage", () => {
    expect(getParentOnboardingResumeRoute("not_started")).toBe(
      "/onboarding/protect-account",
    );
    expect(getParentOnboardingResumeRoute("account_protected")).toBe(
      "/onboarding/consent-information-sharing",
    );
    expect(getParentOnboardingResumeRoute("consent_recorded")).toBe(
      "/onboarding/accessibility-preferences",
    );
    expect(getParentOnboardingResumeRoute("intake_in_progress")).toBe("/intake");
    expect(getParentOnboardingResumeRoute("onboarding_complete")).toBe("/dashboard");
  });

  test("does not let an unknown status bypass onboarding", () => {
    expect(getParentOnboardingResumeRoute("unexpected")).toBe(
      "/onboarding/protect-account",
    );
  });

  test("requires a matching six-digit PIN", () => {
    expect(getPinValidationError("123", "123")).toBe("Enter a 6-digit PIN.");
    expect(getPinValidationError("123456", "654321")).toBe("The PINs do not match.");
    expect(getPinValidationError("123456", "123456")).toBeNull();
  });

  test("normalises saved accessibility values", () => {
    expect(normaliseParentAccessibilityPreferences(null)).toEqual(
      defaultParentAccessibilityPreferences,
    );
    expect(
      normaliseParentAccessibilityPreferences({
        textSize: "large",
        highContrast: true,
        unknown: true,
      }),
    ).toEqual({
      ...defaultParentAccessibilityPreferences,
      textSize: "large",
      highContrast: true,
    });
  });
});
