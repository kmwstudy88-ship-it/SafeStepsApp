import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { submitClinicianSignOffDecision } from "../../lib/aiSupportApi";

export default function ClinicianReviewConsoleScreen() {
  const router = useRouter();
  const [targetType, setTargetType] = useState<
    "formulation" | "evaluation" | "conjoint_clearance"
  >("formulation");
  const [reviewState, setReviewState] = useState<
    "clinician_approved" | "clinician_amended" | "contested"
  >("clinician_approved");
  const [clinicianNotes, setClinicianNotes] = useState(
    "Structured Professional Judgement (SPJ) review completed: 5P non-diagnostic formulation, Safe & Together survivor protective factors, and poverty-vs-neglect fairness guardrails verified.",
  );
  const [externalInstrument, setExternalInstrument] = useState("DPICS-IV / CARE-Index");
  const [externalSummaryText, setExternalSummaryText] = useState(
    "Observational dyadic coding confirms warm caregiver sensitivity, labelled praise, and child proximity-seeking.",
  );
  const [signOffReceipt, setSignOffReceipt] = useState<{
    targetId: string;
    reviewState: string;
    reviewedAt: string;
    auditSha256: string;
    clinicianNotes: string;
  } | null>(null);

  async function handleSignOff() {
    const receipt = await submitClinicianSignOffDecision({
      targetId: `spj-${targetType}-001`,
      targetType,
      reviewState,
      clinicianNotes: `${clinicianNotes} [External Bridge: ${externalInstrument} — ${externalSummaryText}]`,
    });
    setSignOffReceipt(receipt);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>
          FORM 10 • HUMAN-IN-THE-LOOP SPJ GOVERNANCE & SHA-256 AUDIT TRAIL
        </Text>
        <Text style={styles.heroTitle}>
          Practitioner & Clinical Psychologist SPJ Sign-Off & Conjoint Clearance Console
        </Text>
        <Text style={styles.heroSubtitle}>
          All AI formulations, 10-engine longitudinal evaluations, and Stage 3 Couples DFV Conjoint
          clearances remain in draft decision-support status until reviewed and signed off by an
          authorized practitioner.
        </Text>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push("/assessment-system/ai-psychologist-evaluator" as never)}
          >
            <Text style={styles.navBtnText}>← 5P Formulation & 10 Evaluators</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push("/assessment-system/multi-informant-court-bridge" as never)}
          >
            <Text style={styles.navBtnText}>360° Court Bridge</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push("/ai-support-coach/couples-family-dfv" as never)}
          >
            <Text style={styles.navBtnText}>Couples DFV Hub</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push("/reports" as never)}
          >
            <Text style={styles.navBtnText}>Reports Hub</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Step 1: Select Target for SPJ Review */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>1. Select Clinical Artifact for SPJ Sign-Off</Text>
        <View style={styles.chipRow}>
          {(
            [
              { id: "formulation", label: "5P Psychological Formulation" },
              { id: "evaluation", label: "10-Engine Longitudinal Evaluation" },
              { id: "conjoint_clearance", label: "Stage 3 Couples DFV Conjoint Clearance" },
            ] as const
          ).map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTargetType(t.id)}
              style={[styles.chip, targetType === t.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, targetType === t.id && styles.chipTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Step 2: Tier 3 & Tier 4 External Psychologist Summary Bridge */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          2. Tier 3 & Tier 4 External Psychologist Assessment Bridge
        </Text>
        <View style={styles.chipRow}>
          {[
            "PAI / MCMI-IV",
            "TSI-2 / WAIS-IV / ABAS-3",
            "DPICS-IV / CARE-Index",
            "NCFAS-G+R / SDM / CAPI",
          ].map((inst) => (
            <TouchableOpacity
              key={inst}
              onPress={() => setExternalInstrument(inst)}
              style={[styles.chip, externalInstrument === inst && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, externalInstrument === inst && styles.chipTextActive]}
              >
                {inst}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          value={externalSummaryText}
          onChangeText={setExternalSummaryText}
          multiline
          style={styles.textInput}
        />
      </View>

      {/* Step 3: SPJ Decision & Sign-Off */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>3. Record Structured Professional Judgement (SPJ)</Text>
        <View style={styles.chipRow}>
          {(
            [
              { id: "clinician_approved", label: "Approve via SPJ" },
              { id: "clinician_amended", label: "Approve with Clinical Amendments" },
              { id: "contested", label: "Hold / Require Re-Assessment" },
            ] as const
          ).map((st) => (
            <TouchableOpacity
              key={st.id}
              onPress={() => setReviewState(st.id)}
              style={[styles.chip, reviewState === st.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, reviewState === st.id && styles.chipTextActive]}>
                {st.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          value={clinicianNotes}
          onChangeText={setClinicianNotes}
          multiline
          style={styles.textInput}
        />

        <TouchableOpacity onPress={handleSignOff} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>
            Record Clinician SPJ Sign-Off & Generate SHA-256 Receipt
          </Text>
        </TouchableOpacity>

        {signOffReceipt ? (
          <View style={styles.receiptBox}>
            <Text style={styles.receiptTitle}>
              SPJ Sign-Off Recorded ({signOffReceipt.reviewState.toUpperCase()})
            </Text>
            <Text style={styles.receiptMeta}>
              Target: {signOffReceipt.targetId} • Timestamp: {signOffReceipt.reviewedAt}
            </Text>
            <Text style={styles.receiptNotes}>{signOffReceipt.clinicianNotes}</Text>
            <Text style={styles.receiptHash}>
              SHA-256 Audit Seal: {signOffReceipt.auditSha256}
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7F6" },
  content: { padding: 16, paddingBottom: 48, gap: 16 },
  heroCard: {
    backgroundColor: "#143642",
    borderRadius: 16,
    padding: 18,
    gap: 8,
  },
  eyebrow: {
    color: "#8ED1B7",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
  },
  heroSubtitle: {
    color: "#D5E5E8",
    fontSize: 13,
    lineHeight: 19,
  },
  navRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  navBtn: {
    backgroundColor: "#214E5E",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  navBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCE6E5",
    gap: 10,
  },
  sectionTitle: {
    color: "#143642",
    fontSize: 16,
    fontWeight: "900",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#EDF3F2",
  },
  chipActive: {
    backgroundColor: "#143642",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#143642",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  textInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#C8D8D5",
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: "#143642",
    backgroundColor: "#FAFCFC",
    textAlignVertical: "top",
  },
  primaryButton: {
    backgroundColor: "#2F7D5C",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  receiptBox: {
    backgroundColor: "#EDF7F2",
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2F7D5C",
    gap: 4,
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#143642",
  },
  receiptMeta: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F5B42",
  },
  receiptNotes: {
    fontSize: 12,
    color: "#143642",
    lineHeight: 18,
  },
  receiptHash: {
    fontSize: 11,
    color: "#4B6369",
    marginTop: 4,
  },
});
