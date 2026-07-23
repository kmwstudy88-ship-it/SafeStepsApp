import { Text, View } from "react-native";

import {
  InfoRow,
  OnboardingShell,
  PrimaryButton,
  onboardingColors,
} from "../../components/SafeStepsOnboardingUI";

export default function PrivacyParentRightsScreen() {
  return (
    <OnboardingShell step={3}>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Text style={{ color: onboardingColors.tealDark, fontSize: 27, fontWeight: "900", textAlign: "center" }}>
          Privacy & Parent Rights
        </Text>
        <Text style={{ color: onboardingColors.ink, fontSize: 15, lineHeight: 21, textAlign: "center" }}>
          {"Your privacy and your child's well-being come first."}
        </Text>
      </View>
      <View style={{ gap: 10 }}>
        <InfoRow icon="shield-checkmark" title="Your Data Stays Private" body="We use strong security to keep your information safe." tone="teal" />
        <InfoRow icon="person-circle" title="You're in Control" body="You choose what to share and can update it anytime." tone="sage" />
        <InfoRow icon="heart" title="Built for Families" body="SafeSteps is designed to support families with care and respect." tone="coral" />
      </View>
      <Text selectable style={{ color: onboardingColors.ink, fontSize: 13, lineHeight: 19, textAlign: "center" }}>
        By continuing, you agree to our Privacy Policy and Terms of Use.
      </Text>
      <PrimaryButton label="Continue" href="/register" />
    </OnboardingShell>
  );
}
