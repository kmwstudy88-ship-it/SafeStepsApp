import { Link, Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../lib/auth";
import { blockerMessage } from "../lib/engines/programStartGatePolicy";
import { getMyIntakeProgress, type IntakeProgress } from "../lib/engines/programStartGateEngine";

function statusLabel(done: boolean) {
  return done ? "Complete" : "Required";
}

function formatDate(value: string | null) {
  if (!value) return "Not completed";
  return new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function IntakeProgressScreen() {
  const { initializing, user } = useAuth();
  const [progress, setProgress] = useState<IntakeProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProgress() {
    setLoading(true);
    setError("");
    try {
      setProgress(await getMyIntakeProgress());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load intake progress.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) loadProgress();
  }, [user]);

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Intake & Program Start</Text>
      <Text style={styles.subtitle}>SafeSteps checks every required entry step before a program can begin.</Text>

      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {progress ? (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Intake progress</Text>
            <Text style={styles.percent}>{progress.percentComplete}%</Text>
            <View style={styles.track}><View style={[styles.fill, { width: `${progress.percentComplete}%` }]} /></View>
            <Text style={styles.body}>{progress.completedSections} of {progress.totalSections} required sections completed.</Text>
            <Text style={styles.body}>Completed at: {formatDate(progress.intakeCompletedAt)}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Program start requirements</Text>
            <Text style={styles.row}>Profile: {statusLabel(progress.profileComplete)}</Text>
            <Text style={styles.row}>Case setup: {statusLabel(progress.caseSetupComplete)}</Text>
            <Text style={styles.row}>Intake: {statusLabel(progress.intakeComplete)}</Text>
            <Text style={styles.row}>Reviewer state: {progress.reviewerState.replace(/_/g, " ")}</Text>
            {progress.reviewedAt ? <Text style={styles.body}>Reviewed: {formatDate(progress.reviewedAt)}</Text> : null}
            {progress.reviewerNotes ? <Text style={styles.notice}>Reviewer note: {progress.reviewerNotes}</Text> : null}
          </View>

          {progress.decision.blockers.length > 0 ? (
            <View style={styles.warning}>
              <Text style={styles.warningTitle}>Programs remain locked</Text>
              {progress.decision.blockers.map((blocker) => <Text key={blocker} style={styles.body}>• {blockerMessage(blocker)}</Text>)}
            </View>
          ) : (
            <View style={styles.success}>
              <Text style={styles.successTitle}>Entry requirements complete</Text>
              <Text style={styles.body}>Eligible programs can now be checked and started.</Text>
            </View>
          )}

          <View style={styles.actions}>
            {!progress.profileComplete ? <Link href="/my-story" asChild><Pressable style={styles.button}><Text style={styles.buttonText}>Complete profile</Text></Pressable></Link> : null}
            {!progress.caseSetupComplete ? <Link href="/assessment-system/case-setup" asChild><Pressable style={styles.button}><Text style={styles.buttonText}>Complete case setup</Text></Pressable></Link> : null}
            {!progress.intakeComplete ? <Link href="/assessments" asChild><Pressable style={styles.button}><Text style={styles.buttonText}>Complete intake</Text></Pressable></Link> : null}
            <Link href="/programs" asChild><Pressable style={styles.button}><Text style={styles.buttonText}>View programs</Text></Pressable></Link>
            <Pressable onPress={loadProgress} style={styles.secondaryButton}><Text style={styles.secondaryText}>Refresh progress</Text></Pressable>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, gap: 14, backgroundColor: "#EEF5EF", minHeight: "100%" },
  title: { fontSize: 30, fontWeight: "900", color: "#102033" },
  subtitle: { color: "#4B5D55", lineHeight: 22 },
  card: { padding: 18, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D8E5DD", gap: 8 },
  cardTitle: { fontSize: 20, fontWeight: "900", color: "#102033" },
  percent: { fontSize: 32, fontWeight: "900", color: "#2F5F4A" },
  track: { height: 12, borderRadius: 99, backgroundColor: "#E4ECE7", overflow: "hidden" },
  fill: { height: 12, backgroundColor: "#2F5F4A" },
  row: { fontWeight: "800", color: "#24352E" },
  body: { color: "#4B5D55", lineHeight: 21 },
  notice: { color: "#5D4A00", fontWeight: "700" },
  warning: { padding: 16, borderRadius: 12, backgroundColor: "#FFF4DB", gap: 6 },
  warningTitle: { fontWeight: "900", color: "#7A4E00", fontSize: 18 },
  success: { padding: 16, borderRadius: 12, backgroundColor: "#DCEFE8", gap: 6 },
  successTitle: { fontWeight: "900", color: "#204A39", fontSize: 18 },
  actions: { gap: 10 },
  button: { padding: 13, borderRadius: 10, backgroundColor: "#2F5F4A", alignItems: "center" },
  buttonText: { color: "#FFFFFF", fontWeight: "900" },
  secondaryButton: { padding: 13, borderRadius: 10, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#B9CCC0", alignItems: "center" },
  secondaryText: { color: "#2F5F4A", fontWeight: "900" },
  error: { color: "#8E2B21", fontWeight: "800" },
});
