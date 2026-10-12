import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  AssessmentCard,
  AssessmentScreenShell,
  ChipList,
  ProgressBar,
  StatusPill,
  assessmentColors,
  assessmentStyles,
} from "../../components/AssessmentSystemUI";
import {
  calculateProgressSnapshot,
  hdosActivityLifecycle,
  hdosAiAgents,
  hdosCoreObjects,
  runQualityChecks,
  summarizeTime,
  type HdosActivity,
  type HdosEvidence,
  type HdosOutcome,
} from "../../lib/engines/humanDevelopmentOperatingSystem";

const activities: HdosActivity[] = [
  {
    id: "activity-bedtime",
    personId: "person-demo",
    type: "home_visit",
    title: "Observe bedtime routine",
    competencyIds: ["safety", "consistency"],
    status: "evidence_generated",
    assignedAt: "2026-06-01",
    startedAt: "2026-06-03",
    completedAt: "2026-06-03",
    reviewedAt: "2026-06-05",
    generatedEvidenceIds: ["evidence-bedtime"],
    generatedFutureActivityIds: ["activity-follow-up"],
  },
  {
    id: "activity-reflection",
    personId: "person-demo",
    type: "reflection",
    title: "Reflect on calm limit setting",
    competencyIds: ["communication", "reflective_capacity"],
    status: "completed",
    assignedAt: "2026-07-01",
    startedAt: "2026-07-02",
    completedAt: "2026-07-02",
    generatedEvidenceIds: [],
    generatedFutureActivityIds: [],
  },
];

const evidence: HdosEvidence[] = [
  {
    id: "evidence-bedtime",
    type: "worker_observation",
    source: "worker",
    authorId: "worker-1",
    date: "2026-06-05",
    context: "home bedtime routine",
    competencyIds: ["safety", "consistency"],
    claimIds: ["claim-routine-consistency"],
    confidence: 78,
    strength: 82,
    reliability: 84,
    status: "accepted",
    reviewHistory: ["review-1"],
    attachmentIds: [],
    permissions: ["worker", "caseworker"],
    retention: "case retention schedule",
    independentSourceKey: "worker",
  },
  {
    id: "evidence-log",
    type: "daily_log",
    source: "parent",
    authorId: "person-demo",
    date: "2026-07-01",
    context: "home routine",
    competencyIds: ["consistency"],
    claimIds: ["claim-routine-consistency"],
    confidence: 68,
    strength: 70,
    reliability: 64,
    status: "needs_clarification",
    reviewHistory: [],
    attachmentIds: [],
    permissions: ["parent", "worker"],
    retention: "weekly review",
    independentSourceKey: "parent",
  },
];

const outcomes: HdosOutcome[] = [
  {
    id: "outcome-consistency",
    personId: "person-demo",
    competencyId: "consistency",
    pathway: ["knowledge", "understanding", "application", "behaviour", "consistency"],
    currentOutcome: "behaviour developing toward consistency",
    evidenceIds: ["evidence-bedtime"],
    reasoningIds: ["reasoning-routine"],
  },
];

