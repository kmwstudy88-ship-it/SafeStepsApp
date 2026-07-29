import { Link } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import {
  createPasswordRecoverySession,
  getCurrentSession,
  signOut,
  updatePassword,
} from "../../lib/engines/authEngine";
import { getPasswordResetValidationError } from "../../lib/engines/authRecoveryPolicy";

export default function ResetPasswordScreen() {
  const recoveryUrl = Linking.useLinkingURL();
  const [ready, setReady] = useState(false);
  const [preparing, setPreparing] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const validationError = getPasswordResetValidationError(password, confirmation);

  useEffect(() => {
    let active = true;

    async function prepareRecovery() {
      setPreparing(true);
      setError("");

      try {
        const session = recoveryUrl
          ? await createPasswordRecoverySession(recoveryUrl)
          : await getCurrentSession();

        if (!active) return;
        setReady(Boolean(session));

        if (!session) {
          setError("Open the password reset link from your email to continue.");
        }
      } catch (recoveryError) {
        if (!active) return;
        setReady(false);
        setError(recoveryError instanceof Error ? recoveryError.message : "Could not open this reset link.");
      } finally {
        if (active) setPreparing(false);
      }
    }

    void prepareRecovery();
    return () => {
      active = false;
    };
  }, [recoveryUrl]);

  async function handleUpdate() {
    if (!ready || validationError || saving) return;

    setSaving(true);
    setError("");

    try {
      await updatePassword(password);
      await signOut();
      setPassword("");
      setConfirmation("");
      setComplete(true);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update your password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
      <View style={{ gap: 16 }}>
        <Text style={{ color: "#053C4E", fontSize: 30, fontWeight: "900" }}>Choose a new password</Text>

        {preparing ? (
          <View style={{ alignItems: "center", gap: 12, padding: 24 }}>
            <ActivityIndicator color="#008A84" />
            <Text style={{ color: "#274B52" }}>Checking your private reset link…</Text>
          </View>
        ) : complete ? (
          <View style={{ backgroundColor: "#E5F4EC", borderRadius: 12, gap: 10, padding: 16 }}>
            <Text style={{ color: "#053C4E", fontWeight: "900" }}>Password updated</Text>
            <Text style={{ color: "#274B52", lineHeight: 21 }}>Your password has been changed. Sign in again with your new password.</Text>
            <Link href="/login" asChild>
              <Pressable style={{ alignItems: "center", backgroundColor: "#008A84", borderRadius: 12, minHeight: 48, justifyContent: "center" }}>
                <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Return to login</Text>
              </Pressable>
            </Link>
          </View>
        ) : ready ? (
          <>
            <Text style={{ color: "#274B52", lineHeight: 22 }}>Use at least 8 characters. Choose a password you do not use elsewhere.</Text>
            <Text style={{ color: "#053C4E", fontWeight: "800" }}>New password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              autoComplete="new-password"
              secureTextEntry
              placeholder="New password"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#B9CEC6", borderRadius: 10, borderWidth: 1, minHeight: 52, padding: 12 }}
            />
            <Text style={{ color: "#053C4E", fontWeight: "800" }}>Confirm new password</Text>
            <TextInput
              value={confirmation}
              onChangeText={setConfirmation}
              autoComplete="new-password"
              secureTextEntry
              placeholder="Confirm new password"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#B9CEC6", borderRadius: 10, borderWidth: 1, minHeight: 52, padding: 12 }}
            />
            {error ? <Text style={{ color: "#9B2F1F", fontWeight: "700" }}>{error}</Text> : null}
            <Pressable
              disabled={Boolean(validationError) || saving}
              onPress={handleUpdate}
              style={{ alignItems: "center", backgroundColor: validationError ? "#CCD8D4" : "#008A84", borderRadius: 12, minHeight: 50, justifyContent: "center" }}
            >
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Update password</Text>}
            </Pressable>
            {password || confirmation ? <Text style={{ color: validationError ? "#8A4B16" : "#26734D" }}>{validationError ?? "Passwords match."}</Text> : null}
          </>
        ) : (
          <View style={{ backgroundColor: "#FFF2E8", borderRadius: 12, gap: 10, padding: 16 }}>
            <Text style={{ color: "#7A351E", fontWeight: "900" }}>Reset link needed</Text>
            <Text style={{ color: "#7A351E", lineHeight: 21 }}>{error}</Text>
            <Link href="/forgot-password" asChild>
              <Pressable style={{ alignItems: "center", minHeight: 44, justifyContent: "center" }}>
                <Text style={{ color: "#006B66", fontWeight: "900" }}>Request a new link</Text>
              </Pressable>
            </Link>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
