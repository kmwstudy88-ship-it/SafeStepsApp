import { Text, View } from "react-native";

import {
  NatureScene,
  OnboardingShell,
  PrimaryButton,
  SecondaryButton,
  TextButton,
  onboardingColors,
} from "../components/SafeStepsOnboardingUI";

export default function WelcomeScreen() {
  return (
    <OnboardingShell step={1}>
      <View style={{ alignItems: "center", gap: 8 }}>
        <Text style={{ color: onboardingColors.tealDark, fontSize: 34, fontWeight: "900", textAlign: "center" }}>
          Welcome to SafeSteps
        </Text>
        <Text style={{ color: onboardingColors.ink, fontSize: 16, lineHeight: 23, textAlign: "center" }}>
          {"Support and tools for every step of your family's journey."}
        </Text>
      </View>
      <NatureScene />
      <View style={{ gap: 12 }}>
        <PrimaryButton label="Get Started" href="/onboarding/how-safesteps-works" />
        <SecondaryButton label="Sign In" href="/login" />
        <TextButton label="Explore SafeSteps" href="/dashboard" />
      </View>
    </OnboardingShell>
  );
}
