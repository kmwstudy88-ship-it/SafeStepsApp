import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { submitContactVisitCoachSession } from "../../lib/aiSupportApi";
import type {
  ChildTransitionSignal,
  ContactVisitCoachingResult,
  ContactVisitPhase,
} from "../../lib/engines/contactVisitAndRestorativeMeetingEngine";

const CHILD_SIGNALS: { id: ChildTransitionSignal; label: string }[] = [
  { id: "quiet_withdrawn_or_shut_down", label: "Quiet, withdrawn, or shut down after handover" },
  { id: "clingy_separation_distress", label: "Clingy or tearful at goodbye/arrival" },
  { id: "hyperactive_or_silly_dysregulation", label: "Hyperactive, restless, or 'silly' energy" },
  { id: "anger_or_pushing_parent_away", label: "Angry protest or pushing parent/carer away" },
  { id: "tummy_ache_or_headache", label: "Tummy ache, headache, or physical tension" },
  { id: "sleep_regression_or_bedwetting", label: "Sleep difficulty or toileting regression" },
  { id: "loyalty_bind_questions", label: "Asking loyalty-bind questions about the other home" },
];

export default function ContactVisitTransitionCoachScreen() {
  const router = useRouter();
  const [visitPhase, setVisitPhase] = useState<ContactVisitPhase>("post_visit_transition");
  const [arousalScore, setArousalScore] = useState("6");
  const [selectedSignals, setSelectedSignals] = useState<ChildTransitionSignal[]>([
    "quiet_withdrawn_or_shut_down",
    "tummy_ache_or_headache",
  ]);
  const [result, setResult] = useState<ContactVisitCoachingResult | null>(null);

  const toggleSignal = (sig: ChildTransitionSignal) => {
    setSelectedSignals((prev) =>
      prev.includes(sig) ? prev.filter((s) => s !== sig) : [...prev, sig],
    );
  };

  const handleRunCoach = async () => {
    const res = await submitContactVisitCoachSession({
      parentOrCarerUserId: "parent-local",
      visitPhase,
      parentArousal0to10: Number(arousalScore) || 3,
      childAgeBand: "5-8",
      childObservedSignals: selectedSignals,
    });
    setResult(res);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        Pre / During / Post Contact Visit Co-Regulation & Child Transition Decoder
      </Text>
      <Text style={styles.subtitle}>
        Helps parents and kinship/foster carers prepare for contact visits and decode post-visit child behaviour as attachment transition stress rather than defiance.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>1. Select Contact Visit Phase</Text>
        <View style={styles.chipRow}>
          {(
            [
              { id: "pre_visit_grounding", label: "Pre-Visit Grounding (5-Min)" },
              { id: "during_visit_coregulation", label: "During-Visit Co-Regulation" },
              { id: "post_visit_transition", label: "Post-Visit Transition Decoder" },
            ] as const
          ).map((phase) => (
            <Pressable
              key={phase.id}
              style={[styles.chip, visitPhase === phase.id && styles.chipActive]}
              onPress={() => setVisitPhase(phase.id)}
            >
              <Text style={styles.chipText}>{phase.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>
          2. Your Current Nervous System Arousal (0 = Calm, 10 = Overwhelmed)
        </Text>
        <TextInput
          style={styles.input}
          value={arousalScore}
          onChangeText={setArousalScore}
          keyboardType="numeric"
        />

        <Text style={styles.sectionTitle}>3. Child Signals Observed Around Handover</Text>
        {CHILD_SIGNALS.map((sig) => {
          const active = selectedSignals.includes(sig.id);
          return (
            <Pressable
              key={sig.id}
              style={[styles.signalRow, active && styles.signalRowActive]}
              onPress={() => toggleSignal(sig.id)}
            >
              <Text style={styles.signalText}>
                {active ? "☑ " : "☐ "}
                {sig.label}
              </Text>
            </Pressable>
          );
        })}

        <Pressable style={styles.primaryBtn} onPress={handleRunCoach}>
          <Text style={styles.primaryBtnText}>
            Generate Co-Regulation Script & Transition Formulation
          </Text>
        </Pressable>

        {result ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>{result.somaticGroundingDrill}</Text>
            <Text style={styles.resultBody}>
              Attachment Formulation: {result.attachmentTransitionFormulation}
            </Text>
            <Text style={styles.resultSafe}>
              What to Say / Do: {result.coRegulationMicroScript}
            </Text>
            {result.avoidedMisattributionFlags.map((flag, idx) => (
              <Text key={idx} style={styles.resultWarn}>
                • Guardrail: {flag}
              </Text>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.chipRow}>
        <Pressable style={styles.secondaryBtn} onPress={() => router.push("/visits")}>
          <Text style={styles.secondaryBtnText}>Back to Visits & Contact Log</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => router.push("/ai-support-coach")}
        >
          <Text style={styles.secondaryBtnText}>AI Support Coach</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  content: { padding: 18, paddingBottom: 48, gap: 16 },
  title: { color: "#F8FAFC", fontSize: 20, fontWeight: "800" },
  subtitle: { color: "#94A3B8", fontSize: 13 },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 10,
  },
  sectionTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "700", marginTop: 4 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#0F172A",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#475569",
  },
  chipActive: { backgroundColor: "#0284C7", borderColor: "#38BDF8" },
  chipText: { color: "#F8FAFC", fontSize: 12, fontWeight: "600" },
  input: {
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
  signalRow: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
  },
  signalRowActive: { borderColor: "#38BDF8", backgroundColor: "#0C4A6E" },
  signalText: { color: "#E2E8F0", fontSize: 13 },
  primaryBtn: {
    backgroundColor: "#0284C7",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  resultBox: {
    backgroundColor: "#0F172A",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0284C7",
    gap: 6,
  },
  resultTitle: { color: "#38BDF8", fontWeight: "700", fontSize: 14 },
  resultBody: { color: "#E2E8F0", fontSize: 13 },
  resultSafe: { color: "#6EE7B7", fontSize: 13 },
  resultWarn: { color: "#FCD34D", fontSize: 12 },
  secondaryBtn: {
    backgroundColor: "#334155",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  secondaryBtnText: { color: "#F8FAFC", fontSize: 13, fontWeight: "600" },
});
