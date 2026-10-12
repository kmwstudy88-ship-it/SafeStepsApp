import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import {
  InfoRow,
  OnboardingShell,
  PreferenceRow,
  PrimaryButton,
  TextButton,
  onboardingColors,
} from "../../components/SafeStepsOnboardingUI";
import { recordParentOnboardingConsent } from "../../lib/engines/onboardingEngine";

export default function ConsentInformationSharingScreen() {
  const [privacyNoticeRead, setPrivacyNoticeRead] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [shareProgress, setShareProgress] = useState(false);
  const [includeEvidence, setIncludeEvidence] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const canContinue = privacyNoticeRead && termsAccepted;

  async function handleContinue() {
    if (!canContinue || saving) return;

    setSaving(true);
    setError("");

    try {
      await recordParentOnboardingConsent({
        privacyNoticeRead,
        termsAccepted,
        shareProgressWithAssignedWorkers: shareProgress,
        includeChosenEvidenceInSharedReports: includeEvidence,
      });
      router.replace("/onboarding/accessibility-preferences");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not record your consent choices.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingShell step={7} totalSteps={8}>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Text
          style={{
            color: onboardingColors.tealDark,
            fontSize: 27,
            fontWeight: "900",
            textAlign: "center",
          }}
        >
          Consent & Information Sharing
        </Text>
        <Text
          style={{
            color: onboardingColors.ink,
            fontSize: 15,
            lineHeight: 21,
            textAlign: "center",
          }}
        >
          Required acknowledgements and optional sharing choices are kept separate.
        </Text>
      </View>
      <View
        style={{
          borderColor: onboardingColors.border,
          borderRadius: 12,
          borderWidth: 1,
          overflow: "hidden",
        }}
      >
        <PreferenceRow
          icon="shield-checkmark-outline"
          label="Privacy notice read"
          detail="Required to continue"
          value={privacyNoticeRead}
          onValueChange={setPrivacyNoticeRead}
        />
        <PreferenceRow
          icon="document-text-outline"
          label="Accept Terms of Use"
          detail="Required to use SafeSteps"
          value={termsAccepted}
          onValueChange={setTermsAccepted}
        />
        <PreferenceRow
          icon="people-outline"
          label="Share learning progress"
          detail="Optional: assigned support workers only"
          value={shareProgress}
          onValueChange={setShareProgress}
        />
        <PreferenceRow
          icon="folder-open-outline"
          label="Include chosen evidence"
          detail="Optional: reports you choose to share"
          value={includeEvidence}
          onValueChange={setIncludeEvidence}
        />
      </View>
      <InfoRow
        icon="refresh-circle-outline"
        title="Optional choices can be changed"
        body="Future changes create a new consent event so SafeSteps keeps an accurate history."
        tone="sage"
      />
      {error ? (
        <Text style={{ color: "#9B2F1F", fontWeight: "800", lineHeight: 19 }}>
          {error}
        </Text>
      ) : null}
      {saving ? (
        <ActivityIndicator color={onboardingColors.teal} />
      ) : (
        <PrimaryButton
          label="Record Choices & Continue"
          onPress={handleContinue}
          disabled={!canContinue}
        />
      )}
      <TextButton label="Back to Account Protection" href="/onboarding/protect-account" />
    </OnboardingShell>
  );
}
