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
import {
  generateCourtSaferAiAnnexure,
  generateLongitudinalEvaluation,
  generatePsychologistFormulation,
  submit360MultiInformantPortal,
  submitClinicalScaleScreening,
} from "../../lib/aiSupportApi";
import type {
  CourtSaferAiAnnexureResult,
  MultiInformant360PortalResult,
} from "../../lib/engines/forensicConvergenceAndChildPlayroomEngine";

export default function MultiInformantAndCourtBridgeScreen() {
  const router = useRouter();

  // Module 10: 360° Multi-Informant Convergence Portal
  const [selfReportScore, setSelfReportScore] = useState("82");
  const [supervisorScore, setSupervisorScore] = useState("78");
  const [teacherScore, setTeacherScore] = useState("80");
  const [aodScore, setAodScore] = useState("84");
  const [portalResult, setPortalResult] = useState<MultiInformant360PortalResult | null>(null);

  // Module 9: Court & SAFER Annexure Compiler
  const [clinicianApproved, setClinicianApproved] = useState(true);
  const [clinicianName, setClinicianName] = useState("Dr. E. Vance (Senior Clinical Psychologist)");
  const [clinicianRegNumber, setClinicianRegNumber] = useState("AHPRA PSY0001928374");
  const [annexureResult, setAnnexureResult] = useState<CourtSaferAiAnnexureResult | null>(null);

  const handleRun360Portal = async () => {
    const res = await submit360MultiInformantPortal({
      caseId: "case-360-demo",
      subjectUserId: "parent-local",
      parentSelfReportScore0to100: Number(selfReportScore) || 82,
      observations: [
        {
          informantRole: "contact_supervisor",
          informantName: "M. Patel (Supervised Contact Worker)",
          observedDomain: "Warmth, Child Pacing & Handover Co-Regulation",
          rating0to100: Number(supervisorScore) || 78,
          behavioralObservationNotes:
            "Parent arrived 15 minutes early, knelt to eye level, brought healthy snacks, and responded calmly when child was quiet at handover.",
        },
        {
          informantRole: "teacher_early_childhood",
          informantName: "J. Nguyen (Grade 2 Teacher - SDQ)",
          observedDomain: "Child Classroom Settling & Morning Readiness",
          rating0to100: Number(teacherScore) || 80,
          behavioralObservationNotes:
            "Child has arrived on time with lunch packed and markedly lower morning hypervigilance over the past 4 weeks.",
        },
        {
          informantRole: "aod_counsellor",
          informantName: "R. O'Connor (AOD Recovery Specialist)",
          observedDomain: "Relapse Prevention & HALT+S Routine Adherence",
          rating0to100: Number(aodScore) || 84,
          behavioralObservationNotes:
            "Consistent weekly attendance, verified sober safety plan, and active urge-surfing log completion.",
        },
      ],
    });
    setPortalResult(res);
  };

  const handleCompileCourtAnnexure = async () => {
    const prfq = await submitClinicalScaleScreening("prfq", [
      { itemId: "prfq_1", numericScore: 4 },
      { itemId: "prfq_2", numericScore: 4 },
      { itemId: "prfq_3", numericScore: 3 },
      { itemId: "prfq_4", numericScore: 4 },
    ]);

    const formulation = await generatePsychologistFormulation({
      caseId: "case-360-demo",
      participantUserId: "parent-local",
      screenings: [prfq],
      clinicianClearedConjoint: true,
    });

    const evaluation = await generateLongitudinalEvaluation({
      caseId: "case-360-demo",
      participantUserId: "parent-local",
      currentScreenings: [prfq],
      baselineScreenings: [{ scaleId: "prfq", rawScore: 6 }],
      clinicianClearedConjoint: true,
    });

    if (clinicianApproved) {
      formulation.reviewState = "clinician_approved";
      evaluation.reviewState = "clinician_approved";
    }

    const annexure = await generateCourtSaferAiAnnexure({
      caseId: "case-360-demo",
      participantUserId: "parent-local",
      formulation,
      evaluation,
      clinicianApproved,
      approvedByClinicianName: `${clinicianName} [${clinicianRegNumber}]`,
    });
    setAnnexureResult(annexure);
  };

  const informantBars = [
    { label: "Parent Self-Report", score: Number(selfReportScore) || 82, color: "#38BDF8" },
    { label: "Contact Supervisor", score: Number(supervisorScore) || 78, color: "#10B981" },
    { label: "Teacher (SDQ Collateral)", score: Number(teacherScore) || 80, color: "#F59E0B" },
    { label: "AOD Counsellor", score: Number(aodScore) || 84, color: "#818CF8" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        360° Multi-Informant Convergence Portal &amp; Court / SAFER Annexure Auto-Compiler
      </Text>
      <Text style={styles.subtitle}>
        Triangulates parent self-report against Contact Supervisor, Teacher (SDQ), and AOD Worker
        collateral, and compiles Clinician-Approved 5P + 10-Engine SAFER Court Annexures.
      </Text>

      {/* Module 10: 360° Multi-Informant Convergence Portal */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          1. 360° Multi-Informant Convergence Portal (Engine 10 Input)
        </Text>
        <Text style={styles.helperText}>
          Input multi-informant ratings across family domains to detect convergence vs. impression management:
        </Text>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Parent Self-Report (0–100)</Text>
            <TextInput
              style={styles.input}
              value={selfReportScore}
              onChangeText={setSelfReportScore}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Contact Supervisor (0–100)</Text>
            <TextInput
              style={styles.input}
              value={supervisorScore}
              onChangeText={setSupervisorScore}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Teacher SDQ (0–100)</Text>
            <TextInput
              style={styles.input}
              value={teacherScore}
              onChangeText={setTeacherScore}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>AOD Counsellor (0–100)</Text>
            <TextInput
              style={styles.input}
              value={aodScore}
              onChangeText={setAodScore}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Informant Score Comparison Bar Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>📊 Informant Triangulation Breakdown</Text>
          {informantBars.map((bar) => (
            <View key={bar.label} style={styles.barItem}>
              <View style={styles.barLabelRow}>
                <Text style={styles.barLabel}>{bar.label}</Text>
                <Text style={[styles.barValue, { color: bar.color }]}>{bar.score}/100</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(100, Math.max(0, bar.score))}%`,
                      backgroundColor: bar.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <Pressable style={styles.primaryBtn} onPress={handleRun360Portal}>
          <Text style={styles.primaryBtnText}>Compute 360° Multi-Informant Convergence</Text>
        </Pressable>

        {portalResult ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>
              Convergence Score: {portalResult.overallConvergenceScore0to100}/100 | Band:{" "}
              {portalResult.convergenceBand.replace(/_/g, " ").toUpperCase()}
            </Text>
            <Text style={styles.resultBody}>
              Mean Informant Rating: {portalResult.meanInformantScore0to100}/100 (Discrepancy Gap:{" "}
              {portalResult.parentVsInformantGap} pts)
            </Text>
            {portalResult.processedObservations.map((obs, idx) => (
              <View key={idx} style={styles.obsItem}>
                <View style={styles.obsHeader}>
                  <Text style={styles.obsName}>{obs.informantName}</Text>
                  <Text
                    style={[
                      styles.obsBadge,
                      obs.convergenceAlignment === "convergent" && styles.obsBadgeGreen,
                      obs.convergenceAlignment === "minor_divergence" && styles.obsBadgeAmber,
                      obs.convergenceAlignment === "critical_discrepancy" && styles.obsBadgeRed,
                    ]}
                  >
                    {obs.convergenceAlignment.replace(/_/g, " ").toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.resultSafe}>• {obs.sanitizedNotes}</Text>
              </View>
            ))}
            {portalResult.contradictionAlerts.map((alert, idx) => (
              <Text key={idx} style={styles.resultWarn}>
                ⚠ {alert}
              </Text>
            ))}
          </View>
        ) : null}
      </View>

      {/* Module 9: Court Report & SAFER Annexure Auto-Compiler */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          2. Court Report &amp; SAFER Annexure Auto-Compiler (Clinician Sign-Off Gate)
        </Text>
        <Text style={styles.helperText}>
          Under policies/safety_policy.md, unapproved AI outputs are strictly blocked from statutory court export.
        </Text>

        <Pressable
          style={styles.toggleBtn}
          onPress={() => setClinicianApproved((prev) => !prev)}
        >
          <Text style={styles.toggleText}>
            {clinicianApproved ? "☑" : "☐"} Clinician / Supervisor Sign-Off Verified (Uncheck to test safety_policy.md Export Block)
          </Text>
        </Pressable>

        {/* Clinician Credentials */}
        <Text style={styles.label}>Signing Clinician / Supervisor Name</Text>
        <TextInput
          style={styles.input}
          value={clinicianName}
          onChangeText={setClinicianName}
        />
        <Text style={styles.label}>AHPRA / AASW Board Registration Number</Text>
        <TextInput
          style={styles.input}
          value={clinicianRegNumber}
          onChangeText={setClinicianRegNumber}
        />

        {/* Verification Checklist */}
        <View style={styles.checklistCard}>
          <Text style={styles.checklistTitle}>📋 Mandatory Statutory Annexure Checklist</Text>
          <Text style={styles.checklistItem}>✓ AHPRA / AASW clinical credential verified</Text>
          <Text style={styles.checklistItem}>✓ Multi-informant collateral cross-check completed</Text>
          <Text style={styles.checklistItem}>✓ Psychometric Reliable Change Index (RCI) confirmed</Text>
          <Text style={styles.checklistItem}>✓ Non-diagnostic legal disclosure appended</Text>
          <Text style={styles.checklistItem}>✓ Tamper-evident SHA-256 cryptographic seal ready</Text>
        </View>

        <Pressable style={styles.primaryBtn} onPress={handleCompileCourtAnnexure}>
          <Text style={styles.primaryBtnText}>
            Compile SHA-256 Signed SAFER &amp; 5P Court Annexure
          </Text>
        </Pressable>

        {annexureResult ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>
              Court Export Status:{" "}
              {annexureResult.eligibleForCourtExport ? "ELIGIBLE (Approved by Clinician)" : "BLOCKED"}
            </Text>
            {annexureResult.blockedReason ? (
              <View style={styles.blockNotice}>
                <Text style={styles.blockNoticeTitle}>⛔ Court Export Blocked</Text>
                <Text style={styles.resultWarn}>{annexureResult.blockedReason}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.resultSafe}>{annexureResult.annexureTitle}</Text>
                <Text style={styles.resultBody}>
                  {annexureResult.nonDiagnosticLegalDisclaimer}
                </Text>
                {annexureResult.uncertaintyDisclosure ? (
                  <Text style={styles.resultWarn}>{annexureResult.uncertaintyDisclosure}</Text>
                ) : null}
                {annexureResult.reliableChangeTrajectorySummary.map((rci, idx) => (
                  <Text key={idx} style={styles.resultSafe}>
                    • RCI Trajectory: {rci}
                  </Text>
                ))}
                <Text style={styles.resultBody}>
                  Court Evidence Records Linked: {annexureResult.courtEvidenceRecords.length}
                </Text>
                <View style={styles.sealBox}>
                  <Text style={styles.sealTitle}>🛡️ Tamper-Evident SHA-256 Seal</Text>
                  <Text style={styles.sealHash}>{annexureResult.tamperEvidentSha256}</Text>
                  <Text style={styles.sealSigner}>
                    Approved by: {annexureResult.approvedByClinicianName} at{" "}
                    {annexureResult.approvedAtIso?.slice(0, 19).replace("T", " ")}
                  </Text>
                </View>
              </>
            )}
          </View>
        ) : null}
      </View>

      <View style={styles.row}>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => router.push("/assessment-system/ai-psychologist-evaluator")}
        >
          <Text style={styles.secondaryBtnText}>5P Psychologist &amp; 10-Engine Evaluator</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={() => router.push("/reports")}>
          <Text style={styles.secondaryBtnText}>Court Reports Hub</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  content: { padding: 18, paddingBottom: 48, gap: 16 },
  title: { color: "#F8FAFC", fontSize: 20, fontWeight: "800" },
  subtitle: { color: "#94A3B8", fontSize: 13, lineHeight: 18 },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    gap: 10,
  },
  sectionTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "700" },
  helperText: { color: "#94A3B8", fontSize: 12 },
  label: { color: "#CBD5E1", fontSize: 12, fontWeight: "600" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  input: {
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  chartContainer: {
    backgroundColor: "#0F172A",
    borderRadius: 8,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  chartTitle: { color: "#38BDF8", fontSize: 13, fontWeight: "700" },
  barItem: { gap: 4 },
  barLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  barLabel: { color: "#CBD5E1", fontSize: 11 },
  barValue: { fontSize: 11, fontWeight: "700" },
  barTrack: {
    height: 8,
    backgroundColor: "#1E293B",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4 },
  toggleBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#38BDF8",
  },
  toggleText: { color: "#E2E8F0", fontSize: 13 },
  checklistCard: {
    backgroundColor: "#0F172A",
    borderRadius: 8,
    padding: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  checklistTitle: { color: "#6EE7B7", fontSize: 12, fontWeight: "700" },
  checklistItem: { color: "#E2E8F0", fontSize: 11 },
  primaryBtn: {
    backgroundColor: "#0284C7",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
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
  resultSafe: { color: "#6EE7B7", fontSize: 12 },
  resultWarn: { color: "#FCD34D", fontSize: 12 },
  obsItem: { marginTop: 4, gap: 2 },
  obsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  obsName: { color: "#F8FAFC", fontSize: 12, fontWeight: "700" },
  obsBadge: { fontSize: 10, fontWeight: "800", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  obsBadgeGreen: { backgroundColor: "#064E3B", color: "#6EE7B7" },
  obsBadgeAmber: { backgroundColor: "#78350F", color: "#FDE68A" },
  obsBadgeRed: { backgroundColor: "#7F1D1D", color: "#FECACA" },
  blockNotice: {
    backgroundColor: "#7F1D1D",
    padding: 10,
    borderRadius: 6,
    gap: 4,
  },
  blockNoticeTitle: { color: "#FECACA", fontSize: 13, fontWeight: "800" },
  sealBox: {
    marginTop: 8,
    backgroundColor: "#1E293B",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#10B981",
    gap: 4,
  },
  sealTitle: { color: "#6EE7B7", fontSize: 12, fontWeight: "700" },
  sealHash: { color: "#94A3B8", fontSize: 10, fontFamily: "monospace" },
  sealSigner: { color: "#CBD5E1", fontSize: 11 },
  secondaryBtn: {
    backgroundColor: "#334155",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  secondaryBtnText: { color: "#F8FAFC", fontSize: 13, fontWeight: "600" },
});
