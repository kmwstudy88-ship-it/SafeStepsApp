import { Text, View } from "react-native";

import {
  FeatureTile,
  OnboardingShell,
  PrimaryButton,
  onboardingColors,
} from "../../components/SafeStepsOnboardingUI";

export default function HowSafeStepsWorksScreen() {
  return (
    <OnboardingShell step={2}>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Text style={{ color: onboardingColors.tealDark, fontSize: 28, fontWeight: "900", textAlign: "center" }}>
          How SafeSteps Works
        </Text>
        <Text style={{ color: onboardingColors.ink, fontSize: 15, lineHeight: 21, textAlign: "center" }}>
          Four simple ways we support you and your family.
        </Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <FeatureTile icon="book-outline" title="Learn" body="Discover helpful articles and guides." tone="sage" />
        <FeatureTile icon="heart-circle-outline" title="Practise" body="Try activities that build skills together." tone="coral" />
        <FeatureTile icon="leaf-outline" title="Reflect" body="Pause, check in and understand what matters." tone="sage" />
        <FeatureTile icon="bar-chart-outline" title="Show Progress" body="Track wins and celebrate growth as a family." tone="teal" />
      </View>
      <PrimaryButton label="Continue" href="/onboarding/privacy-parent-rights" />
    </OnboardingShell>
  );
}
