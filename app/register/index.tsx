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
import { registerWithEmail } from "../../lib/engines/authEngine";

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister() {
    if (
      displayName.trim().length === 0 ||
      email.trim().length === 0 ||
      password.length < 6 ||
      loading
    ) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await registerWithEmail({
        displayName,
        email,
        password,
      });

      if (data.session) {
        router.replace("/welcome");
        return;
      }

      router.replace("/welcome");
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : "Could not create account."
      );
    } finally {
      setLoading(false);
    }
  }

  const canRegister =
    displayName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6;

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 30, fontWeight: "bold", marginBottom: 8 }}>
        Create Account
      </Text>

      <Text style={{ marginBottom: 20 }}>
        Create a SafeSteps account to start programs, save reflections, upload
        evidence, and track progress.
      </Text>

      <Text style={{ fontWeight: "bold" }}>Display Name</Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your name"
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
        placeholder="Password - minimum 6 characters"
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
          <Text style={{ fontWeight: "bold" }}>Register Error</Text>
          <Text style={{ marginTop: 6 }}>{error}</Text>
        </View>
      )}

      {message.length > 0 && (
        <View
          style={{
            padding: 14,
            backgroundColor: "#ecfdf3",
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Account Created</Text>
          <Text style={{ marginTop: 6 }}>{message}</Text>
        </View>
      )}

      <Pressable
        disabled={!canRegister || loading}
        onPress={handleRegister}
        style={{
          padding: 14,
          backgroundColor: canRegister ? "#dcefe8" : "#e5e5e5",
          borderRadius: 12,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={{ fontWeight: "bold" }}>Create Account</Text>
        )}
      </Pressable>

      <Link href="/login" asChild>
        <Pressable
          style={{
            padding: 14,
            backgroundColor: "#f1f5f3",
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Already have an account? Login</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}
