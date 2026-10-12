import { Link, useLocalSearchParams, usePathname } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../lib/auth";
import { assertSensitiveRouteAccess, type CaseAccessGrant } from "../../lib/security/caseAccess";
import { getSensitiveRoutePolicy } from "../../lib/security/policy";

type SensitiveAccessContextValue = CaseAccessGrant | null;

const SensitiveAccessContext = createContext<SensitiveAccessContextValue>(null);

export function useSensitiveAccess(): SensitiveAccessContextValue {
  return useContext(SensitiveAccessContext);
}

function requestedCaseId(value: string | string[] | undefined): string | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export function SensitiveRouteBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useLocalSearchParams<{ caseId?: string | string[] }>();
  const { initializing, user } = useAuth();
  const [grant, setGrant] = useState<CaseAccessGrant | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const policy = getSensitiveRoutePolicy(pathname);

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      if (!policy) {
        if (active) {
          setGrant(null);
          setError("");
          setChecking(false);
        }
        return;
      }

      if (initializing) return;
      if (!user) {
        if (active) {
          setGrant(null);
          setError("Sign in before opening protected SafeSteps records.");
          setChecking(false);
        }
        return;
      }

      if (active) {
        setChecking(true);
        setError("");
      }

      try {
        const nextGrant = await assertSensitiveRouteAccess(pathname, requestedCaseId(params.caseId));
        if (active) setGrant(nextGrant);
      } catch (accessError) {
        if (active) {
          setGrant(null);
          setError(accessError instanceof Error ? accessError.message : "This protected area is not available to your account.");
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    checkAccess();
    return () => {
      active = false;
    };
  }, [initializing, params.caseId, pathname, policy, user]);

  if (!policy) return <>{children}</>;

  if (checking || initializing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.body}>Checking case access…</Text>
      </View>
    );
  }

  if (!grant || error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Access unavailable</Text>
        <Text style={styles.body}>{error || "You do not have permission to open this protected area."}</Text>
        <Link href="/dashboard" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Return to dashboard</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return <SensitiveAccessContext.Provider value={grant}>{children}</SensitiveAccessContext.Provider>;
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
