import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import {
  BrandMark,
  NatureScene,
  OnboardingShell,
  PrimaryButton,
  onboardingColors,
  onboardingStyles,
} from "../components/SafeStepsOnboardingUI";
import { getCurrentSession } from "../lib/engines/authEngine";

export default function AppEntryScreen() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const session = await getCurrentSession();
        if (active) setSignedIn(session !== null);
      } catch {
        if (active) setSignedIn(false);
      } finally {
        if (active) setLoading(false);
      }
    }

    checkSession();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
        <ActivityIndicator color={onboardingColors.teal} />
        <Text style={{ color: onboardingColors.tealDark, fontWeight: "800" }}>Loading SafeSteps...</Text>
      </View>
    );
  }

  if (signedIn) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <OnboardingShell compact>
      <View style={{ gap: 12, alignItems: "center" }}>
        <BrandMark large />
        <Text style={{ color: onboardingColors.tealDark, fontSize: 18, fontWeight: "800", textAlign: "center" }}>
          Small steps. Real change.
        </Text>
        <Text style={{ color: onboardingColors.tealDark, fontSize: 18, fontWeight: "800", textAlign: "center" }}>
          Stronger families.
        </Text>
      </View>
      <NatureScene />
      <View style={{ gap: 10 }}>
        <PrimaryButton label="Continue" href="/welcome" />
      </View>
      <Text selectable style={[onboardingStyles.featureBody, { color: onboardingColors.muted }]}>
        Support and tools for every step of your family journey.
      </Text>
    </OnboardingShell>
  );
}
