import { useState } from "react";
import { Text, View } from "react-native";

import {
  NatureScene,
  OnboardingShell,
  PreferenceRow,
  PrimaryButton,
  onboardingColors,
} from "../../components/SafeStepsOnboardingUI";

export default function AccessibilityPreferencesScreen() {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [readAloud, setReadAloud] = useState(false);
  const [captions, setCaptions] = useState(false);
  const [simpleLanguage, setSimpleLanguage] = useState(false);

  return (
    <OnboardingShell step={6}>
      <View style={{ alignItems: "center", gap: 5 }}>
        <Text style={{ color: onboardingColors.tealDark, fontSize: 26, fontWeight: "900", textAlign: "center" }}>
          Accessibility Preferences
        </Text>
        <Text style={{ color: onboardingColors.ink, fontSize: 15, lineHeight: 21, textAlign: "center" }}>
          Personalise SafeSteps to work best for you.
        </Text>
      </View>
      <View style={{ borderColor: onboardingColors.border, borderRadius: 12, borderWidth: 1, overflow: "hidden" }}>
        <PreferenceRow icon="text-outline" label="Text Size" detail="Medium" />
        <PreferenceRow icon="contrast-outline" label="High Contrast" value={highContrast} onValueChange={setHighContrast} />
        <PreferenceRow icon="sync-outline" label="Reduced Motion" value={reducedMotion} onValueChange={setReducedMotion} />
        <PreferenceRow icon="volume-high-outline" label="Read Aloud" value={readAloud} onValueChange={setReadAloud} />
        <PreferenceRow icon="chatbox-ellipses-outline" label="Captions" value={captions} onValueChange={setCaptions} />
        <PreferenceRow icon="reader-outline" label="Simple Language" value={simpleLanguage} onValueChange={setSimpleLanguage} />
      </View>
      <View
        style={{
          alignSelf: "center",
          backgroundColor: "rgba(255,255,255,0.86)",
          borderColor: onboardingColors.border,
          borderRadius: 14,
          borderWidth: 1,
          gap: 8,
          padding: 12,
          width: "82%",
        }}
      >
        <Text style={{ color: onboardingColors.ink, fontSize: 14, fontWeight: "900", textAlign: "center" }}>Live Preview</Text>
        <NatureScene compact />
        <Text style={{ color: onboardingColors.ink, fontSize: 16, fontWeight: "900", textAlign: "center" }}>
          {"You're doing great one step at a time."}
        </Text>
      </View>
      <PrimaryButton label="Save Preferences" href="/dashboard" />
      <Text selectable style={{ color: onboardingColors.ink, fontSize: 13, lineHeight: 18, textAlign: "center" }}>
        You can update these anytime in Settings.
      </Text>
    </OnboardingShell>
  );
}
