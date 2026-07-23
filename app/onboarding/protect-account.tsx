import { useState } from "react";
import { Text, View } from "react-native";

import {
  InfoRow,
  OnboardingShell,
  PreferenceRow,
  PrimaryButton,
  onboardingColors,
} from "../../components/SafeStepsOnboardingUI";

export default function ProtectAccountScreen() {
  const [biometrics, setBiometrics] = useState(true);
  const [notificationPrivacy, setNotificationPrivacy] = useState(true);

  return (
    <OnboardingShell step={6}>
      <View style={{ alignItems: "center", gap: 5 }}>
        <Text style={{ color: onboardingColors.tealDark, fontSize: 28, fontWeight: "900", textAlign: "center" }}>
          Protect Your Account
        </Text>
        <Text style={{ color: onboardingColors.ink, fontSize: 15, lineHeight: 21, textAlign: "center" }}>
          Keep your account safe with a PIN and privacy settings.
        </Text>
      </View>
      <Text style={{ color: onboardingColors.ink, fontSize: 14, fontWeight: "900" }}>Create a 6-digit PIN</Text>
      <View style={{ flexDirection: "row", gap: 9, justifyContent: "center" }}>
        {Array.from({ length: 6 }, (_, index) => (
          <View
            key={index}
            style={{
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.82)",
              borderColor: onboardingColors.gold,
              borderRadius: 10,
              borderWidth: 1,
              height: 54,
              justifyContent: "center",
              width: 44,
            }}
          >
            {index < 5 ? <View style={{ backgroundColor: onboardingColors.teal, borderRadius: 999, height: 9, width: 9 }} /> : null}
          </View>
        ))}
      </View>
      <View style={{ borderColor: onboardingColors.border, borderRadius: 12, borderWidth: 1, overflow: "hidden" }}>
        <PreferenceRow icon="finger-print-outline" label="Use Biometrics" detail="Fingerprint or face" value={biometrics} onValueChange={setBiometrics} />
        <PreferenceRow
          icon="lock-closed-outline"
          label="Notification Privacy"
          detail="Hide sensitive content"
          value={notificationPrivacy}
          onValueChange={setNotificationPrivacy}
        />
      </View>
      <InfoRow icon="lock-closed-outline" title="You can change this anytime" body="PIN, biometric and notification choices stay available in Settings." tone="sage" />
      <PrimaryButton label="Continue" href="/onboarding/accessibility-preferences" />
    </OnboardingShell>
  );
}