const progress = calculateProgressSnapshot({ personId: "person-demo", activities, evidence, outcomes });
const timeSummary = summarizeTime({ evidence });
const qualityFlags = runQualityChecks({
  evidence,
  thresholds: {
    minimumEvidenceItems: 3,
    minimumIndependentSources: 2,
    maximumEvidenceAgeDays: 90,
    minimumContextCount: 2,
    humanReviewRequired: true,
  },
  humanReviewCompleted: false,
});

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function HumanDevelopmentOperatingSystemScreen() {
  return (
    <AssessmentScreenShell
      title="Human Development Operating System"
      subtitle="A universal architecture where people, competencies, activities, evidence, reasoning, and outcomes power every SafeSteps module."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Six Core Objects</Text>
          <Text style={assessmentStyles.cardText}>
            Every feature plugs into the same object model instead of maintaining separate logic for
            lessons, evidence, reports, dashboards, AI, and review.
          </Text>
          <View style={styles.objectGrid}>
            {hdosCoreObjects.map((object, index) => (
              <View key={object.objectType} style={styles.objectCard}>
                <Text style={styles.objectIndex}>{index + 1}</Text>
                <Text style={styles.objectTitle}>{formatLabel(object.objectType)}</Text>
                <Text style={assessmentStyles.cardText}>{object.purpose}</Text>
              </View>
            ))}
          </View>
        </AssessmentCard>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Universal Activity Lifecycle</Text>
          <Text style={assessmentStyles.cardText}>
            Lessons, challenges, uploads, assessments, observations, goals, and practice tasks move
            through the same lifecycle.
          </Text>
          <ChipList items={hdosActivityLifecycle.map(formatLabel)} />
        </AssessmentCard>

        <View style={styles.grid}>
          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Progress Engine</Text>
            <Text style={assessmentStyles.cardText}>
              Progress dimensions are tracked independently so course completion is not treated as
              demonstrated competence.
            </Text>
            {Object.entries(progress.dimensions).map(([dimension, value]) => (
              <Metric key={dimension} label={formatLabel(dimension)} value={value} />
            ))}
          </AssessmentCard>

          <AssessmentCard>
            <Text style={assessmentStyles.cardTitle}>Time Engine</Text>
            <View style={assessmentStyles.row}>
              <SmallMetric label="First demonstrated" value={timeSummary.firstDemonstrated ?? "Not recorded"} />
              <SmallMetric label="Most recent" value={timeSummary.mostRecentDemonstration ?? "Not recorded"} />
              <SmallMetric label="Demonstrations" value={String(timeSummary.numberOfDemonstrations)} />
              <SmallMetric label="Trend" value={formatLabel(timeSummary.evidenceTrend)} />
              <SmallMetric label="Next review" value={timeSummary.nextReviewDue ?? "Not scheduled"} />
            </View>
          </AssessmentCard>
        </View>

        <AssessmentCard tone={qualityFlags.some((flag) => flag.severity === "blocker") ? "risk" : "warning"}>
          <View style={styles.headerRow}>
            <Text style={assessmentStyles.cardTitle}>Quality Engine</Text>
            <StatusPill
              label={`${qualityFlags.length} flags`}
              tone={qualityFlags.some((flag) => flag.severity === "blocker") ? "risk" : "warning"}
            />
          </View>
          {qualityFlags.map((flag) => (
            <View key={flag.id} style={styles.flagRow}>
              <Text style={styles.flagSeverity}>{formatLabel(flag.severity)}</Text>
              <Text style={assessmentStyles.cardText}>{flag.message}</Text>
            </View>
          ))}
        </AssessmentCard>

        <AssessmentCard>
          <Text style={assessmentStyles.cardTitle}>Universal AI Architecture</Text>
          <Text style={assessmentStyles.cardText}>
            Specialised assistants share the same evidence model and keep significant outputs
            reviewable by humans where required.
          </Text>
          <View style={styles.agentGrid}>
            {hdosAiAgents.map((agent) => (
              <View key={agent.id} style={styles.agentCard}>
                <Text style={styles.agentTitle}>{formatLabel(agent.id)}</Text>
                <Text style={assessmentStyles.cardText}>{agent.purpose}</Text>
                <StatusPill
                  label={agent.requiresHumanReview ? "Human review" : "Support only"}
                  tone={agent.requiresHumanReview ? "warning" : "success"}
                />
              </View>
            ))}
          </View>
        </AssessmentCard>
      </ScrollView>
    </AssessmentScreenShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricLine}>
        <Text style={assessmentStyles.metaLabel}>{label}</Text>
        <Text style={assessmentStyles.metaValue}>{value}%</Text>
      </View>
      <ProgressBar value={value} />
    </View>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={assessmentStyles.splitItem}>
      <Text style={assessmentStyles.metaLabel}>{label}</Text>
      <Text style={assessmentStyles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: 24,
  },
  objectGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  objectCard: {
    flexGrow: 1,
    flexBasis: 240,
    gap: 7,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  objectIndex: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    color: assessmentColors.tealDark,
    backgroundColor: assessmentColors.sage,
    fontSize: 12,
    fontWeight: "900",
  },
  objectTitle: {
    color: assessmentColors.charcoal,
    fontSize: 18,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  metric: {
    gap: 6,
  },
  metricLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  flagRow: {
    gap: 4,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4AAA3",
    backgroundColor: "#FFF8F7",
  },
  flagSeverity: {
    color: assessmentColors.redText,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  agentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  agentCard: {
    flexGrow: 1,
    flexBasis: 230,
    gap: 7,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: assessmentColors.border,
    backgroundColor: "#FFFFFF",
  },
  agentTitle: {
    color: assessmentColors.charcoal,
    fontSize: 16,
    fontWeight: "900",
    textTransform: "capitalize",
  },
});
