import { Link } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { requestPasswordReset } from "../../lib/engines/authEngine";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const canSend = email.trim().length > 0 && !loading;

  async function handleSend() {
    if (!canSend) return;

    setLoading(true);
    setError("");

    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Could not send the reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
      <View style={{ gap: 16 }}>
        <Text style={{ color: "#053C4E", fontSize: 30, fontWeight: "900" }}>Reset your password</Text>
        <Text style={{ color: "#274B52", fontSize: 15, lineHeight: 22 }}>
          Enter the email used for SafeSteps. We will send a private link to choose a new password.
        </Text>

        {sent ? (
          <View style={{ backgroundColor: "#E5F4EC", borderRadius: 12, gap: 8, padding: 16 }}>
            <Text style={{ color: "#053C4E", fontWeight: "900" }}>Check your email</Text>
            <Text style={{ color: "#274B52", lineHeight: 21 }}>
              If an account exists for that address, a reset link has been sent. Open it on this device to continue.
            </Text>
          </View>
        ) : (
          <>
            <Text style={{ color: "#053C4E", fontWeight: "800" }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="Email address"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#B9CEC6", borderRadius: 10, borderWidth: 1, minHeight: 52, padding: 12 }}
            />
            {error ? <Text style={{ color: "#9B2F1F", fontWeight: "700" }}>{error}</Text> : null}
            <Pressable
              disabled={!canSend}
              onPress={handleSend}
              style={{ alignItems: "center", backgroundColor: canSend ? "#008A84" : "#CCD8D4", borderRadius: 12, minHeight: 50, justifyContent: "center" }}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Send reset link</Text>}
            </Pressable>
          </>
        )}

        <Link href="/login" asChild>
          <Pressable style={{ alignItems: "center", minHeight: 44, justifyContent: "center" }}>
            <Text style={{ color: "#006B66", fontWeight: "900" }}>Back to login</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}
