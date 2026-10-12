import { router, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import {
  NatureScene,
  OnboardingShell,
  PrimaryButton,
  TextButton,
  onboardingColors,
} from "../../components/SafeStepsOnboardingUI";
import {
  createEmailVerificationSession,
  resendEmailVerification,
  upsertProfile,
  verifyEmailOtp,
} from "../../lib/engines/authEngine";

export default function VerifyAccountScreen() {
  const params = useLocalSearchParams<{ contact?: string; displayName?: string }>();
  const linkingUrl = Linking.useLinkingURL();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const contact = params.contact?.trim() ?? "";
  const displayName = params.displayName?.trim() ?? "";
  const complete = useMemo(() => code.every((digit) => digit.length === 1), [code]);

  async function finishVerification() {
    await upsertProfile({
      display_name: displayName || contact || "Parent",
      email: contact || null,
    });
    router.replace("/onboarding/protect-account");
  }

  useEffect(() => {
    let active = true;

    if (!linkingUrl || !/[#?&](?:access_token|code)=/.test(linkingUrl)) {
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError("");

    createEmailVerificationSession(linkingUrl)
      .then(async () => {
        if (!active) return;
        await finishVerification();
      })
      .catch((verificationError) => {
        if (!active) return;
        setError(
          verificationError instanceof Error
            ? verificationError.message
            : "Could not verify this email link.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [linkingUrl]);

  function updateCode(value: string, index: number) {
    const next = [...code];
    next[index] = value.replace(/\D/g, "").slice(-1);
    setCode(next);
  }

  async function handleVerifyCode() {
    if (!contact || !complete || loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await verifyEmailOtp(contact, code.join(""));
      await finishVerification();
    } catch (verificationError) {
      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "Could not verify this code.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!contact || resending) return;

    setResending(true);
    setError("");
    setMessage("");

    try {
      await resendEmailVerification(contact);
      setMessage("A new verification email has been sent.");
    } catch (resendError) {
      setError(
        resendError instanceof Error
          ? resendError.message
          : "Could not resend the verification email.",
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <OnboardingShell step={5} totalSteps={8}>
      <View style={{ alignItems: "center", gap: 5 }}>
        <Text
          style={{
            color: onboardingColors.tealDark,
            fontSize: 29,
            fontWeight: "900",
            textAlign: "center",
          }}
        >
          Verify Your Account
        </Text>
        <Text
          style={{
            color: onboardingColors.ink,
            fontSize: 15,
            lineHeight: 21,
            textAlign: "center",
          }}
        >
          Use the 6-digit code or tap the private verification link sent to{" "}
          {contact || "your email"}.
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
            textContentType="oneTimeCode"
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
      {error ? (
        <Text style={{ color: "#9B2F1F", fontWeight: "800", textAlign: "center" }}>
          {error}
        </Text>
      ) : null}
      {message ? (
        <Text style={{ color: "#26734D", fontWeight: "800", textAlign: "center" }}>
          {message}
        </Text>
      ) : null}
      <NatureScene compact />
      {loading ? (
        <ActivityIndicator color={onboardingColors.teal} />
      ) : (
        <PrimaryButton
          label="Verify & Continue"
          onPress={handleVerifyCode}
          disabled={!complete || !contact}
        />
      )}
      <Pressable
        disabled={!contact || resending}
        onPress={handleResend}
        style={{ alignItems: "center", minHeight: 44, justifyContent: "center" }}
      >
        <Text style={{ color: onboardingColors.tealDark, fontWeight: "900" }}>
          {resending ? "Sending…" : "Resend verification email"}
        </Text>
      </Pressable>
      <TextButton label="Change Email" href="/register" />
    </OnboardingShell>
  );
}
