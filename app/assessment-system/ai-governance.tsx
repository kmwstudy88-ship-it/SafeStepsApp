import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  AssessmentCard,
  AssessmentScreenShell,
  ChipList,
  StatusPill,
  assessmentColors,
  assessmentStyles,
} from "../../components/AssessmentSystemUI";
import {
  aiGovernanceVolumes,
  evaluateAiAutomationBoundary,
  getAiGovernanceLiveSummary,
  getAiGovernanceReadinessSummary,
  prohibitedAiDecisionExamples,
  type AiGovernanceLiveSummary,
} from "../../lib/engines/aiGovernanceEngine";

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

const boundaryPreview = evaluateAiAutomationBoundary({
  proposedAction: "draft court-facing safety summary",
  containsChildData: true,
  isCourtFacing: true,
  isSafetyCritical: true,
  hasHumanReviewer: true,
  hasSourceCitations: true,
});

export default function AiGovernanceScreen() {
  const summary = getAiGovernanceReadinessSummary();
  const [liveSummary, setLiveSummary] = useState<AiGovernanceLiveSummary | null>(null);

  useEffect(() => {
    let mounted = true;

    getAiGovernanceLiveSummary()
      .then((result) => {
        if (mounted) setLiveSummary(result);
      })
      .catch(() => {
        if (mounted) setLiveSummary(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AssessmentScreenShell
      title="AI Governance & Responsible Automation"
      subtitle="Govern approved AI use, model lifecycle, prompt workflows, data provenance, guardrails, fairness, human review, monitoring, incidents, and audit exports."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AssessmentCard tone="success">
          <View style={styles.summaryHeader}>
            <View>
              <Text style={assessmentStyles.cardTitle}>Governance Foundation</Text>
              <Text style={assessmentStyles.cardText}>
                {summary.implemented} of {summary.total} governance volumes now have database-backed records.
              </Text>
            </View>
            <StatusPill label={summary.readyForRuntimeIntegration ? "Runtime ready" : "Config needed"} tone="success" />
          </View>
          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{summary.tableCount}</Text>
              <Text style={assessmentStyles.metaLabel}>Core tables</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>RLS</Text>
              <Text style={assessmentStyles.metaLabel}>Enabled on new records</Text>
            </View>
          </View>
        </AssessmentCard>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Live Governance Records</Text>
          <Text style={assessmentStyles.cardText}>
            Counts load through Supabase RLS. Restricted records remain hidden unless the signed-in user has governance permission.
          </Text>
          <View style={styles.liveGrid}>
            {(liveSummary?.metrics ?? []).map((metric) => (
              <View key={metric.table} style={styles.liveMetric}>
                <Text style={styles.liveValue}>{metric.available ? metric.count : "Locked"}</Text>
                <Text style={assessmentStyles.metaLabel}>{metric.label}</Text>
              </View>
            ))}
            {!liveSummary ? (
              <View style={styles.liveMetric}>
                <Text style={styles.liveValue}>...</Text>
                <Text style={assessmentStyles.metaLabel}>Loading governance records</Text>
              </View>
            ) : null}
          </View>
          {liveSummary?.unavailableCount ? (
            <StatusPill label={`${liveSummary.unavailableCount} restricted by RLS`} tone="warning" />
          ) : null}
        </AssessmentCard>

        <AssessmentCard tone="risk">
          <Text style={assessmentStyles.cardTitle}>AI Must Not Finalise</Text>
          <Text style={assessmentStyles.cardText}>
            AI can support drafting, explanation, triage, and review preparation, but high-impact decisions stay with accountable people.
          </Text>
          <ChipList items={prohibitedAiDecisionExamples} />
        </AssessmentCard>

        <View style={styles.grid}>
          {aiGovernanceVolumes.map((volume) => (
            <AssessmentCard key={volume.id}>
              <View style={styles.cardHeader}>
                <Text style={assessmentStyles.cardTitle}>{volume.title}</Text>
                <StatusPill label={formatLabel(volume.status)} />
              </View>
              <Text style={assessmentStyles.cardText}>{volume.purpose}</Text>
              <Text style={assessmentStyles.metaLabel}>Release gate</Text>
              <Text style={assessmentStyles.metaValue}>{volume.releaseGate}</Text>
              <ChipList items={volume.tables} />
            </AssessmentCard>
          ))}
        </View>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Boundary Check Preview</Text>
          <Text style={assessmentStyles.cardText}>
            This example is allowed only as a reviewed, cited, court-facing draft. It remains blocked from finalising safety findings or report release.
          </Text>
          <View style={styles.levelCard}>
            <StatusPill label={formatLabel(boundaryPreview.requiredOversight)} tone="warning" />
            <ChipList items={boundaryPreview.reviewFlags} />
          </View>
        </AssessmentCard>
      </ScrollView>
    </AssessmentScreenShell>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 24 },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  metricRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  metricCard: {
    flexGrow: 1,
    flexBasis: 180,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  metricValue: { color: assessmentColors.charcoal, fontSize: 24, fontWeight: "800" },
  liveGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  liveMetric: {
    flexGrow: 1,
    flexBasis: 150,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  liveValue: { color: assessmentColors.tealDark, fontSize: 20, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  cardHeader: { gap: 8 },
  levelCard: {
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
});
