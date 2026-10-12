import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { buildLongitudinalComparison, saveReviewSnapshot } from "../../lib/platform/analytics";
import type { ReviewType } from "../../lib/platform/types";

export default function LongitudinalReportsScreen() {
  const [enrolmentId, setEnrolmentId] = useState("");
  const [reviewType, setReviewType] = useState<ReviewType>("baseline");
  const [month, setMonth] = useState("1");
  const [metricsJson, setMetricsJson] = useState('{"parentingConfidence": 3, "routineStability": 2, "safetyPlanning": 2}');
  const [narrative, setNarrative] = useState("");
  const [comparison, setComparison] = useState<any[]>([]);

  async function saveSnapshot() {
    try {
      if (!enrolmentId.trim()) throw new Error("Enrolment ID is required.");
      const metrics = JSON.parse(metricsJson);
      await saveReviewSnapshot({ enrolmentId, reviewType, reviewMonth: Number(month) || undefined, metrics, narrative });
      Alert.alert("Saved", "Review snapshot saved.");
    } catch (error) {
      Alert.alert("Could not save", error instanceof Error ? error.message : "Unknown error");
    }
  }

  async function loadComparison() {
    try {
      if (!enrolmentId.trim()) throw new Error("Enrolment ID is required.");
      const report = await buildLongitudinalComparison(enrolmentId);
      setComparison(report.comparison);
    } catch (error) {
      Alert.alert("Could not load", error instanceof Error ? error.message : "Unknown error");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Longitudinal comparison reports</Text>
      <Text style={styles.body}>Save baseline, month review, and final review snapshots. The report compares numeric scores so change can be shown over time.</Text>

      <Field label="Enrolment ID" value={enrolmentId} onChangeText={setEnrolmentId} />
      <Text style={styles.label}>Review type</Text>
      <View style={styles.tabs}>
        {(["baseline", "month_review", "final_review"] as ReviewType[]).map((type) => (
          <Pressable key={type} style={[styles.tab, reviewType === type && styles.activeTab]} onPress={() => setReviewType(type)}>
            <Text style={styles.tabText}>{type}</Text>
          </Pressable>
        ))}
      </View>
      {reviewType === "month_review" && <Field label="Review month" value={month} onChangeText={setMonth} keyboardType="numeric" />}
      <Field label="Metrics JSON" value={metricsJson} onChangeText={setMetricsJson} multiline />
      <Field label="Narrative" value={narrative} onChangeText={setNarrative} multiline />

      <Pressable style={styles.button} onPress={saveSnapshot}>
        <Text style={styles.buttonText}>Save snapshot</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={loadComparison}>
        <Text style={styles.secondaryButtonText}>Load comparison</Text>
      </Pressable>

      {comparison.map((item) => (
        <View key={item.key} style={styles.card}>
          <Text style={styles.cardTitle}>{item.key}</Text>
          <Text>Baseline: {String(item.baseline)}</Text>
          <Text>Latest: {String(item.latest)}</Text>
          <Text>Difference: {item.difference === null ? "n/a" : item.difference}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...inputProps} style={[styles.input, inputProps.multiline && styles.multiline]} placeholderTextColor="#67736a" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, backgroundColor: "#eef5ef" },
  title: { fontSize: 28, fontWeight: "800" },
  body: { fontSize: 16, lineHeight: 23 },
  fieldWrap: { gap: 6 },
  label: { fontSize: 13, fontWeight: "800" },
  input: { backgroundColor: "white", borderRadius: 14, borderWidth: 1, borderColor: "#d6e2d8", padding: 12, fontSize: 15 },
  multiline: { minHeight: 110, textAlignVertical: "top" },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "white", borderWidth: 1, borderColor: "#d6e2d8" },
  activeTab: { borderColor: "#3a5f48", borderWidth: 2 },
  tabText: { fontWeight: "700" },
  button: { backgroundColor: "#2f5f4a", padding: 15, borderRadius: 16, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "800" },
  secondaryButton: { backgroundColor: "white", borderWidth: 1, borderColor: "#2f5f4a", padding: 15, borderRadius: 16, alignItems: "center" },
  secondaryButtonText: { color: "#2f5f4a", fontWeight: "800" },
  card: { backgroundColor: "white", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#d6e2d8" },
  cardTitle: { fontSize: 18, fontWeight: "800" },
});