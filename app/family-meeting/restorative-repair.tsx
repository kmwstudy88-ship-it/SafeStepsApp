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
import { submitRestorativeFamilyMeetingPlan } from "../../lib/aiSupportApi";
import type { CouplesDfvStageId } from "../../lib/data/therapeuticCoachingProtocols";
import type { RestorativeFamilyMeetingResult } from "../../lib/engines/contactVisitAndRestorativeMeetingEngine";

export default function RestorativeFamilyMeetingStudioScreen() {
  const router = useRouter();
  const [stage, setStage] = useState<CouplesDfvStageId>("stage_3_conjoint_safety_gated");
  const [clinicianCleared, setClinicianCleared] = useState(true);
  const [feltSafetyScore, setFeltSafetyScore] = useState("8");
  const [repairDraft, setRepairDraft] = useState(
    "I'm sorry if you felt scared when I yelled, but you pushed my buttons and wouldn't get ready for school.",
  );
  const [result, setResult] = useState<RestorativeFamilyMeetingResult | null>(null);

  const handleEvaluateRepair = async () => {
    const res = await submitRestorativeFamilyMeetingPlan({
      creatorUserId: "parent-local",
      couplesDfvStage: stage,
      clinicianSafetyClearance: clinicianCleared,
      survivorFeltSafetyScore0to10: Number(feltSafetyScore) || 8,
      ruptureRepairDraft: repairDraft,
      childWishesOrWorries: [
        "I want grown-ups to use calm voices in the morning.",
        "I want to know I am never in trouble for how grown-ups feel.",
      ],
      turnTakingMinutes: 3,
    });
    setResult(res);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        Safety-Gated Restorative Family Meeting & Child-Parent Rupture-Repair Studio
      </Text>
      <Text style={styles.subtitle}>
        Requires Stage 3/4 clearance + Survivor Felt Safety &gt;= 7/10, and automatically rewrites adult apologies to remove excuses, conditional phrasing, or child-blaming.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>1. Stage & Safety Gate Verification</Text>
        <View style={styles.chipRow}>
          {(
            [
              "stage_1_stabilisation",
              "stage_2_parallel_synchronised",
              "stage_3_conjoint_safety_gated",
              "stage_4_family_reunification_maintenance",
            ] as const
          ).map((s) => (
            <Pressable
              key={s}
              style={[styles.chip, stage === s && styles.chipActive]}
              onPress={() => setStage(s)}
            >
              <Text style={styles.chipText}>{s.replace(/_/g, " ")}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.toggleBtn}
          onPress={() => setClinicianCleared((prev) => !prev)}
        >
          <Text style={styles.toggleText}>
            {clinicianCleared ? "☑" : "☐"} Clinician / Caseworker Restorative Clearance Active
          </Text>
        </Pressable>

        <Text style={styles.label}>Private Pre-Meeting Felt Safety Score (0–10; &lt;7 pivots to Parallel Mode)</Text>
        <TextInput
          style={styles.input}
          value={feltSafetyScore}
          onChangeText={setFeltSafetyScore}
          keyboardType="numeric"
        />

        <Text style={styles.sectionTitle}>
          2. Adult-to-Child Rupture-Repair Apology Draft
        </Text>
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          multiline
          value={repairDraft}
          onChangeText={setRepairDraft}
        />

        <Pressable style={styles.primaryBtn} onPress={handleEvaluateRepair}>
          <Text style={styles.primaryBtnText}>
            Verify Safety Gate & Build Child-Centred Repair Script
          </Text>
        </Pressable>

        {result ? (
          <View style={styles.resultBox}>
            <View
              style={[
                styles.statusBanner,
                result.meetingPermitted ? styles.statusBannerPermitted : styles.statusBannerBlocked,
              ]}
            >
              <Text style={styles.statusBannerText}>
                {result.meetingPermitted
                  ? "🟢 CONJOINT RESTORATIVE MEETING PERMITTED"
                  : "🟠 PARALLEL INDIVIDUAL PREPARATION REQUIRED"}
              </Text>
            </View>

            <Text style={styles.resultBody}>{result.safetyGateReason}</Text>

            {result.excuseOrChildBlameDetected ? (
              <View style={styles.warnBox}>
                <Text style={styles.resultWarnTitle}>⚠️ Excuse / Minimization Flags Filtered:</Text>
                {result.detectedBlameOrMinimizationFlags.map((flag, idx) => (
                  <Text key={idx} style={styles.resultWarnItem}>
                    • {flag}
                  </Text>
                ))}
              </View>
            ) : null}

            <Text style={styles.subSectionTitle}>Child-Centred 5-Step Repair Apology Script:</Text>
            <View style={styles.stepsCard}>
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>1</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>Own Adult Action (100% Responsibility):</Text>
                  <Text style={styles.stepText}>
                    {result.fiveStepRepairStructure.step1OwnAdultAction}
                  </Text>
                </View>
              </View>
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>2</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>Name Child Nervous System Impact:</Text>
                  <Text style={styles.stepText}>
                    {result.fiveStepRepairStructure.step2NameChildImpact}
                  </Text>
                </View>
              </View>
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>3</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>Zero Excuses Guarantee:</Text>
                  <Text style={styles.stepText}>
                    {result.fiveStepRepairStructure.step3ZeroExcusesGuarantee}
                  </Text>
                </View>
              </View>
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>4</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>Concrete Safety & Regulation Change:</Text>
                  <Text style={styles.stepText}>
                    {result.fiveStepRepairStructure.step4ConcreteSafetyChange}
                  </Text>
                </View>
              </View>
              <View style={styles.stepRow}>
                <Text style={styles.stepNum}>5</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>No Pressure to Forgive:</Text>
                  <Text style={styles.stepText}>
                    {result.fiveStepRepairStructure.step5NoPressureToForgive}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.subSectionTitle}>Voice of the Child Centering Cards:</Text>
            {result.voiceOfChildCards.map((card, idx) => (
              <View key={idx} style={styles.voiceCard}>
                <Text style={styles.voiceCardText}>🧸 "{card}"</Text>
              </View>
            ))}

            <Text style={styles.auditHashText}>
              🔐 Cryptographic Audit Hash: {result.auditSha256.slice(0, 16)}... (Encrypted in Offline Vault)
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.chipRow}>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => router.push("/family-meeting")}
        >
          <Text style={styles.secondaryBtnText}>Back to Family Meeting Hub</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => router.push("/ai-support-coach/couples-family-dfv")}
        >
          <Text style={styles.secondaryBtnText}>Couples & DFV Hub</Text>
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
  label: { color: "#CBD5E1", fontSize: 12, fontWeight: "600" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#0F172A",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#475569",
  },
  chipActive: { backgroundColor: "#0284C7", borderColor: "#38BDF8" },
  chipText: { color: "#F8FAFC", fontSize: 12, fontWeight: "600" },
  toggleBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#38BDF8",
  },
  toggleText: { color: "#E2E8F0", fontSize: 13 },
  input: {
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  primaryBtn: {
    backgroundColor: "#0284C7",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
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
  statusBanner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  statusBannerPermitted: {
    backgroundColor: "#064E3B",
    borderColor: "#34D399",
  },
  statusBannerBlocked: {
    backgroundColor: "#451A03",
    borderColor: "#FBBF24",
  },
  statusBannerText: {
    color: "#F8FAFC",
    fontWeight: "800",
    fontSize: 12,
  },
  warnBox: {
    backgroundColor: "#291515",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
    gap: 4,
  },
  resultWarnTitle: {
    color: "#FCA5A5",
    fontSize: 12,
    fontWeight: "700",
  },
  resultWarnItem: {
    color: "#FECACA",
    fontSize: 12,
  },
  subSectionTitle: {
    color: "#38BDF8",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
  },
  stepsCard: {
    backgroundColor: "#1E293B",
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  stepRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  stepNum: {
    backgroundColor: "#0284C7",
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: "center",
    lineHeight: 22,
  },
  stepContent: {
    flex: 1,
    gap: 2,
  },
  stepLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
  },
  stepText: {
    color: "#F1F5F9",
    fontSize: 12,
    lineHeight: 18,
  },
  voiceCard: {
    backgroundColor: "#1E293B",
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#F472B6",
  },
  voiceCardText: {
    color: "#F9A8D4",
    fontSize: 12,
    fontStyle: "italic",
  },
  auditHashText: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 4,
    fontFamily: "monospace",
  },
  secondaryBtn: {
    backgroundColor: "#334155",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  secondaryBtnText: { color: "#F8FAFC", fontSize: 13, fontWeight: "600" },
});
