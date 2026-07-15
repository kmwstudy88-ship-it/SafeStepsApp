import { Link, useLocalSearchParams, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { assertProgramEnrollmentAccess } from "../../lib/engines/programStartGateEngine";

const GUARDED_PROGRAM_PATHS = [
  "/programs/month",
  "/programs/week",
  "/programs/lesson",
  "/programs/reflection",
] as const;

function needsEnrollment(pathname: string): boolean {
  return GUARDED_PROGRAM_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function ProgramEnrollmentBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useLocalSearchParams<{ programId?: string | string[] }>();
  const rawProgramId = params.programId;
  const programId = Array.isArray(rawProgramId) ? rawProgramId[0] ?? "" : rawProgramId ?? "";
  const guarded = needsEnrollment(pathname);
  const [checking, setChecking] = useState(guarded);
  const [allowed, setAllowed] = useState(!guarded);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function check() {
      if (!guarded) {
        if (active) {
          setAllowed(true);
          setError("");
          setChecking(false);
        }
        return;
      }

      if (!programId) {
        if (active) {
          setAllowed(false);
          setError("A valid program must be selected before opening program content.");
          setChecking(false);
        }
        return;
      }

      if (active) {
        setChecking(true);
        setAllowed(false);
        setError("");
      }

      try {
        await assertProgramEnrollmentAccess(programId);
        if (active) setAllowed(true);
      } catch (accessError) {
        if (active) {
          setError(accessError instanceof Error ? accessError.message : "Program content is locked.");
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    check();
    return () => {
      active = false;
    };
  }, [guarded, pathname, programId]);

  if (!guarded) return <>{children}</>;

  if (checking) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.body}>Checking program access…</Text>
      </View>
    );
  }

  if (!allowed) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Program locked</Text>
        <Text style={styles.body}>{error}</Text>
        <Link href="/intake-progress" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>View intake progress</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return <>{children}</>;
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
  body: { color: "#4B5D55", lineHeight: 21, textAlign: "center", maxWidth: 520 },
  button: { marginTop: 8, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12, backgroundColor: "#2F5F4A" },
  buttonText: { color: "#FFFFFF", fontWeight: "900" },
});
