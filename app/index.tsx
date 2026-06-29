import { Link, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { getCurrentSession } from "../lib/engines/authEngine";

export default function AppEntryScreen() {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  async function checkSession() {
    setLoading(true);

    try {
      const session = await getCurrentSession();
      setSignedIn(session !== null);
    } catch {
      setSignedIn(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkSession();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          Loading SafeSteps...
        </Text>
      </View>
    );
  }

  if (signedIn) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 34, fontWeight: "bold", marginBottom: 8 }}>
        SafeSteps
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 20 }}>
        A structured family support platform for programs, courses, reflections,
        evidence, tasks, progress and growth reports.
      </Text>

      <View
        style={{
          padding: 16,
          backgroundColor: "#f1f5f3",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          Welcome
        </Text>

        <Text style={{ marginTop: 8 }}>
          Sign in to continue your SafeSteps pathway, or create an account to
          begin.
        </Text>
      </View>

      <Link href="/login" asChild>
        <Pressable
          style={{
            padding: 14,
            backgroundColor: "#dcefe8",
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Login</Text>
        </Pressable>
      </Link>

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