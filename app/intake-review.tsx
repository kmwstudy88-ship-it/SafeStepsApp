import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuth } from "../lib/auth";
import { getCurrentSecurityRole } from "../lib/security/caseAccess";
import { fetchIntakeReviewQueue, reviewIntake, type IntakeReviewQueueItem } from "../lib/engines/programStartGateEngine";

const REVIEW_ROLES = ["caseworker", "supervisor", "admin", "super_admin"] as const;

export default function IntakeReviewScreen() {
  const { initializing, user } = useAuth();
  const [items, setItems] = useState<IntakeReviewQueueItem[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingCaseId, setSavingCaseId] = useState("");
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState("");

  async function loadQueue() {
    setLoading(true);
    setError("");
    try {
      const role = await getCurrentSecurityRole();
      if (!REVIEW_ROLES.includes(role as (typeof REVIEW_ROLES)[number])) {
        setAllowed(false);
        setItems([]);
        return;
      }
      setAllowed(true);
      setItems(await fetchIntakeReviewQueue());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load intake review queue.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(item: IntakeReviewQueueItem, state: "approved" | "changes_required") {
    setSavingCaseId(item.case_id);
    setError("");
    try {
      await reviewIntake(item.case_id, state, notes[item.case_id] ?? "");
      await loadQueue();
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Could not save intake review.");
    } finally {
      setSavingCaseId("");
    }
  }

  useEffect(() => {
    if (user) loadQueue();
  }, [user]);

  if (initializing) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Intake Review Queue</Text>
      <Text style={styles.subtitle}>Higher-risk pathway intake must be reviewed by an assigned worker, supervisor, or administrator before enrollment.</Text>

      {loading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && !allowed ? <Text style={styles.error}>Your SafeSteps role cannot review intake approvals.</Text> : null}
      {!loading && allowed && items.length === 0 ? <View style={styles.card}><Text style={styles.cardTitle}>Queue clear</Text><Text style={styles.body}>No completed intake records currently require review.</Text></View> : null}

      {allowed ? items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.cardTitle}>{item.family_label ?? "SafeSteps case"}</Text>
          <Text style={styles.body}>Parent/carer: {item.parent_carer_name ?? "Not recorded"}</Text>
          <Text style={styles.body}>Program stream: {item.program_stream ?? "Not selected"}</Text>
          <Text style={styles.body}>Intake: {item.completed_sections} of {item.total_sections} sections complete</Text>
          <Text style={styles.body}>State: {item.reviewer_state.replace(/_/g, " ")}</Text>
          <TextInput
            multiline
            value={notes[item.case_id] ?? item.reviewer_notes ?? ""}
            onChangeText={(value) => setNotes((current) => ({ ...current, [item.case_id]: value }))}
            placeholder="Record factual review notes or required changes."
            style={styles.input}
          />
          <View style={styles.row}>
            <Pressable disabled={savingCaseId === item.case_id} onPress={() => handleReview(item, "changes_required")} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Require changes</Text>
            </Pressable>
            <Pressable disabled={savingCaseId === item.case_id} onPress={() => handleReview(item, "approved")} style={styles.button}>
              <Text style={styles.buttonText}>{savingCaseId === item.case_id ? "Saving..." : "Approve intake"}</Text>
            </Pressable>
          </View>
        </View>
      )) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, gap: 14, backgroundColor: "#EEF5EF", minHeight: "100%" },
  title: { fontSize: 30, fontWeight: "900", color: "#102033" },
  subtitle: { color: "#4B5D55", lineHeight: 22 },
  card: { padding: 18, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D8E5DD", gap: 8 },
  cardTitle: { fontSize: 20, fontWeight: "900", color: "#102033" },
  body: { color: "#4B5D55", lineHeight: 21 },
  input: { minHeight: 110, borderWidth: 1, borderColor: "#B9CCC0", borderRadius: 10, padding: 12, textAlignVertical: "top", backgroundColor: "#F9FBFA" },
  row: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  button: { flexGrow: 1, padding: 13, borderRadius: 10, backgroundColor: "#2F5F4A", alignItems: "center" },
  buttonText: { color: "#FFFFFF", fontWeight: "900" },
  secondaryButton: { flexGrow: 1, padding: 13, borderRadius: 10, backgroundColor: "#FFF4DB", borderWidth: 1, borderColor: "#E5C879", alignItems: "center" },
  secondaryText: { color: "#7A4E00", fontWeight: "900" },
  error: { color: "#8E2B21", fontWeight: "800" },
});
