import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  AssessmentScreenShell,
  assessmentColors,
} from "../../components/AssessmentSystemUI";
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
  calculateMilestoneProgressScore,
  calculateServiceCompletionScore,
  calculateVisitationQualityTrend,
  computeReadinessIndexFromSignals,
  scoreAssessment,
} from "../../lib/engines/assessmentScoringEngine";

export default function ReadinessIndexScreen() {
  const assessmentScore = useMemo(
    () =>
      scoreAssessment({
        domains: safeStepsProtectiveCapacityDomains,
        items: safeStepsProtectiveCapacityItems,
        responses: safeStepsDefaultResponses,
        overrides: safeStepsCriticalOverrides,
        bands: safeStepsScoringBands,
      }),
    [],
  );

  const readiness = useMemo(
    () =>
      computeReadinessIndexFromSignals({
        assessmentScore: assessmentScore.overallScore,
        serviceReferrals: sampleServiceReferrals,
        visitations: sampleVisitations,
        milestones: sampleMilestones,
        activeCriticalOverride: assessmentScore.overrideTriggered,
      }),
    [assessmentScore],
  );

  const serviceScore = calculateServiceCompletionScore(sampleServiceReferrals);
  const visitationScore = calculateVisitationQualityTrend(sampleVisitations);
  const milestoneScore = calculateMilestoneProgressScore(sampleMilestones);

  return (
    <AssessmentScreenShell
      title="Reunification Readiness Index"
      subtitle="Decision support that combines assessment scores, service completion, contact quality, milestones, and critical safety overrides."
    >
      <View style={styles.exampleNotice}>
        <Text style={styles.exampleTitle}>Example calculation only</Text>
        <Text style={styles.summaryText}>
          This readiness view currently uses sample responses, referrals, visitations, and milestones. It is not a live reunification recommendation.
        </Text>
      </View>

      <View style={readiness.suppressedByOverride ? styles.reviewCard : styles.summaryCard}>
        <Text style={styles.summaryLabel}>Readiness support score</Text>
        <Text style={styles.summaryScore}>
          {readiness.compositeScore == null ? "Review" : `${readiness.compositeScore}%`}
        </Text>
        <Text style={styles.summaryText}>{readiness.recommendation}</Text>
      </View>

      <View style={styles.signalGrid}>
        <SignalCard label="Assessment" value={assessmentScore.overallScore} />
        <SignalCard label="Services" value={serviceScore} />
        <SignalCard label="Contact quality" value={visitationScore} />
        <SignalCard label="Milestones" value={milestoneScore} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Safety controls</Text>
        <Text style={styles.body}>
          Critical safety findings suppress readiness instead of being averaged away. This screen is decision support only; supervisor and case-team review remain required before any reunification-level change.
        </Text>
        {readiness.flags.length ? (
          readiness.flags.map((flag) => (
            <Text key={flag} style={styles.flagText}>{flag}</Text>
          ))
        ) : (
          <Text style={styles.body}>No missing signal or critical-override flags in the current example.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>How the index is weighted</Text>
        {readiness.signals.map((signal) => (
          <View key={signal.label} style={styles.weightRow}>
            <Text style={styles.weightLabel}>{signal.label}</Text>
            <Text style={styles.weightValue}>{Math.round(signal.weight * 100)}%</Text>
          </View>
        ))}
      </View>
    </AssessmentScreenShell>
  );
}

function SignalCard({ label, value }: { label: string; value: number | null }) {
  return (
    <View style={styles.signalCard}>
      <Text style={styles.signalLabel}>{label}</Text>
      <Text style={styles.signalValue}>{value == null ? "Missing" : `${value}%`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  summaryCard: {
    gap: 8,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: assessmentColors.sage,
  },
  reviewCard: {
    gap: 8,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D56A4D",
    backgroundColor: "#FFF2ED",
  },
  summaryLabel: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
  },
  summaryScore: {
    color: assessmentColors.charcoal,
    fontSize: 38,
    fontWeight: "900",
  },
  summaryText: {
    color: assessmentColors.muted,
    lineHeight: 21,
  },
  signalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  signalCard: {
    flexGrow: 1,
    flexBasis: 150,
    gap: 6,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  signalLabel: {
    color: assessmentColors.muted,
    fontWeight: "800",
  },
  signalValue: {
    color: assessmentColors.tealDark,
    fontSize: 24,
    fontWeight: "900",
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
  body: {
    color: assessmentColors.muted,
    lineHeight: 21,
  },
  flagText: {
    color: "#9E2B25",
    fontWeight: "900",
  },
  weightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F0",
  },
  weightLabel: {
    color: assessmentColors.charcoal,
    fontWeight: "800",
  },
  weightValue: {
    color: assessmentColors.tealDark,
    fontWeight: "900",
  },
});
