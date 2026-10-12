import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  CLINICAL_AND_PARENTING_SCALES,
  CLINICAL_SCALE_CATEGORIES,
  computeReliableChangeIndex,
  getClinicalScalesByCategory,
  scoreClinicalScale,
  type ClinicalScaleAdministrationForm,
  type ClinicalScaleCategoryId,
  type ClinicalScaleScoreOutput,
} from "../../lib/data/clinicalAndParentingScales";

export default function ClinicalAndParentingScalesHubScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] =
    useState<ClinicalScaleCategoryId>("dfv_couples_restoration");
  const [selectedScaleId, setSelectedScaleId] = useState<string>("dfv_safety_coercive");
  const [administrationForm, setAdministrationForm] =
    useState<ClinicalScaleAdministrationForm>("standard_scale");
  const [easyReadMode, setEasyReadMode] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [baselineRawScore, setBaselineRawScore] = useState<number>(8);
  const [completedScreenings, setCompletedScreenings] = useState<ClinicalScaleScoreOutput[]>([]);

  const categoryScales = useMemo(
    () => getClinicalScalesByCategory(selectedCategory),
    [selectedCategory],
  );

  const activeScale = useMemo(
    () =>
      CLINICAL_AND_PARENTING_SCALES.find((s) => s.id === selectedScaleId) ??
      categoryScales[0] ??
      CLINICAL_AND_PARENTING_SCALES[0],
    [selectedScaleId, categoryScales],
  );

  const currentScoreOutput = useMemo(() => {
    const responses = activeScale.items.map((item) => ({
      itemId: item.id,
      selectedOptionId: selectedOptions[item.id] ?? item.options[0]?.id,
      responseTimeMs: 3200,
    }));
    return scoreClinicalScale(activeScale.id, responses, administrationForm);
  }, [activeScale, selectedOptions, administrationForm]);

  const currentRciOutput = useMemo(
    () =>
      computeReliableChangeIndex({
        scaleId: activeScale.id,
        baselineRaw: baselineRawScore,
        currentRaw: currentScoreOutput.rawScore,
      }),
    [activeScale.id, baselineRawScore, currentScoreOutput.rawScore],
  );

  function handleRecordScreening() {
    setCompletedScreenings((prev) => [
      currentScoreOutput,
      ...prev.filter((s) => s.scaleId !== currentScoreOutput.scaleId),
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>
          {CLINICAL_AND_PARENTING_SCALES.length} VALIDATED INSTRUMENTS ACROSS 10 DOMAINS • EMBEDDED
          VALIDITY & RCI
        </Text>
        <Text style={styles.heroTitle}>
          Clinical, Parenting, DFV, Addiction, Perinatal, Neurodiversity & Child Scales Hub
        </Text>
        <Text style={styles.heroSubtitle}>
          Every scale includes embedded response validity checks (Impression Management, Semantic
          Pair Consistency, Straight-Lining), critical safety overrides, and Jacobson & Truax (1991)
          Reliable Change Index (RCI) calculation.
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
            onPress={() => router.push("/assessment-system/ai-psychologist-evaluator" as never)}
          >
            <Text style={styles.navBtnText}>5P Formulation & 10 Evaluators →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Step 1: Select Domain Category */}
      <View style={styles.sectionCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>1. Select Assessment Category (10 Domains)</Text>
          <TouchableOpacity
            onPress={() => setEasyReadMode((v) => !v)}
            style={[styles.chip, easyReadMode && styles.chipActive]}
          >
            <Text style={[styles.chipText, easyReadMode && styles.chipTextActive]}>
              {easyReadMode ? "✓ Easy-Read Mode Active" : "Enable Easy-Read"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chipRow}>
          {CLINICAL_SCALE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => {
                setSelectedCategory(cat.id);
                const firstScale = getClinicalScalesByCategory(cat.id)[0];
                if (firstScale) {
                  setSelectedScaleId(firstScale.id);
                }
              }}
              style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Step 2: Select Specific Scale in Category */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>2. Choose Scale Instrument</Text>
        <View style={styles.chipRow}>
          {categoryScales.map((scale) => (
            <TouchableOpacity
              key={scale.id}
              onPress={() => setSelectedScaleId(scale.id)}
              style={[styles.chip, activeScale.id === scale.id && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, activeScale.id === scale.id && styles.chipTextActive]}
              >
                {scale.shortTitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.scaleMetaBox}>
          <Text style={styles.scaleCodeText}>
            {activeScale.code} • {activeScale.sourceReference}
          </Text>
          <Text style={styles.scaleTitleText}>{activeScale.title}</Text>
          <Text style={styles.helperText}>{activeScale.description}</Text>
          <Text style={styles.scalePsychometricsText}>
            Test-Retest r = {activeScale.testRetestR} • Normative SD = {activeScale.normativeSd} •
            Clinical Cutoff = {activeScale.clinicalCutoffRaw}/{activeScale.maxRawScore}
          </Text>
        </View>

        {/* Administration Form Selector */}
        <Text style={styles.fieldLabel}>Administration Modality:</Text>
        <View style={styles.chipRow}>
          {(
            [
              { id: "standard_scale", label: "Standard Psychometric" },
              { id: "sjt_vignette", label: "Disguised SJT Vignette" },
              { id: "ema_micro_pulse", label: "15s EMA Micro-Pulse" },
              { id: "spaced_retest", label: "Spaced Retention Re-Test" },
              { id: "external_clinician_import", label: "Clinician Import" },
            ] as const
          ).map((form) => (
            <TouchableOpacity
              key={form.id}
              onPress={() => setAdministrationForm(form.id)}
              style={[styles.chip, administrationForm === form.id && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, administrationForm === form.id && styles.chipTextActive]}
              >
                {form.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Step 3: Interactive Scale Items */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>3. Complete Items ({activeScale.shortTitle})</Text>
        {activeScale.items.map((item, idx) => {
          const chosenId = selectedOptions[item.id] ?? item.options[0]?.id;
          return (
            <View key={item.id} style={styles.itemBox}>
              <Text style={styles.itemPrompt}>
                {idx + 1}. {easyReadMode && item.easyReadPrompt ? item.easyReadPrompt : item.prompt}
              </Text>
              <View style={styles.optionsList}>
                {item.options.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() =>
                      setSelectedOptions((prev) => ({
                        ...prev,
                        [item.id]: opt.id,
                      }))
                    }
                    style={[
                      styles.optionBtn,
                      chosenId === opt.id && styles.optionBtnActive,
                      opt.triggersCriticalOverride &&
                        chosenId === opt.id &&
                        styles.optionBtnCritical,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionBtnText,
                        chosenId === opt.id && styles.optionBtnTextActive,
                      ]}
                    >
                      {easyReadMode && opt.easyReadLabel ? opt.easyReadLabel : opt.label} (
                      {opt.score})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        <TouchableOpacity onPress={handleRecordScreening} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>
            Save & Add {activeScale.shortTitle} to Case Formulation Battery
          </Text>
        </TouchableOpacity>
      </View>

      {/* Step 4: Live Scoring, Validity & RCI Results */}
      <View
        style={[
          styles.resultCard,
          currentScoreOutput.criticalOverrideTriggered && styles.resultCardCritical,
        ]}
      >
        <Text style={styles.resultHeader}>
          Live Score & Psychometric Validity ({currentScoreOutput.scaleTitle})
        </Text>
        <Text style={styles.scoreBig}>
          Raw: {currentScoreOutput.rawScore}/{currentScoreOutput.maxRawScore} • Normalized:{" "}
          {currentScoreOutput.normalizedScore}% • Band: {currentScoreOutput.band.label}
        </Text>
        <Text style={styles.helperText}>{currentScoreOutput.band.interpretation}</Text>
        <Text style={styles.actionText}>
          Recommended Action: {currentScoreOutput.band.recommendedAction}
        </Text>

        {currentScoreOutput.criticalOverrideTriggered ? (
          <View style={styles.criticalBox}>
            <Text style={styles.criticalTitle}>CRITICAL SAFETY OVERRIDE TRIGGERED:</Text>
            {currentScoreOutput.criticalOverrideReasons.map((reason) => (
              <Text key={reason} style={styles.criticalReason}>
                • {reason}
              </Text>
            ))}
          </View>
        ) : null}

        {/* Embedded Validity Check Output */}
        <View style={styles.validityBox}>
          <Text style={styles.validityTitle}>
            Embedded Validity & Anti-Gaming Status:{" "}
            {currentScoreOutput.validity.overallValidityBand.toUpperCase()} (Score:{" "}
            {currentScoreOutput.validity.validityScore}/100)
          </Text>
          <Text style={styles.helperText}>{currentScoreOutput.validity.clinicianGuidance}</Text>
        </View>

        {/* Jacobson & Truax (1991) Reliable Change Index Calculator */}
        <View style={styles.rciBox}>
          <Text style={styles.validityTitle}>
            Longitudinal Reliable Change Index (Jacobson & Truax, 1991)
          </Text>
          <Text style={styles.fieldLabel}>
            Compare Against Baseline Raw Score ({baselineRawScore}/{activeScale.maxRawScore}):
          </Text>
          <View style={styles.chipRow}>
            {[2, 5, 8, 10, 12].map((b) => (
              <TouchableOpacity
                key={b}
                onPress={() => setBaselineRawScore(b)}
                style={[styles.chip, baselineRawScore === b && styles.chipActive]}
              >
                <Text style={[styles.chipText, baselineRawScore === b && styles.chipTextActive]}>
                  Baseline {b}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.rciSummaryText}>{currentRciOutput.summary}</Text>
          <Text style={styles.scalePsychometricsText}>
            RCI = {currentRciOutput.rciValue} (SE_diff ={" "}
            {currentRciOutput.standardErrorOfDifference}) • Statistically Reliable (|RCI| &ge;
            1.96): {currentRciOutput.statisticallyReliable ? "YES" : "NO"}
          </Text>
        </View>
      </View>

      {completedScreenings.length > 0 ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Recorded Screenings in Current Session ({completedScreenings.length})
          </Text>
          {completedScreenings.map((s) => (
            <View key={s.scaleId} style={styles.savedRow}>
              <Text style={styles.savedTitle}>
                {s.scaleTitle}: {s.rawScore}/{s.maxRawScore} ({s.band.label})
              </Text>
              <Text style={styles.scalePsychometricsText}>
                Validity: {s.validity.validityScore}/100 • Form: {s.administrationForm}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
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
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  sectionTitle: {
    color: "#143642",
    fontSize: 16,
    fontWeight: "900",
  },
  helperText: {
    color: "#456268",
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
  scaleMetaBox: {
    backgroundColor: "#F2F8F5",
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  scaleCodeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2F7D5C",
  },
  scaleTitleText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#143642",
  },
  scalePsychometricsText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#456268",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#143642",
  },
  itemBox: {
    backgroundColor: "#F8FAFA",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2ECEA",
    gap: 8,
  },
  itemPrompt: {
    fontSize: 13,
    fontWeight: "800",
    color: "#143642",
    lineHeight: 19,
  },
  optionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  optionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CFDCD9",
  },
  optionBtnActive: {
    backgroundColor: "#2F7D5C",
    borderColor: "#2F7D5C",
  },
  optionBtnCritical: {
    backgroundColor: "#B91C1C",
    borderColor: "#B91C1C",
  },
  optionBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#143642",
  },
  optionBtnTextActive: {
    color: "#FFFFFF",
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
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: "#2F7D5C",
    gap: 10,
  },
  resultCardCritical: {
    borderColor: "#B91C1C",
    backgroundColor: "#FEF2F2",
  },
  resultHeader: {
    fontSize: 15,
    fontWeight: "900",
    color: "#143642",
  },
  scoreBig: {
    fontSize: 14,
    fontWeight: "900",
    color: "#2F7D5C",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#143642",
  },
  criticalBox: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  criticalTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#991B1B",
  },
  criticalReason: {
    fontSize: 12,
    fontWeight: "700",
    color: "#991B1B",
  },
  validityBox: {
    backgroundColor: "#F2F8F5",
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  validityTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#143642",
  },
  rciBox: {
    backgroundColor: "#F8FAFA",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCE6E5",
    gap: 6,
  },
  rciSummaryText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1F5B42",
  },
  savedRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E5ECEA",
  },
  savedTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#143642",
  },
});
