import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";

import {
  InfoRow,
  OnboardingShell,
  PreferenceRow,
  PrimaryButton,
  onboardingColors,
} from "../../components/SafeStepsOnboardingUI";
import { configureParentAccountProtection } from "../../lib/engines/onboardingEngine";
import { getPinValidationError } from "../../lib/engines/onboardingPolicy";

export default function ProtectAccountScreen() {
  const [pin, setPin] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [biometrics, setBiometrics] = useState(false);
  const [notificationPrivacy, setNotificationPrivacy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const pinError = getPinValidationError(pin, confirmation);

  async function handleContinue() {
    if (pinError || saving) return;

    setSaving(true);
    setError("");

    try {
      await configureParentAccountProtection({
        pin,
        preferBiometrics: biometrics,
        hideNotificationContent: notificationPrivacy,
      });
      setPin("");
      setConfirmation("");
      router.replace("/onboarding/consent-information-sharing");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save your account protection.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingShell step={6} totalSteps={8}>
      <View style={{ alignItems: "center", gap: 5 }}>
        <Text
          style={{
            color: onboardingColors.tealDark,
            fontSize: 28,
            fontWeight: "900",
            textAlign: "center",
          }}
        >
          Protect Your Account
        </Text>
        <Text
          style={{
            color: onboardingColors.ink,
            fontSize: 15,
            lineHeight: 21,
            textAlign: "center",
          }}
        >
          Create a device PIN. SafeSteps stores a protected PIN record on this device—not in
          your family or court records.
        </Text>
      </View>
      <View style={{ gap: 10 }}>
        <Text style={{ color: onboardingColors.ink, fontSize: 14, fontWeight: "900" }}>
          6-digit PIN
        </Text>
        <TextInput
          value={pin}
          onChangeText={(value) => setPin(value.replace(/\D/g, "").slice(0, 6))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          placeholder="Enter PIN"
          style={{
            backgroundColor: "rgba(255,255,255,0.86)",
            borderColor: onboardingColors.border,
            borderRadius: 10,
            borderWidth: 1,
            color: onboardingColors.tealDark,
            fontSize: 20,
            minHeight: 52,
            padding: 12,
          }}
        />
        <TextInput
          value={confirmation}
          onChangeText={(value) =>
            setConfirmation(value.replace(/\D/g, "").slice(0, 6))
          }
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          placeholder="Confirm PIN"
          style={{
            backgroundColor: "rgba(255,255,255,0.86)",
            borderColor: onboardingColors.border,
            borderRadius: 10,
            borderWidth: 1,
            color: onboardingColors.tealDark,
            fontSize: 20,
            minHeight: 52,
            padding: 12,
          }}
        />
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
          icon="finger-print-outline"
          label="Use Biometrics"
          detail="Fingerprint or face, when supported"
          value={biometrics}
          onValueChange={setBiometrics}
        />
        <PreferenceRow
          icon="lock-closed-outline"
          label="Notification Privacy"
          detail="Hide sensitive notification content"
          value={notificationPrivacy}
          onValueChange={setNotificationPrivacy}
        />
      </View>
      <InfoRow
        icon="lock-closed-outline"
        title="Your PIN stays on this device"
        body="It is protected by the device keystore or keychain and can be changed later."
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
          label="Save & Continue"
          onPress={handleContinue}
          disabled={Boolean(pinError)}
        />
      )}
      {pin || confirmation ? (
        <Text
          style={{
            color: pinError ? "#8A4B16" : "#26734D",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          {pinError ?? "PINs match."}
        </Text>
      ) : null}
    </OnboardingShell>
  );
}
