import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";
import {
  aodMhDfvCriticalOverrides,
  aodMhDfvDefaultResponses,
  aodMhDfvDomains,
  aodMhDfvItems,
  aodMhDfvScoringBands,
  evaluateAodMhDfvCrossDomainRules,
} from "../../lib/data/aodMhDfvAssessmentInstrument";
import {
  safeStepsCriticalOverrides,
  safeStepsDefaultResponses,
  safeStepsProtectiveCapacityDomains,
  safeStepsProtectiveCapacityItems,
  safeStepsScoringBands,
  sampleMilestones,
  sampleServiceReferrals,
  sampleVisitations,
} from "../../lib/data/safeStepsAssessmentInstrument";
import {
  computeReadinessIndexFromSignals,
  scoreAssessment,
  type AssessmentResponse,
} from "../../lib/engines/assessmentScoringEngine";

type ScoringInstrumentKey = "protective-capacity" | "aod-mh-dfv";

const scoringInstruments = {
  "protective-capacity": {
    label: "Protective Capacity",
    subtitle: "Score safety, protective capacity, routines, child voice, service engagement, and evidence consistency.",
    domains: safeStepsProtectiveCapacityDomains,
    items: safeStepsProtectiveCapacityItems,
    responses: safeStepsDefaultResponses,
    overrides: safeStepsCriticalOverrides,
    bands: safeStepsScoringBands,
    scoreLabel: "Assessment score",
    readinessEnabled: true,
  },
  "aod-mh-dfv": {
    label: "AOD/MH/DFV Risk",
    subtitle:
      "Score co-occurring substance-use, mental-health, family-violence, perpetrator-accountability, and child-impact risks.",
    domains: aodMhDfvDomains,
    items: aodMhDfvItems,
    responses: aodMhDfvDefaultResponses,
    overrides: aodMhDfvCriticalOverrides,
    bands: aodMhDfvScoringBands,
    scoreLabel: "Concern score",
    readinessEnabled: false,
  },
} as const;

function responseMapFromList(responses: AssessmentResponse[]) {
  return Object.fromEntries(
    responses.map((response) => [response.itemId, response.selectedOptionId ?? ""]),
  );
}

