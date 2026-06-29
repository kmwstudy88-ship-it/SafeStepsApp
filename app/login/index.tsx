import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { signInWithEmail } from "../../lib/engines/authEngine";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (email.trim().length === 0 || password.length === 0 || loading) return;

    setLoading(true);
    setError("");

    try {
      await signInWithEmail(email, password);
      router.replace("/dashboard");
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Could not login."
      );
    } finally {
      setLoading(false);
    }
  }

  const canLogin = email.trim().length > 0 && password.length > 0;

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 8 }}>
        Login
      </Text>

      <Text style={{ marginBottom: 20 }}>
        Sign in to continue your SafeSteps pathway.
      </Text>

      <Text style={{ fontWeight: "bold" }}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email address"
        style={{
          minHeight: 50,
          borderWidth: 1,
          borderColor: "#cbd8d0",
          borderRadius: 10,
          padding: 12,
          marginTop: 8,
          marginBottom: 14,
          backgroundColor: "#ffffff",
        }}
      />

      <Text style={{ fontWeight: "bold" }}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
        style={{
          minHeight: 50,
          borderWidth: 1,
          borderColor: "#cbd8d0",
          borderRadius: 10,
          padding: 12,
          marginTop: 8,
          marginBottom: 14,
          backgroundColor: "#ffffff",
        }}
      />

      {error.length > 0 && (
        <View
          style={{
            padding: 14,
            backgroundColor: "#ffecec",
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Login Error</Text>
          <Text style={{ marginTop: 6 }}>{error}</Text>
        </View>
      )}

      <Pressable
        disabled={!canLogin || loading}
        onPress={handleLogin}
        style={{
          padding: 14,
          backgroundColor: canLogin ? "#dcefe8" : "#e5e5e5",
          borderRadius: 12,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={{ fontWeight: "bold" }}>Login</Text>
        )}
      </Pressable>

      <Link href="/register" asChild>
        <Pressable
          style={{
            padding: 14,
            backgroundColor: "#f1f5f3",
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Create Account</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}