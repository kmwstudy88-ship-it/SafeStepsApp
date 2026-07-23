import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  AssessmentCard,
  AssessmentScreenShell,
  StatusPill,
  assessmentColors,
} from "../../components/AssessmentSystemUI";
import { evaluateHomeAgainTransition } from "../../lib/engines/homeAgainTransitionEngine";

const stablePreview = evaluateHomeAgainTransition({
  caseId: "calibration-case",
  parentProfileId: "calibration-parent",
  weeksAtHome: [
    {
      id: "week-1",
      weekStart: "2026-07-01",
      homeRoutineConsistencyScore: 5,
      childAdjustmentScore: 4,
      parentRegulationScore: 5,
      supportUseScore: 4,
      schoolHealthCommunityStabilityScore: 4,
      riskFlags: [],
    },
    {
      id: "week-2",
      weekStart: "2026-07-08",
      homeRoutineConsistencyScore: 4,
      childAdjustmentScore: 4,
      parentRegulationScore: 5,
      supportUseScore: 4,
      schoolHealthCommunityStabilityScore: 4,
      riskFlags: [],
    },
    {
      id: "week-3",
      weekStart: "2026-07-15",
      homeRoutineConsistencyScore: 5,
      childAdjustmentScore: 5,
      parentRegulationScore: 4,
      supportUseScore: 4,
      schoolHealthCommunityStabilityScore: 4,
      riskFlags: [],
    },
    {
      id: "week-4",
      weekStart: "2026-07-22",
      homeRoutineConsistencyScore: 5,
      childAdjustmentScore: 4,
      parentRegulationScore: 5,
      supportUseScore: 5,
      schoolHealthCommunityStabilityScore: 4,
      riskFlags: [],
    },
  ],
  maintenancePlan: {
    safetyPlanCurrent: true,
    supportNetworkConfirmed: true,
    relapsePreventionPlanCurrent: true,
    childVoiceReviewed: true,
    schoolHealthPlanCurrent: true,
    reviewMeetingBooked: true,
  },
});

const setbackPreview = evaluateHomeAgainTransition({
  caseId: "calibration-case",
  parentProfileId: "calibration-parent",
  weeksAtHome: [
    {
      id: "week-1",
      weekStart: "2026-07-01",
      homeRoutineConsistencyScore: 3,
      childAdjustmentScore: 3,
      parentRegulationScore: 3,
      supportUseScore: 2,
      schoolHealthCommunityStabilityScore: 3,
      childDistressSpike: true,
      missedCriticalRoutineCount: 2,
      riskFlags: [{ code: "child_distress_spike", severity: "amber" }],
    },
  ],
  maintenancePlan: {
    safetyPlanCurrent: true,
    supportNetworkConfirmed: false,
    relapsePreventionPlanCurrent: false,
    childVoiceReviewed: true,
    schoolHealthPlanCurrent: false,
    reviewMeetingBooked: false,
  },
});

export default function HomeAgainTransitionReviewScreen() {
  return (
    <AssessmentScreenShell
      title="Home Again Transition Review"
      subtitle="Worker-review support for return-home stability, child adjustment, routines, support use, setbacks, and maintenance planning."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Calibration preview only</Text>
          <Text style={styles.body}>
            These examples show how Home Again review gates behave. Use live weekly records before relying on this view
            for case planning, and keep any transition decision with the caseworker and case team.
          </Text>
        </View>

        <AssessmentCard tone="success">
          <View style={styles.headerRow}>
            <Text style={styles.cardTitle}>Stable return-home pathway</Text>
            <StatusPill label={stablePreview.recommendation.replace(/_/g, " ")} tone="success" />
          </View>
          <Metric label="Stability score" value={`${stablePreview.stabilityScore}/5`} />
          <Metric label="Risk level" value={stablePreview.riskLevel} />
          <Metric label="Can step down" value={stablePreview.canStepDown ? "Case-team review eligible" : "No"} />
          <Text style={styles.body}>{stablePreview.reportLanguage}</Text>
        </AssessmentCard>

        <AssessmentCard tone="risk">
          <View style={styles.headerRow}>
            <Text style={styles.cardTitle}>Setback review pathway</Text>
            <StatusPill label={setbackPreview.recommendation.replace(/_/g, " ")} tone="risk" />
          </View>
          <Metric label="Stability score" value={`${setbackPreview.stabilityScore}/5`} />
          <Metric label="Risk level" value={setbackPreview.riskLevel} />
          <Metric label="Return to intensive" value={setbackPreview.shouldReturnToIntensive ? "Review required" : "No"} />
          <Text style={styles.subheading}>Hard blocks</Text>
          {setbackPreview.hardBlocks.map((block) => (
            <Text key={block} style={styles.warningText}>- {block}</Text>
          ))}
          <Text style={styles.subheading}>Required interventions</Text>
          {setbackPreview.requiredInterventions.map((intervention) => (
            <Text key={intervention} style={styles.body}>- {intervention.replace(/_/g, " ")}</Text>
          ))}
        </AssessmentCard>

        <AssessmentCard>
          <Text style={styles.cardTitle}>Home Again completion gates</Text>
          {[
            "Four or more weeks of stable return-home evidence",
            "Consistent home routines and child adjustment",
            "Reliable parent regulation and support use",
            "No amber/red safety flags or child distress spikes",
            "Current maintenance plan with child voice and review meeting recorded",
          ].map((item) => (
            <Text key={item} style={styles.body}>- {item}</Text>
          ))}
        </AssessmentCard>
      </ScrollView>
    </AssessmentScreenShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 28,
  },
  notice: {
    gap: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: assessmentColors.amber,
  },
  noticeTitle: {
    color: assessmentColors.amberText,
    fontSize: 16,
    fontWeight: "800",
  },
  headerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cardTitle: {
    color: assessmentColors.charcoal,
    fontSize: 20,
    fontWeight: "800",
  },
  body: {
    color: assessmentColors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  subheading: {
    color: assessmentColors.charcoal,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  metric: {
    gap: 3,
  },
  metricLabel: {
    color: assessmentColors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metricValue: {
    color: assessmentColors.charcoal,
    fontSize: 16,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  warningText: {
    color: assessmentColors.redText,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
  },
});