export default function RubricScoringScreen() {
  const [instrumentKey, setInstrumentKey] = useState<ScoringInstrumentKey>("protective-capacity");
  const activeInstrument = scoringInstruments[instrumentKey];
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    responseMapFromList(activeInstrument.responses),
  );

  useEffect(() => {
    setSelectedOptions(responseMapFromList(activeInstrument.responses));
  }, [activeInstrument]);

  const responses = useMemo<AssessmentResponse[]>(
    () =>
      Object.entries(selectedOptions).map(([itemId, selectedOptionId]) => ({
        itemId,
        selectedOptionId,
      })),
    [selectedOptions],
  );

  const scoreResult = useMemo(
    () =>
      scoreAssessment({
        domains: activeInstrument.domains,
        items: activeInstrument.items,
        responses,
        overrides: activeInstrument.overrides,
        bands: activeInstrument.bands,
      }),
    [activeInstrument, responses],
  );

  const aodMhDfvRuleFlags = useMemo(() => {
    if (instrumentKey !== "aod-mh-dfv") return [];

    return evaluateAodMhDfvCrossDomainRules({
      triggeredOverrideIds: scoreResult.override ? [scoreResult.override.id] : [],
      currentDomainScores: Object.fromEntries(
        scoreResult.domainScores.map((score) => [score.domainId, score.normalizedScore]),
      ),
      previousDomainScores: { AOD_IMPACT: 50 },
    });
  }, [instrumentKey, scoreResult]);

  const readiness = useMemo(
    () => {
      if (!activeInstrument.readinessEnabled) return null;

      return computeReadinessIndexFromSignals({
        assessmentScore: scoreResult.overallScore,
        serviceReferrals: sampleServiceReferrals,
        visitations: sampleVisitations,
        milestones: sampleMilestones,
        activeCriticalOverride: scoreResult.overrideTriggered,
      });
    },
    [activeInstrument.readinessEnabled, scoreResult],
  );

  function selectOption(itemId: string, selectedOptionId: string) {
    setSelectedOptions((current) => ({
      ...current,
      [itemId]: selectedOptionId,
    }));
  }

  return (
    <AssessmentScreenShell
      title="Assessment Scoring"
      subtitle="Score SafeSteps instruments with weighted domains, critical overrides, and review gates that cannot average away active safety concerns."
    >
      <View style={styles.instrumentTabs}>
        {(Object.keys(scoringInstruments) as ScoringInstrumentKey[]).map((key) => {
          const instrument = scoringInstruments[key];
          const active = key === instrumentKey;

          return (
            <Pressable
              key={key}
              onPress={() => setInstrumentKey(key)}
              style={active ? styles.instrumentTabActive : styles.instrumentTab}
            >
              <Text style={active ? styles.instrumentTabTextActive : styles.instrumentTabText}>
                {instrument.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.exampleNotice}>
        <Text style={styles.exampleTitle}>Calibration preview only</Text>
        <Text style={styles.summaryText}>
          {activeInstrument.subtitle} This screen uses built-in calibration responses to verify scoring logic. Do not
          treat these scores as a live case result until connected to saved assessment records and reviewed evidence.
        </Text>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{activeInstrument.scoreLabel}</Text>
          <Text style={styles.summaryValue}>{scoreResult.overallScore}%</Text>
          <Text style={styles.summaryText}>{scoreResult.band?.label ?? "No band matched"}</Text>
        </View>
        {readiness ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Readiness index</Text>
            <Text style={styles.summaryValue}>
              {readiness.compositeScore == null ? "Review" : `${readiness.compositeScore}%`}
            </Text>
            <Text style={styles.summaryText}>{readiness.recommendation}</Text>
          </View>
        ) : (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>RRI handling</Text>
            <Text style={styles.summaryValue}>Review</Text>
            <Text style={styles.summaryText}>
              AOD/MH/DFV concern scores are risk signals. Critical overrides cap readiness reliance and require
              supervisor review before any reunification-level interpretation.
            </Text>
          </View>
        )}
      </View>

      {scoreResult.overrideTriggered ? (
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>Supervisor review required</Text>
          <Text style={styles.alertText}>{scoreResult.override?.reason}</Text>
        </View>
      ) : null}

      {aodMhDfvRuleFlags.length ? (
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>Cross-domain rule flags</Text>
          {aodMhDfvRuleFlags.map((flag) => (
            <Text key={flag.ruleCode} style={styles.alertText}>
              {flag.ruleCode}: {flag.flagText}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Domain scores</Text>
        {scoreResult.domainScores.map((domainScore) => {
          const domain = activeInstrument.domains.find((item) => item.id === domainScore.domainId);
          return (
            <View key={domainScore.domainId} style={styles.domainRow}>
              <View style={styles.domainCopy}>
                <Text style={styles.domainTitle}>{domain?.name ?? domainScore.domainId}</Text>
                <Text style={styles.domainMeta}>
                  Raw {domainScore.rawScore}/{domainScore.maxPossible}
                </Text>
              </View>
              <Text style={styles.domainScore}>{domainScore.normalizedScore}%</Text>
            </View>
          );
        })}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bandRow}>
        {activeInstrument.bands.map((band) => (
          <View key={band.id} style={band.id === scoreResult.band?.id ? styles.bandCardActive : styles.bandCard}>
            <Text style={styles.bandLabel}>{band.label}</Text>
            <Text style={styles.bandRange}>{band.minScore}-{band.maxScore}%</Text>
            {band.requiresSupervisorReview ? <Text style={styles.bandReview}>Review</Text> : null}
          </View>
        ))}
      </ScrollView>

      <View style={styles.list}>
        {activeInstrument.items.map((item) => {
          const domain = activeInstrument.domains.find((candidate) => candidate.id === item.domainId);
          const selectedOptionId = selectedOptions[item.id];
          return (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.itemDomain}>{domain?.name}</Text>
              <Text style={styles.itemPrompt}>{item.id.replace(/-/g, " ")}</Text>
              <View style={styles.optionGrid}>
                {(item.options ?? []).map((option) => {
                  const active = selectedOptionId === option.id;
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => selectOption(item.id, option.id)}
                      style={active ? styles.optionButtonActive : styles.optionButton}
                    >
                      <Text style={active ? styles.optionTextActive : styles.optionText}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  instrumentTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  instrumentTab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  instrumentTabActive: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.tealDark,
    backgroundColor: assessmentColors.sage,
  },
  instrumentTabText: {
    color: assessmentColors.muted,
    fontWeight: "900",
  },
  instrumentTabTextActive: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
  },
  exampleNotice: {
    gap: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B45309",
    backgroundColor: "#FFFBEB",
  },
  exampleTitle: {
    color: "#92400E",
    fontSize: 16,
    fontWeight: "900",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: 220,
    gap: 6,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: assessmentColors.sage,
  },
  summaryLabel: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
  },
  summaryValue: {
    color: assessmentColors.charcoal,
    fontSize: 34,
    fontWeight: "900",
  },
  summaryText: {
    color: assessmentColors.muted,
    lineHeight: 20,
  },
  alertCard: {
    gap: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D56A4D",
    backgroundColor: "#FFF2ED",
  },
  alertTitle: {
    color: "#9E2B25",
    fontSize: 18,
    fontWeight: "900",
  },
  alertText: {
    color: "#4A2A21",
    lineHeight: 21,
  },
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    color: assessmentColors.charcoal,
    fontSize: 20,
    fontWeight: "900",
  },
  domainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F0",
  },
  domainCopy: {
    flex: 1,
  },
  domainTitle: {
    color: assessmentColors.charcoal,
    fontWeight: "900",
  },
  domainMeta: {
    color: assessmentColors.muted,
    marginTop: 3,
  },
  domainScore: {
    color: assessmentColors.tealDark,
    fontSize: 20,
    fontWeight: "900",
  },
  bandRow: {
    gap: 10,
  },
  bandCard: {
    width: 180,
    gap: 6,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  bandCardActive: {
    width: 180,
    gap: 6,
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: assessmentColors.teal,
    backgroundColor: "#F1FBF8",
  },
  bandLabel: {
    color: assessmentColors.charcoal,
    fontWeight: "900",
  },
  bandRange: {
    color: assessmentColors.muted,
  },
  bandReview: {
    color: "#9E2B25",
    fontWeight: "900",
  },
  list: {
    gap: 12,
  },
  itemCard: {
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  itemDomain: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
  },
  itemPrompt: {
    color: assessmentColors.charcoal,
    fontSize: 17,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    flexGrow: 1,
    flexBasis: 170,
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    padding: 10,
    backgroundColor: "#FFFFFF",
  },
  optionButtonActive: {
    flexGrow: 1,
    flexBasis: 170,
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: assessmentColors.teal,
    padding: 10,
    backgroundColor: assessmentColors.teal,
  },
  optionText: {
    color: assessmentColors.charcoal,
    fontWeight: "800",
  },
  optionTextActive: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
});
