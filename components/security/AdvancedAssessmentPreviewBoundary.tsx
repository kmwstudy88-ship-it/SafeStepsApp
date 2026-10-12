import { Link, usePathname } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const ADVANCED_ASSESSMENT_PREVIEW_PATHS = [
  "/assessment-system/scoring",
  "/assessment-system/readiness-index",
  "/assessment-system/report-output",
] as const;

export function isAdvancedAssessmentPreviewPath(pathname: string) {
  const normalized = (pathname.split(/[?#]/, 1)[0] || "/").replace(/\/+$/, "") || "/";
  return ADVANCED_ASSESSMENT_PREVIEW_PATHS.some(
    (path) => normalized === path || normalized.startsWith(`${path}/`),
  );
}

export function advancedAssessmentPreviewsEnabled() {
  return process.env.EXPO_PUBLIC_SAFESTEPS_ENABLE_ADVANCED_ASSESSMENT_PREVIEWS === "true";
}

export function AdvancedAssessmentPreviewBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (!isAdvancedAssessmentPreviewPath(pathname) || advancedAssessmentPreviewsEnabled()) {
    return <>{children}</>;
  }

  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Advanced assessment preview unavailable</Text>
      <Text style={styles.body}>
        Calibration scoring, readiness, and court-report previews are hidden from the launch runtime until they are connected to live reviewed case records.
      </Text>
      <Link href="/assessment-system" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Return to assessment system</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 28,
    backgroundColor: "#EEF5EF",
  },
  title: { color: "#102033", fontSize: 24, fontWeight: "900", textAlign: "center" },
  body: { color: "#4B5D55", lineHeight: 21, textAlign: "center", maxWidth: 560 },
  button: {
    marginTop: 8,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#2F5F4A",
  },
  buttonText: { color: "#FFFFFF", fontWeight: "900" },
});
