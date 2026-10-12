import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { scoreClinicalScale, type ClinicalScaleScoreOutput } from "../../lib/data/clinicalAndParentingScales";
import { runTenEngineLongitudinalEvaluation } from "../../lib/engines/aiLongitudinalEvaluatorEngine";
import { buildFivePPsychologicalFormulation } from "../../lib/engines/aiPsychologistFormulationEngine";
import { evaluateCouplesDfvSafetyGate } from "../../lib/engines/aiSupportCoachEngine";

type PresetId =
  | "steady_restoration"
  | "dfv_silent_pivot"
  | "tri_morbid_cascade"
  | "impression_mgmt_gaming";

function buildPresetBattery(preset: PresetId): {
  screenings: ClinicalScaleScoreOutput[];
  feltSafety: number;
  fearOfRetaliation: boolean;
  workerObsScore: number;
  childSafetyScore: number;
} {
  if (preset === "dfv_silent_pivot") {
    return {
      feltSafety: 4,
      fearOfRetaliation: true,
      workerObsScore: 62,
      childSafetyScore: 54,
      screenings: [
        scoreClinicalScale("web_safety", [
          { itemId: "web_1", numericScore: 2 },
          { itemId: "web_2", numericScore: 2 },
          { itemId: "web_3", numericScore: 1 },
          { itemId: "web_4", numericScore: 2 },
        ]),
        scoreClinicalScale("dfv_safety_coercive", [
          { itemId: "dfv_1", numericScore: 0 },
          { itemId: "dfv_2", numericScore: 0 },
          { itemId: "dfv_3", numericScore: 2 },
          { itemId: "dfv_4", numericScore: 1 },
        ]),
        scoreClinicalScale("pfs_2", [
          { itemId: "pfs_1", numericScore: 4 },
          { itemId: "pfs_2", numericScore: 3 },
          { itemId: "pfs_3", numericScore: 3 },
          { itemId: "pfs_4", numericScore: 3 },
        ]),
      ],
    };
  }

  if (preset === "tri_morbid_cascade") {
    return {
      feltSafety: 6,
      fearOfRetaliation: false,
      workerObsScore: 64,
      childSafetyScore: 62,
      screenings: [
        scoreClinicalScale("audit", [
          { itemId: "audit_1", numericScore: 2 },
          { itemId: "audit_2", numericScore: 2 },
          { itemId: "audit_3", numericScore: 2 },
          { itemId: "audit_4", numericScore: 1 },
        ]),
        scoreClinicalScale("phq_9", [
          { itemId: "phq9_1", numericScore: 2 },
          { itemId: "phq9_2", numericScore: 2 },
          { itemId: "phq9_3", numericScore: 2 },
          { itemId: "phq9_9", numericScore: 0 },
        ]),
        scoreClinicalScale("isi_sleep", [
          { itemId: "isi_1", numericScore: 3 },
          { itemId: "isi_2", numericScore: 3 },
          { itemId: "isi_3", numericScore: 3 },
          { itemId: "isi_4", numericScore: 2 },
        ]),
        scoreClinicalScale("grief_ambiguous_loss", [
          { itemId: "grief_1", numericScore: 2 },
          { itemId: "grief_2", numericScore: 2 },
          { itemId: "grief_3", numericScore: 2 },
          { itemId: "grief_4", numericScore: 1 },
        ]),
        scoreClinicalScale("concrete_needs", [
          { itemId: "sdh_1", numericScore: 2 },
          { itemId: "sdh_2", numericScore: 2 },
          { itemId: "sdh_3", numericScore: 1 },
          { itemId: "sdh_4", numericScore: 1 },
        ]),
      ],
    };
  }

  if (preset === "impression_mgmt_gaming") {
    return {
      feltSafety: 8,
      fearOfRetaliation: false,
      workerObsScore: 52,
      childSafetyScore: 56,
      screenings: [
        scoreClinicalScale("validity_mcsds", [
          { itemId: "mcsds_1", numericScore: 3, responseTimeMs: 650 },
          { itemId: "mcsds_2", numericScore: 3, responseTimeMs: 700 },
          { itemId: "mcsds_3", numericScore: 3, responseTimeMs: 600 },
          { itemId: "mcsds_4", numericScore: 3, responseTimeMs: 650 },
        ]),
        scoreClinicalScale(
          "validity_sjt_pressure",
          [
            { itemId: "sjt_p1", numericScore: 1 },
            { itemId: "sjt_p2", numericScore: 1 },
            { itemId: "sjt_p3", numericScore: 1 },
            { itemId: "sjt_p4", numericScore: 2 },
          ],
          "sjt_vignette",
        ),
        scoreClinicalScale("capes", [
          { itemId: "capes_1", numericScore: 4, responseTimeMs: 700 },
          { itemId: "capes_2", numericScore: 4, responseTimeMs: 700 },
          { itemId: "capes_3", numericScore: 4, responseTimeMs: 700 },
          { itemId: "capes_4", numericScore: 4, responseTimeMs: 700 },
        ]),
      ],
    };
  }

  // Default: steady_restoration
  return {
    feltSafety: 9,
    fearOfRetaliation: false,
    workerObsScore: 84,
    childSafetyScore: 86,
    screenings: [
      scoreClinicalScale("dvfct_readiness", [
        { itemId: "dvfct_1", numericScore: 4 },
        { itemId: "dvfct_2", numericScore: 4 },
        { itemId: "dvfct_3", numericScore: 3 },
        { itemId: "dvfct_4", numericScore: 4 },
      ]),
      scoreClinicalScale("puv_accountability", [
        { itemId: "puv_1", numericScore: 3 },
        { itemId: "puv_2", numericScore: 4 },
        { itemId: "puv_3", numericScore: 3 },
        { itemId: "puv_4", numericScore: 4 },
      ]),
      scoreClinicalScale("prfq", [
        { itemId: "prfq_1", numericScore: 4 },
        { itemId: "prfq_2", numericScore: 3 },
        { itemId: "prfq_3", numericScore: 4 },
        { itemId: "prfq_4", numericScore: 3 },
      ]),
      scoreClinicalScale("gem_sewb", [
        { itemId: "sewb_1", numericScore: 4 },
        { itemId: "sewb_2", numericScore: 4 },
        { itemId: "sewb_3", numericScore: 3 },
        { itemId: "sewb_4", numericScore: 4 },
      ]),
      scoreClinicalScale("bces_10", [
        { itemId: "bces_1", numericScore: 4 },
        { itemId: "bces_2", numericScore: 3 },
        { itemId: "bces_3", numericScore: 4 },
        { itemId: "bces_4", numericScore: 4 },
      ]),
    ],
  };
}

