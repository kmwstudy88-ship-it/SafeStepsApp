import { Redirect, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { DEMO_USER_ID, useAuth } from "../../lib/auth";
import { loadParentOnboardingStatus } from "../../lib/engines/onboardingEngine";
import { getParentOnboardingResumeRoute } from "../../lib/engines/onboardingPolicy";

const POST_AUTH_ONBOARDING_ROUTES = new Set([
  "/onboarding/protect-account",
  "/onboarding/consent-information-sharing",
  "/onboarding/accessibility-preferences",
]);

export function OnboardingRouteBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [loadedPath, setLoadedPath] = useState<string | null>(null);
  const [status, setStatus] = useState<unknown>("not_started");
  const [error, setError] = useState("");

  const needsGate =
    Boolean(user) &&
    user?.id !== DEMO_USER_ID &&
    !POST_AUTH_ONBOARDING_ROUTES.has(pathname) &&
    pathname !== "/onboarding/verify-account";

  useEffect(() => {
    let active = true;

    if (!needsGate) {
      setLoadedPath(pathname);
      setError("");
      return () => {
        active = false;
      };
    }

    setLoadedPath(null);
    setError("");

    loadParentOnboardingStatus()
      .then((nextStatus) => {
        if (!active) return;
        setStatus(nextStatus);
        setLoadedPath(pathname);
      })
      .catch((loadError) => {
        if (!active) return;
        setError(
          loadError instanceof Error ? loadError.message : "Could not load onboarding progress.",
        );
        setLoadedPath(pathname);
      });

    return () => {
      active = false;
    };
  }, [needsGate, pathname, user?.id]);

  if (!needsGate) return <>{children}</>;

  if (loadedPath !== pathname) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#008A84" />
        <Text style={styles.text}>Loading your SafeSteps progress…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorTitle}>Onboarding could not be loaded</Text>
        <Text style={styles.text}>{error}</Text>
      </View>
    );
  }

  const nextRoute = getParentOnboardingResumeRoute(status);
  if (nextRoute !== "/dashboard") return <Redirect href={nextRoute} />;

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
  text: {
    color: "#053C4E",
    fontWeight: "700",
    textAlign: "center",
  },
  errorTitle: {
    color: "#8A2F22",
    fontSize: 18,
    fontWeight: "900",
  },
});
