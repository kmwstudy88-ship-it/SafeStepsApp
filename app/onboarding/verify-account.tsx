import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";

import {
  NatureScene,
  OnboardingShell,
  PrimaryButton,
  TextButton,
  onboardingColors,
} from "../../components/SafeStepsOnboardingUI";

export default function VerifyAccountScreen() {
  const params = useLocalSearchParams<{ contact?: string }>();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const contact = params.contact ?? "hello@example.com";
  const complete = useMemo(() => code.every((digit) => digit.length === 1), [code]);

  function updateCode(value: string, index: number) {
    const next = [...code];
    next[index] = value.replace(/\D/g, "").slice(-1);
    setCode(next);
  }

  return (
    <OnboardingShell step={5}>
      <View style={{ alignItems: "center", gap: 5 }}>
        <Text style={{ color: onboardingColors.tealDark, fontSize: 29, fontWeight: "900", textAlign: "center" }}>
          Verify Your Account
        </Text>
        <Text style={{ color: onboardingColors.ink, fontSize: 15, lineHeight: 21, textAlign: "center" }}>
          Enter the 6-digit code we sent to {contact}
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 8, justifyContent: "center" }}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            value={digit}
            onChangeText={(value) => updateCode(value, index)}
            keyboardType="number-pad"
            maxLength={1}
            style={{
              backgroundColor: "rgba(255,255,255,0.86)",
              borderColor: index === 0 && !digit ? onboardingColors.gold : "#D8CFBA",
              borderRadius: 10,
              borderWidth: 1.5,
              color: onboardingColors.tealDark,
              fontSize: 24,
              fontWeight: "900",
              height: 54,
              textAlign: "center",
              width: 45,
            }}
          />
        ))}
      </View>
      <Text selectable style={{ color: onboardingColors.ink, fontSize: 13, lineHeight: 18, textAlign: "center" }}>
        {"Didn't receive a code? Resend in 00:45"}
      </Text>
      <NatureScene compact />
      <PrimaryButton label="Continue" href="/onboarding/protect-account" disabled={!complete} />
      <TextButton label="Change Email" href="/register" />
    </OnboardingShell>
  );
}