export default function AiPsychologistAndTenEvaluatorScreen() {
  const router = useRouter();
  const [preset, setPreset] = useState<PresetId>("steady_restoration");

  const battery = useMemo(() => buildPresetBattery(preset), [preset]);

  const safetyCheck = useMemo(
    () =>
      evaluateCouplesDfvSafetyGate({
        sessionId: "eval-session",
        participantUserId: "participant-1",
        checkPhase: "pre_session",
        feltSafetyScore: battery.feltSafety,
        fearOfRetaliation: battery.fearOfRetaliation,
        coercedToParticipate: false,
        immediateDanger: false,
        clinicianClearedConjoint: preset === "steady_restoration",
      }),
    [battery, preset],
  );

  const formulation = useMemo(
    () =>
      buildFivePPsychologicalFormulation({
        caseId: "case-demo-1",
        participantUserId: "participant-1",
        screenings: battery.screenings,
        couplesSafetyChecks: [safetyCheck],
        clinicianClearedConjoint: preset === "steady_restoration",
        externalTier34Summaries: [
          {
            id: "ext-1",
            instrumentCode: "DPICS-IV",
            assessmentDate: "2026-10-01",
            validitySummary: "Live dyadic observation valid; PRIDE skills and child comfort observed.",
            keyStrengthsIdentified: ["Warm labelled praise", "Following child lead during play"],
            keyClinicalAndSafetyNeeds: ["Maintain 10-minute sensory transition buffer before bedtime"],
            recommendedCoachingAccommodations: ["3-step visual bedtime checklist"],
          },
        ],
      }),
    [battery, safetyCheck, preset],
  );

  const evaluation = useMemo(
    () =>
      runTenEngineLongitudinalEvaluation({
        caseId: "case-demo-1",
        participantUserId: "participant-1",
        currentScreenings: battery.screenings,
        baselineScreenings: battery.screenings.map((s) => ({
          scaleId: s.scaleId,
          rawScore: Math.max(0, s.rawScore - 5),
        })),
        couplesSafetyChecks: [safetyCheck],
        partnerFeltSafetyScore: battery.feltSafety,
        workerObservationScore: battery.workerObsScore,
        childFeltSafetyOverride: battery.childSafetyScore,
        clinicianClearedConjoint: preset === "steady_restoration",
      }),
    [battery, safetyCheck, preset],
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>
          NON-DIAGNOSTIC 5P CLINICAL FORMULATION • 10 SPECIALIZED AI EVALUATOR ENGINES
        </Text>
        <Text style={styles.heroTitle}>
          AI Psychologist Formulation Companion & 10-Engine Longitudinal Evaluator
        </Text>
        <Text style={styles.heroSubtitle}>
          Synthesizes 50+ clinical/parenting scales, Couples DFV felt-safety checks, Tier 3/4
          external psychologist summaries, and 360° multi-informant evidence into an SPJ-governed
          formulation and readiness report.
        </Text>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push("/ai-support-coach" as never)}
          >
            <Text style={styles.navBtnText}>← AI Support Coach</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => router.push("/ai-support-coach/check-in-scales" as never)}
          >
            <Text style={styles.navBtnText}>50+ Clinical Scales</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtnHighlight}
            onPress={() => router.push("/clinician-review" as never)}
          >
            <Text style={styles.navBtnText}>Clinician SPJ Sign-Off →</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() =>
              router.push("/assessment-system/multi-informant-court-bridge" as never)
            }
          >
            <Text style={styles.navBtnText}>360° Informants & Court Annexure →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preset Case Profile Switcher */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Inspect Live Clinical Case Profile Scenario</Text>
        <View style={styles.chipRow}>
          {(
            [
              { id: "steady_restoration", label: "1. Stage 3 Cleared Restoration" },
              { id: "dfv_silent_pivot", label: "2. DFV Fear / Silent Parallel Pivot" },
              { id: "tri_morbid_cascade", label: "3. Tri-Morbid + Poverty Fairness" },
              { id: "impression_mgmt_gaming", label: "4. Impression Management / Gaming" },
            ] as const
          ).map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setPreset(item.id)}
              style={[styles.chip, preset === item.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, preset === item.id && styles.chipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Non-Diagnostic Compliance & Top Summary */}
      <View style={styles.complianceCard}>
        <Text style={styles.complianceTitle}>{formulation.nonDiagnosticComplianceBanner}</Text>
        <Text style={styles.complianceMeta}>
          Overall Readiness: {evaluation.overallReadinessScore}/100 • Risk Band:{" "}
          {evaluation.overallRiskBand} • Confidence: {Math.round(evaluation.confidenceScore * 100)}%
          • Status: {evaluation.reviewState.replace(/_/g, " ").toUpperCase()}
        </Text>
      </View>

      {/* PART A: 5P Psychological Formulation ("AI Psychologist" Companion) */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          Part A: Non-Diagnostic 5P Psychological Formulation
        </Text>
        <Text style={styles.synthesisText}>{formulation.intersectionalSynthesis}</Text>

        <View style={styles.fivePGrid}>
          <View style={styles.pBox}>
            <Text style={styles.pHeader}>1. Presenting Factors</Text>
            {formulation.presentingFactors.map((f) => (
              <Text key={f} style={styles.pBullet}>• {f}</Text>
            ))}
          </View>
          <View style={styles.pBox}>
            <Text style={styles.pHeader}>2. Predisposing Context</Text>
            {formulation.predisposingFactors.map((f) => (
              <Text key={f} style={styles.pBullet}>• {f}</Text>
            ))}
          </View>
          <View style={styles.pBox}>
            <Text style={styles.pHeader}>3. Precipitating Triggers</Text>
            {formulation.precipitatingFactors.map((f) => (
              <Text key={f} style={styles.pBullet}>• {f}</Text>
            ))}
          </View>
          <View style={styles.pBox}>
            <Text style={styles.pHeader}>4. Perpetuating Cycles</Text>
            {formulation.perpetuatingFactors.map((f) => (
              <Text key={f} style={styles.pBullet}>• {f}</Text>
            ))}
          </View>
          <View style={[styles.pBox, styles.pBoxStrength]}>
            <Text style={styles.pHeaderStrength}>5. Protective Factors & Anchors</Text>
            {formulation.protectiveFactors.map((f) => (
              <Text key={f} style={styles.pBullet}>• {f}</Text>
            ))}
          </View>
        </View>
      </View>

      {/* PART B: All 10 Specialized AI Evaluator Engines */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          Part B: The 10 Specialized Longitudinal AI Evaluator Engines
        </Text>

        {/* Engine 1 */}
        <View style={styles.engineCard}>
          <Text style={styles.engineTitle}>
            Engine 1: Anti-Gaming 5-Indicator Authenticity Evaluator (
            {evaluation.engine1AntiGaming.overallAuthenticityScore}/100)
          </Text>
          <Text style={styles.engineSub}>
            Classification: {evaluation.engine1AntiGaming.classification.replace(/_/g, " ")}
          </Text>
          <Text style={styles.helperText}>{evaluation.engine1AntiGaming.summary}</Text>
        </View>

        {/* Engine 2 */}
        <View style={styles.engineCard}>
          <Text style={styles.engineTitle}>
            Engine 2: Safe & Together™ DFV Pattern & Survivor Protective Efforts (
            {evaluation.engine2SafeAndTogether.survivorProtectiveCapacityScore}/100)
          </Text>
          <Text style={styles.helperText}>
            {evaluation.engine2SafeAndTogether.childSafetyImpactSummary}
          </Text>
        </View>

        {/* Engine 3 */}
        <View style={styles.engineCard}>
          <Text style={styles.engineTitle}>
            Engine 3: Couples & Family DFV Restoration Gate (
            {evaluation.engine3CouplesDfvRestoration.currentVerifiedStage.replace(/_/g, " ")})
          </Text>
          <Text style={styles.engineSub}>
            Symmetry: {evaluation.engine3CouplesDfvRestoration.dyadicSafetySymmetry} • Silent Pivot:{" "}
            {evaluation.engine3CouplesDfvRestoration.silentPivotActive ? "ACTIVE" : "INACTIVE"}
          </Text>
          <Text style={styles.helperText}>
            {evaluation.engine3CouplesDfvRestoration.recommendation}
          </Text>
        </View>

        {/* Engine 4 */}
        <View style={styles.engineCard}>
          <Text style={styles.engineTitle}>
            Engine 4: Parental Reflective Functioning & Mentalization (
            {evaluation.engine4ReflectiveFunctioning.overallRfScore}/100)
          </Text>
          <Text style={styles.helperText}>{evaluation.engine4ReflectiveFunctioning.summary}</Text>
        </View>

        {/* Engine 5 */}
        <View style={styles.engineCard}>
          <Text style={styles.engineTitle}>
            Engine 5: Tri-Morbid Dynamic Risk & Intersectionality Cascade (Risk:{" "}
            {evaluation.engine5TriMorbidIntersectionality.compositeDynamicRiskScore}/100)
          </Text>
          <Text style={styles.helperText}>
            {evaluation.engine5TriMorbidIntersectionality.cascadeMechanismSummary}
          </Text>
        </View>

        {/* Engine 6 */}
        <View style={styles.engineCard}>
          <Text style={styles.engineTitle}>
            Engine 6: Longitudinal RCI & Spaced Retention Synthesizer (Retention:{" "}
            {evaluation.engine6LongitudinalRci.spacedRetentionScore}/100)
          </Text>
          <Text style={styles.helperText}>{evaluation.engine6LongitudinalRci.summary}</Text>
        </View>

        {/* Engine 7 */}
        <View style={styles.engineCard}>
          <Text style={styles.engineTitle}>
            Engine 7: Neurodiversity, ABI & Poverty-vs-Neglect Fairness Evaluator
          </Text>
          <Text style={styles.helperText}>
            {evaluation.engine7NeurodiversityFairness.summary}
          </Text>
        </View>

        {/* Engine 8 */}
        <View style={styles.engineCard}>
          <Text style={styles.engineTitle}>
            Engine 8: Cultural Safety, First Nations SEWB & Anti-Bias Evaluator (
            {evaluation.engine8CulturalSewb.culturalSafetyScore}/100)
          </Text>
          <Text style={styles.helperText}>{evaluation.engine8CulturalSewb.summary}</Text>
        </View>

        {/* Engine 9 */}
        <View style={styles.engineCard}>
          <Text style={styles.engineTitle}>
            Engine 9: Psychometric Response Validity & Impression Management (
            {evaluation.engine9PsychometricValidity.aggregateValidityScore}/100)
          </Text>
          <Text style={styles.helperText}>
            {evaluation.engine9PsychometricValidity.clinicianAction}
          </Text>
        </View>

        {/* Engine 10 */}
        <View style={styles.engineCard}>
          <Text style={styles.engineTitle}>
            Engine 10: 360° Multi-Informant & 10-Form Convergence Engine (
            {evaluation.engine10MultiInformantConvergence.convergenceScore}/100)
          </Text>
          <Text style={styles.helperText}>
            {evaluation.engine10MultiInformantConvergence.summary}
          </Text>
        </View>
      </View>

      {/* PART C: SAFER Guided Judgement & Psychometric Competency Bridge */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          Part C: SAFER Guided Judgement & Psychometric Competency Profiles
        </Text>
        <Text style={styles.helperText}>
          SAFER Safety Score: {evaluation.saferJudgement.safetyScore}/100 • Evidence Coverage:{" "}
          {evaluation.saferJudgement.evidenceCoverageScore}% • Readiness Support:{" "}
          {evaluation.saferJudgement.readinessSupportScore}/100
        </Text>
        <Text style={styles.auditHashText}>
          Tamper-Evident SHA-256 Audit Hash: {evaluation.auditSha256}
        </Text>
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
  navBtnHighlight: {
    backgroundColor: "#2F7D5C",
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
  helperText: {
    color: "#3F5D64",
    fontSize: 13,
    lineHeight: 19,
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
  complianceCard: {
    backgroundColor: "#EDF7F2",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2F7D5C",
    gap: 6,
  },
  complianceTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#143642",
    lineHeight: 18,
  },
  complianceMeta: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1F5B42",
  },
  synthesisText: {
    fontSize: 13,
    color: "#1E3F47",
    lineHeight: 20,
    backgroundColor: "#F8FAFA",
    padding: 12,
    borderRadius: 10,
  },
  fivePGrid: {
    gap: 8,
  },
  pBox: {
    backgroundColor: "#F8FAFA",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0EAE8",
    gap: 4,
  },
  pBoxStrength: {
    backgroundColor: "#EDF7F2",
    borderColor: "#B7DFCC",
  },
  pHeader: {
    fontSize: 13,
    fontWeight: "900",
    color: "#143642",
  },
  pHeaderStrength: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1F5B42",
  },
  pBullet: {
    fontSize: 12,
    color: "#294850",
    lineHeight: 18,
  },
  engineCard: {
    backgroundColor: "#F8FAFA",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCE6E5",
    gap: 4,
  },
  engineTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#143642",
  },
  engineSub: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2F7D5C",
  },
  auditHashText: {
    fontSize: 11,
    color: "#6C8288",
  },
});
