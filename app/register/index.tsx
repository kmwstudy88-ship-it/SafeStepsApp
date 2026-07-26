import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import {
  FormInput,
  OnboardingShell,
  PrimaryButton,
  onboardingColors,
} from "../../components/SafeStepsOnboardingUI";
import { registerWithEmail } from "../../lib/engines/authEngine";

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canRegister =
    displayName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    password === confirmPassword;

  async function handleRegister() {
    if (!canRegister || loading) return;

    setLoading(true);
    setError("");

    try {
      await registerWithEmail({ displayName, email, password });
      router.replace({
        pathname: "/onboarding/verify-account",
        params: { contact: email.trim() },
      });
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingShell step={4}>
      <View style={{ alignItems: "center", gap: 5 }}>
        <Text style={{ color: onboardingColors.tealDark, fontSize: 29, fontWeight: "900", textAlign: "center" }}>
          Create Account
        </Text>
        <Text style={{ color: onboardingColors.ink, fontSize: 15, lineHeight: 21, textAlign: "center" }}>
          {"Let's get started. It only takes a minute."}
        </Text>
      </View>
      <View style={{ gap: 10 }}>
        <FormInput icon="person-outline" value={displayName} onChangeText={setDisplayName} placeholder="Full Name" />
        <FormInput
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email Address"
        />
        <FormInput icon="lock-closed-outline" value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" />
        <FormInput
          icon="lock-closed-outline"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Confirm Password"
        />
      </View>
      <Text selectable style={{ color: onboardingColors.ink, fontSize: 13, lineHeight: 18 }}>
        Use 8 or more characters with a mix of letters, numbers and symbols.
      </Text>
      {error ? (
        <Text selectable style={{ color: "#9B2F1F", fontSize: 13, fontWeight: "800", lineHeight: 18 }}>
          {error}
        </Text>
      ) : null}
      {loading ? <ActivityIndicator color={onboardingColors.teal} /> : <PrimaryButton label="Create Account" onPress={handleRegister} disabled={!canRegister} />}
      <Link href="/login" asChild>
        <Pressable style={{ alignItems: "center", minHeight: 44, justifyContent: "center" }}>
          <Text style={{ color: onboardingColors.ink }}>
            Already have an account? <Text style={{ color: onboardingColors.tealDark, fontWeight: "900" }}>Sign In</Text>
          </Text>
        </Pressable>
      </Link>
    </OnboardingShell>
  );
}
