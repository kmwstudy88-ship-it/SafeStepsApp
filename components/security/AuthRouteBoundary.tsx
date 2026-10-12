import { Redirect, usePathname } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../lib/auth";
import { isPublicLaunchRoute } from "../../lib/navigation/launchRoutes";

export function AuthRouteBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { initializing, user } = useAuth();

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#008A84" />
        <Text style={styles.loadingText}>Checking your SafeSteps session…</Text>
      </View>
    );
  }

  if (!user && !isPublicLaunchRoute(pathname)) {
    return <Redirect href="/login" />;
  }

  if (user && (pathname === "/login" || pathname === "/register")) {
    return <Redirect href="/dashboard" />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: "#EEF5EF",
  },
  loadingText: {
    color: "#053C4E",
    fontWeight: "800",
  },
});
